import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    const product = await prisma.product.findFirst({
      where: { id: params.id, storeId: session.storeId },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        variants: { include: { inventory: true } },
        category: true,
        brand: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    return NextResponse.json({ error: 'Unauthorized or Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    const existing = await prisma.product.findFirst({
      where: { id: params.id, storeId: session.storeId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Product not found in this store' }, { status: 404 });
    }

    const body = await request.json();

    const {
      name,
      slug,
      sku,
      shortDescription,
      description,
      categoryId,
      brandId,
      basePrice,
      mrp,
      discountPercent,
      taxPercent,
      fabric,
      careInstructions,
      specifications,
      tags,
      isPublished,
      isFeatured,
      isNewArrival,
      isBestseller,
      images,
      variants,
    } = body;

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.product.update({
        where: { id: params.id },
        data: {
          name,
          slug,
          sku,
          shortDescription,
          description,
          categoryId,
          brandId: brandId || null,
          basePrice: parseFloat(basePrice),
          mrp: parseFloat(mrp || basePrice),
          discountPercent: parseFloat(discountPercent || 0),
          taxPercent: parseFloat(taxPercent || 5.0),
          fabric,
          careInstructions,
          specifications,
          tags,
          isPublished,
          isFeatured,
          isNewArrival,
          isBestseller,
        },
      });

      // Update images if provided
      if (images) {
        await tx.productImage.deleteMany({ where: { productId: params.id } });
        await tx.productImage.createMany({
          data: images.map((img: any, idx: number) => ({
            productId: params.id,
            url: img.url,
            isPrimary: idx === 0,
            displayOrder: idx,
          })),
        });
      }

      // Update variants if provided
      if (variants) {
        for (const v of variants) {
          if (v.id) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                sku: v.sku,
                size: v.size,
                color: v.color,
                colorHex: v.colorHex || null,
                stock: parseInt(v.stock || 0),
                price: v.price ? parseFloat(v.price) : parseFloat(basePrice),
                mrp: v.mrp ? parseFloat(v.mrp) : parseFloat(mrp || basePrice),
              },
            });

            await tx.inventory.upsert({
              where: { variantId: v.id },
              update: { currentStock: parseInt(v.stock || 0) },
              create: { variantId: v.id, currentStock: parseInt(v.stock || 0) },
            });
          } else {
            const newVar = await tx.productVariant.create({
              data: {
                productId: params.id,
                sku: v.sku || `${sku}-${v.size}-${v.color}`.replace(/\s+/g, '-').toUpperCase(),
                size: v.size,
                color: v.color,
                colorHex: v.colorHex || null,
                stock: parseInt(v.stock || 0),
                price: v.price ? parseFloat(v.price) : parseFloat(basePrice),
                mrp: v.mrp ? parseFloat(v.mrp) : parseFloat(mrp || basePrice),
              },
            });

            await tx.inventory.create({
              data: { variantId: newVar.id, currentStock: parseInt(v.stock || 0) },
            });
          }
        }
      }

      return p;
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    const existing = await prisma.product.findFirst({
      where: { id: params.id, storeId: session.storeId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Product not found in this store' }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
