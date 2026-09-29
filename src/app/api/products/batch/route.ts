import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStoreId } from '@/lib/store-config';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json({ products: [] });
    }

    const ids = idsParam.split(',').filter(Boolean);
    const storeId = await getStoreId();

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

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching batch products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
