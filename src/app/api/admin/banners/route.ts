import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { getStoreId } from '@/lib/store-config';

export async function GET() {
  try {
    const session = await requireAdmin();
    const storeId = await getStoreId(session.storeId);

    const banners = await prisma.banner.findMany({
      where: { storeId },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json({ banners });
  } catch (error: any) {
    return NextResponse.json({ error: 'Unauthorized or Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const storeId = await getStoreId(session.storeId);

    const { title, subtitle, imageUrl, ctaText, ctaUrl, position = 'HERO', displayOrder = 0, isActive = true } = body;

    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'Title and Image URL are required' }, { status: 400 });
    }

    const banner = await prisma.banner.create({
      data: {
        storeId,
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
    return NextResponse.json({ error: error.message || 'Failed to create banner' }, { status: 500 });
  }
}
