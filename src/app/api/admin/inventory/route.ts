import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'all', 'low'
    const storeId = session.storeId;

    const inventories = await prisma.inventory.findMany({
      where: {
        variant: { product: { storeId } },
        ...(filter === 'low' ? { currentStock: { lte: 5 } } : {}),
      },
      include: {
        variant: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, category: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { currentStock: 'asc' },
    });

    return NextResponse.json({ inventories });
  } catch (error: any) {
    return NextResponse.json({ error: 'Unauthorized or Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const { variantId, currentStock, lowStockThreshold } = body;

    if (!variantId || currentStock === undefined) {
      return NextResponse.json({ error: 'variantId and currentStock are required' }, { status: 400 });
    }

    // Verify variant belongs to the admin's store
    const existingVariant = await prisma.productVariant.findFirst({
      where: {
        id: variantId,
        product: { storeId: session.storeId },
      },
    });

    if (!existingVariant) {
      return NextResponse.json({ error: 'Variant not found in this store' }, { status: 404 });
    }

    const safeStock = Math.max(0, parseInt(currentStock));

    // Update variant and inventory synchronously
    const [inv, variant] = await prisma.$transaction([
      prisma.inventory.upsert({
        where: { variantId },
        update: {
          currentStock: safeStock,
          ...(lowStockThreshold !== undefined ? { lowStockThreshold: parseInt(lowStockThreshold) } : {}),
        },
        create: {
          variantId,
          currentStock: safeStock,
          lowStockThreshold: lowStockThreshold !== undefined ? parseInt(lowStockThreshold) : 5,
        },
      }),
      prisma.productVariant.update({
        where: { id: variantId },
        data: { stock: safeStock },
      }),
    ]);

    return NextResponse.json({ success: true, inventory: inv, variant });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update inventory' }, { status: 500 });
  }
}
