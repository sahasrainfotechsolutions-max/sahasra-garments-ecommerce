import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { getStoreId } from '@/lib/store-config';

export const dynamic = 'force-dynamic';

/**
 * GET /api/wishlist
 * Fetches the wishlist for the current authenticated customer and store.
 * For guest users, accepts ?ids=id1,id2 to fetch product details scoped to the store.
 */
export async function GET(request: Request) {
  try {
    const session = await getSession();
    const storeId = await getStoreId(session?.storeId);
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');

    // Authenticated customer flow
    if (session?.id) {
      const wishlist = await prisma.wishlist.findFirst({
        where: {
          userId: session.id,
          storeId,
        },
        include: {
          items: {
            orderBy: { createdAt: 'desc' },
            include: {
              product: {
                include: {
                  images: { orderBy: { displayOrder: 'asc' } },
                  variants: { where: { isActive: true } },
                  category: { select: { id: true, name: true, slug: true } },
                  brand: { select: { id: true, name: true, slug: true } },
                },
              },
            },
          },
        },
      });

      if (!wishlist) {
        return NextResponse.json({
          success: true,
          items: [],
          productIds: [],
          count: 0,
        });
      }

      // Filter only published products
      const validItems = wishlist.items.filter((item) => item.product && item.product.isPublished);
      const productIds = validItems.map((item) => item.productId);

      return NextResponse.json({
        success: true,
        items: validItems.map((item) => ({
          id: item.id,
          productId: item.productId,
          product: item.product,
        })),
        productIds,
        count: productIds.length,
      });
    }

    // Guest user flow: resolve provided product IDs
    if (idsParam) {
      const ids = idsParam.split(',').filter(Boolean);
      if (ids.length === 0) {
        return NextResponse.json({ success: true, items: [], productIds: [], count: 0 });
      }

      const products = await prisma.product.findMany({
        where: {
          storeId,
          id: { in: ids },
          isPublished: true,
        },
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          variants: { where: { isActive: true } },
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
        },
      });

      return NextResponse.json({
        success: true,
        items: products.map((p) => ({
          id: p.id,
          productId: p.id,
          product: p,
        })),
        productIds: products.map((p) => p.id),
        count: products.length,
      });
    }

    return NextResponse.json({
      success: true,
      items: [],
      productIds: [],
      count: 0,
    });
  } catch (error: any) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/wishlist
 * Toggles or adds a product to the customer's wishlist.
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    const storeId = await getStoreId(session?.storeId);
    const body = await request.json();
    const { productId, action = 'toggle' } = body;

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Verify product exists in this store and is published
    const product = await prisma.product.findFirst({
      where: { id: productId, storeId, isPublished: true },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found in this store' }, { status: 404 });
    }

    // If authenticated, persist to PostgreSQL
    if (session?.id) {
      // Find or create customer's wishlist record scoped to storeId
      let wishlist = await prisma.wishlist.findFirst({
        where: { userId: session.id, storeId },
      });

      if (!wishlist) {
        wishlist = await prisma.wishlist.create({
          data: {
            userId: session.id,
            storeId,
          },
        });
      }

      const existingItem = await prisma.wishlistItem.findUnique({
        where: {
          wishlistId_productId: {
            wishlistId: wishlist.id,
            productId,
          },
        },
      });

      let inWishlist = false;

      if (action === 'remove' || (action === 'toggle' && existingItem)) {
        if (existingItem) {
          await prisma.wishlistItem.delete({
            where: { id: existingItem.id },
          });
        }
        inWishlist = false;
      } else {
        if (!existingItem) {
          await prisma.wishlistItem.create({
            data: {
              wishlistId: wishlist.id,
              productId,
            },
          });
        }
        inWishlist = true;
      }

      const allItems = await prisma.wishlistItem.findMany({
        where: { wishlistId: wishlist.id },
        select: { productId: true },
      });

      const productIds = allItems.map((i) => i.productId);

      return NextResponse.json({
        success: true,
        inWishlist,
        count: productIds.length,
        productIds,
      });
    }

    // If guest, respond with success for client-side storage
    return NextResponse.json({
      success: true,
      guest: true,
      productId,
    });
  } catch (error: any) {
    console.error('Error modifying wishlist:', error);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}

/**
 * DELETE /api/wishlist
 * Removes a product from customer's wishlist.
 */
export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    const storeId = await getStoreId(session?.storeId);
    const { searchParams } = new URL(request.url);
    let productId = searchParams.get('productId');

    if (!productId) {
      try {
        const body = await request.json();
        productId = body.productId;
      } catch {}
    }

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    if (session?.id) {
      const wishlist = await prisma.wishlist.findFirst({
        where: { userId: session.id, storeId },
      });

      if (wishlist) {
        await prisma.wishlistItem.deleteMany({
          where: {
            wishlistId: wishlist.id,
            productId,
          },
        });

        const allItems = await prisma.wishlistItem.findMany({
          where: { wishlistId: wishlist.id },
          select: { productId: true },
        });

        const productIds = allItems.map((i) => i.productId);

        return NextResponse.json({
          success: true,
          count: productIds.length,
          productIds,
        });
      }
    }

    return NextResponse.json({ success: true, guest: true, productId });
  } catch (error: any) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
