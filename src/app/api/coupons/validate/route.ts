import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code')?.trim().toUpperCase();
    const amount = parseFloat(searchParams.get('amount') || '0');
    const storeCode = process.env.DEFAULT_STORE_ID || 'default-store';
    const store = await prisma.store.findUnique({
      where: { code: storeCode },
    });
    const storeId = store ? store.id : storeCode;

    if (!code) {
      return NextResponse.json({ valid: false, message: 'Coupon code required' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { storeId_code: { storeId, code } },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ valid: false, message: 'Invalid or expired coupon code' }, { status: 404 });
    }

    // Check dates if set
    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) {
      return NextResponse.json({ valid: false, message: 'This coupon is not active yet' }, { status: 400 });
    }
    if (coupon.endDate && coupon.endDate < now) {
      return NextResponse.json({ valid: false, message: 'This coupon has expired' }, { status: 400 });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ valid: false, message: 'This coupon usage limit has been reached' }, { status: 400 });
    }

    // Check min order value
    if (amount < coupon.minOrderValue) {
      return NextResponse.json(
        {
          valid: false,
          message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
        maxDiscount: coupon.maxDiscount,
      },
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ valid: false, message: 'Server error validating coupon' }, { status: 500 });
  }
}
