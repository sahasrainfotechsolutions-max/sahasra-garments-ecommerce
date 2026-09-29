import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    const existing = await prisma.banner.findFirst({
      where: { id: params.id, storeId: session.storeId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Banner not found in this store' }, { status: 404 });
    }

    const body = await request.json();
    const { title, subtitle, imageUrl, ctaText, ctaUrl, position, displayOrder, isActive } = body;

    const banner = await prisma.banner.update({
      where: { id: params.id },
      data: {
        title,
        subtitle,
        imageUrl,
        ctaText,
        ctaUrl,
        position,
        displayOrder: parseInt(displayOrder) || 0,
        isActive,
      },
    });

    return NextResponse.json({ success: true, banner });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update banner' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    const existing = await prisma.banner.findFirst({
      where: { id: params.id, storeId: session.storeId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Banner not found in this store' }, { status: 404 });
    }

    await prisma.banner.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
