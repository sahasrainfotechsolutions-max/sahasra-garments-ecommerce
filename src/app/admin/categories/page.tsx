import React from 'react';
import prisma from '@/lib/prisma';
import { getStoreId } from '@/lib/store-config';
import { CategoryManager } from '@/components/admin/CategoryManager';

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const storeId = await getStoreId();

  const categories = await prisma.category.findMany({
    where: { storeId },
    orderBy: { displayOrder: 'asc' },
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { products: true } },
    },
  });

  return <CategoryManager initialCategories={categories as any} />;
}
