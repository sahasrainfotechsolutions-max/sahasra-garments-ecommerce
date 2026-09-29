import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { getStoreId } from '@/lib/store-config';

export async function GET() {
  try {
    const session = await requireAdmin();
    const storeId = await getStoreId(session.storeId);

    const coupons = await prisma.coupon.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { usages: true } } },
    });

    return NextResponse.json({ coupons });
  } catch (error: any) {
    return NextResponse.json({ error: 'Unauthorized or Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const storeId = await getStoreId(session.storeId);

    const {
      code,
      discountType,
      discountValue,
      minOrderValue = 0,
      maxDiscount,
      usageLimit,
      isActive = true,
    } = body;

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: 'Code, type, and value are required' }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        storeId,
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderValue: parseFloat(minOrderValue || 0),
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        isActive,
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create coupon' }, { status: 500 });
  }
}
