import React from 'react';
import prisma from '@/lib/prisma';
import { getStoreId } from '@/lib/store-config';
import { BannerManager } from '@/components/admin/BannerManager';

export const revalidate = 0;

export default async function AdminBannersPage() {
  const storeId = await getStoreId();

  const banners = await prisma.banner.findMany({
    where: { storeId },
    orderBy: { displayOrder: 'asc' },
  });

  return <BannerManager initialBanners={banners as any} />;
}
