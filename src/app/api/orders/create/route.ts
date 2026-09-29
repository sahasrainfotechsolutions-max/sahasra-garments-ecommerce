import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { generateOrderNumber } from '@/lib/utils';
import { getStoreId } from '@/lib/store-config';
import { CartLineItem, OrderCustomerInfo, OrderShippingAddress, PaymentMethod } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer,
      address,
      items,
      couponCode,
      paymentMethod = 'COD',
      notes,
    }: {
      customer: OrderCustomerInfo;
      address: OrderShippingAddress;
      items: CartLineItem[];
      couponCode?: string;
      paymentMethod: PaymentMethod;
      notes?: string;
    } = body;

    if (!customer?.name || !customer?.email || !customer?.phone) {
      return NextResponse.json({ error: 'Customer information is required' }, { status: 400 });
    }

    if (!address?.addressLine1 || !address?.city || !address?.state || !address?.pincode) {
      return NextResponse.json({ error: 'Valid delivery address is required' }, { status: 400 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one garment' }, { status: 400 });
    }

    const session = await getSession();
    const storeId = await getStoreId(session?.storeId);

    // Fetch store settings for shipping and tax calculations
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId },
          { code: storeId },
        ],
      },
      include: { settings: true },
    });

    const settings = store?.settings;
    const shippingCharge = settings?.shippingCharge ?? 99;
    const freeShippingThreshold = settings?.freeShippingThreshold ?? 999;
    const taxPercentage = settings?.taxPercentage ?? 5.0;

    // Calculate subtotal from database prices to prevent tampering
    let subtotal = 0;
    interface OrderItemCreateData {
      productId: string;
      variantId: string | null;
      productName: string;
      variantTitle: string | null;
      sku: string;
      unitPrice: number;
      quantity: number;
      totalPrice: number;
      taxAmount: number;
    }
    const orderItemsData: OrderItemCreateData[] = [];

    for (const item of items) {
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const dbProduct = await prisma.product.findFirst({
        where: { id: item.productId, storeId },
        include: { variants: true },
      });

      if (!dbProduct) {
        return NextResponse.json({ error: `Product not found: ${item.productName}` }, { status: 404 });
      }

      // Prioritize exact variantId matching so different sizes of the same product are preserved
      let variant = null;
      if (item.variantId) {
        variant = dbProduct.variants.find((v) => v.id === item.variantId);
      }
      if (!variant && item.sku) {
        variant = dbProduct.variants.find((v) => v.sku === item.sku);
      }

      const unitPrice = variant?.price ?? dbProduct.basePrice;

      // Check stock before starting checkout transaction
      if (variant && variant.stock < quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${dbProduct.name} (${variant.size} / ${variant.color}). Available: ${variant.stock}, requested: ${quantity}.`,
          },
          { status: 400 }
        );
      }

      const itemTotal = unitPrice * quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        productId: dbProduct.id,
        variantId: variant?.id || null,
        productName: dbProduct.name,
        variantTitle: variant
          ? `Color: ${variant.color}, Size: ${variant.size}`
          : item.size
          ? `Size: ${item.size}`
          : null,
        sku: variant?.sku || dbProduct.sku,
        unitPrice,
        quantity,
        totalPrice: itemTotal,
        taxAmount: Math.round((itemTotal * taxPercentage) / 100),
      });
    }

    // Coupon discount calculation
    let discountAmount = 0;
    let validatedCoupon = null;

    if (couponCode) {
      validatedCoupon = await prisma.coupon.findUnique({
        where: { storeId_code: { storeId, code: couponCode.toUpperCase() } },
      });

      if (validatedCoupon && validatedCoupon.isActive && subtotal >= validatedCoupon.minOrderValue) {
        if (validatedCoupon.discountType === 'PERCENTAGE') {
          const rawDiscount = (subtotal * validatedCoupon.discountValue) / 100;
          discountAmount = validatedCoupon.maxDiscount
            ? Math.min(rawDiscount, validatedCoupon.maxDiscount)
            : rawDiscount;
        } else {
          discountAmount = Math.min(validatedCoupon.discountValue, subtotal);
        }
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const shippingFee = subtotal >= freeShippingThreshold ? 0 : shippingCharge;
    const taxAmount = Math.round((discountedSubtotal * taxPercentage) / 100);
    const grandTotal = Math.round(discountedSubtotal + shippingFee + taxAmount);

    const orderNumber = generateOrderNumber();

    // Check or create customer record
    let customerRecord = null;
    if (session?.id) {
      customerRecord = await prisma.customer.findUnique({
        where: { userId: session.id },
      });
    }

    if (!customerRecord) {
      const existingCustomer = await prisma.customer.findFirst({
        where: { storeId, email: customer.email },
      });

      if (existingCustomer) {
        customerRecord = existingCustomer;
      } else {
        customerRecord = await prisma.customer.create({
          data: {
            storeId,
            userId: session?.id || null,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
          },
        });
      }
    }

    // Create Order and decrement stock inside transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          storeId,
          orderNumber,
          userId: session?.id || null,
          customerId: customerRecord?.id || null,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          shippingAddress: address as any,
          subtotal,
          discountAmount,
          couponCode: validatedCoupon ? validatedCoupon.code : null,
          shippingFee,
          taxAmount,
          grandTotal,
          status: 'CONFIRMED',
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
          paymentMethod,
          notes,
          items: {
            create: orderItemsData,
          },
          payments: {
            create: [
              {
                amount: grandTotal,
                method: paymentMethod,
                status: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
                transactionRef:
                  paymentMethod === 'COD'
                    ? `COD-${orderNumber}`
                    : `ONLINE-TXN-${Date.now()}`,
              },
            ],
          },
        },
      });

      // Decrement inventory stock atomically
      for (const item of orderItemsData) {
        if (item.variantId) {
          const variantUpdate = await tx.productVariant.updateMany({
            where: {
              id: item.variantId,
              stock: { gte: item.quantity },
            },
            data: {
              stock: { decrement: item.quantity },
            },
          });

          if (variantUpdate.count === 0) {
            throw new Error(`Insufficient stock for ${item.productName} (${item.variantTitle || 'selected variant'}). It may have just sold out.`);
          }

          await tx.inventory.updateMany({
            where: { variantId: item.variantId },
            data: {
              currentStock: { decrement: item.quantity },
              soldQuantity: { increment: item.quantity },
            },
          });
        }
      }

      // Update coupon usage count atomically
      if (validatedCoupon) {
        const couponUpdate = await tx.coupon.updateMany({
          where: {
            id: validatedCoupon.id,
            OR: [
              { usageLimit: null },
              { usageLimit: { gt: validatedCoupon.usageCount } },
            ],
          },
          data: { usageCount: { increment: 1 } },
        });

        if (couponUpdate.count === 0) {
          throw new Error('This coupon has reached its maximum usage limit.');
        }

        await tx.couponUsage.create({
          data: {
            couponId: validatedCoupon.id,
            orderId: newOrder.id,
            userId: session?.id || null,
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    const errorMessage = error?.message && (
      error.message.includes('Insufficient stock') ||
      error.message.includes('coupon')
    ) ? error.message : 'Failed to place order. Please try again.';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
