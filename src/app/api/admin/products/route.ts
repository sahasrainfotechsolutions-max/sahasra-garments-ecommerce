import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { getStoreId } from '@/lib/store-config';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const storeId = await getStoreId(session.storeId);

    const products = await prisma.product.findMany({
      where: {
        storeId,
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { sku: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { displayOrder: 'asc' } },
        variants: true,
      },
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const storeId = await getStoreId(session.storeId);

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
      discountPercent = 0,
      taxPercent = 5.0,
      fabric,
      careInstructions,
      specifications,
      tags,
      isPublished = true,
      isFeatured = false,
      isNewArrival = false,
      isBestseller = false,
      images = [],
      variants = [],
    } = body;

    if (!name || !sku || !categoryId || basePrice === undefined) {
      return NextResponse.json({ error: 'Name, SKU, category, and price are required' }, { status: 400 });
    }

    const cleanSlug = slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Create product, images, and variants with inventory inside transaction
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          storeId,
          name,
          slug: cleanSlug,
          sku,
          shortDescription,
          description: description || '',
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

      // Insert images
      if (images && images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img: any, idx: number) => ({
            productId: created.id,
            url: img.url,
            isPrimary: idx === 0,
            displayOrder: idx,
          })),
        });
      }

      // Insert variants and initialize inventory
      if (variants && variants.length > 0) {
        for (const v of variants) {
          const variant = await tx.productVariant.create({
            data: {
              productId: created.id,
              sku: v.sku || `${sku}-${v.size}-${v.color}`.replace(/\s+/g, '-').toUpperCase(),
              size: v.size || 'Free Size',
              color: v.color || 'Standard',
              colorHex: v.colorHex || null,
              stock: parseInt(v.stock || 0),
              price: v.price ? parseFloat(v.price) : parseFloat(basePrice),
              mrp: v.mrp ? parseFloat(v.mrp) : parseFloat(mrp || basePrice),
            },
          });

          await tx.inventory.create({
            data: {
              variantId: variant.id,
              currentStock: parseInt(v.stock || 0),
              lowStockThreshold: 5,
            },
          });
        }
      }

      return created;
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}
