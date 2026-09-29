import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    const existing = await prisma.coupon.findFirst({
      where: { id: params.id, storeId: session.storeId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Coupon not found in this store' }, { status: 404 });
    }

    const body = await request.json();
    const { code, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, isActive } = body;

    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        code: code?.trim().toUpperCase(),
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
    return NextResponse.json({ error: error.message || 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    const existing = await prisma.coupon.findFirst({
      where: { id: params.id, storeId: session.storeId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Coupon not found in this store' }, { status: 404 });
    }

    await prisma.coupon.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
