import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { getStoreId } from '@/lib/store-config';

export async function GET() {
  try {
    const session = await requireAdmin();
    const storeId = await getStoreId(session.storeId);

    const categories = await prisma.category.findMany({
      where: { storeId },
      orderBy: { displayOrder: 'asc' },
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json({ error: 'Unauthorized or Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const storeId = await getStoreId(session.storeId);
    const body = await request.json();

    const { name, slug, description, imageUrl, parentId, isFeatured = false, isActive = true, displayOrder = 0 } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const cleanSlug = slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const category = await prisma.category.create({
      data: {
        storeId,
        name,
        slug: cleanSlug,
        description,
        imageUrl: imageUrl || null,
        parentId: parentId || null,
        isFeatured,
        isActive,
        displayOrder: parseInt(displayOrder) || 0,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
  }
}
