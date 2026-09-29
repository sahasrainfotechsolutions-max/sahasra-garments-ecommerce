import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    const existing = await prisma.category.findFirst({
      where: { id: params.id, storeId: session.storeId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Category not found in this store' }, { status: 404 });
    }

    const body = await request.json();
    const { name, slug, description, imageUrl, parentId, isFeatured, isActive, displayOrder } = body;

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name,
        slug,
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
    return NextResponse.json({ error: error.message || 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    const existing = await prisma.category.findFirst({
      where: { id: params.id, storeId: session.storeId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Category not found in this store' }, { status: 404 });
    }

    await prisma.category.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
