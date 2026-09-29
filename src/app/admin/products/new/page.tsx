import React from 'react';
import prisma from '@/lib/prisma';
import { getStoreId } from '@/lib/store-config';
import { ProductForm } from '@/components/admin/ProductForm';

export const revalidate = 0;

export default async function NewProductPage() {
  const storeId = await getStoreId();

  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      where: { storeId, isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.brand.findMany({
      where: { storeId, isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  return <ProductForm categories={categories} brands={brands} isEditing={false} />;
}
