import React from 'react';
import prisma from '@/lib/prisma';
import { getStoreId } from '@/lib/store-config';
import { CouponManager } from '@/components/admin/CouponManager';

export const revalidate = 0;

export default async function AdminCouponsPage() {
  const storeId = await getStoreId();

  const coupons = await prisma.coupon.findMany({
    where: { storeId },
    orderBy: { createdAt: 'desc' },
  });

  return <CouponManager initialCoupons={coupons as any} />;
}
