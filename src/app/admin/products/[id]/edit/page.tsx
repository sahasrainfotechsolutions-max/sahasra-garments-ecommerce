import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getStoreId } from '@/lib/store-config';
import { ProductForm } from '@/components/admin/ProductForm';

export const revalidate = 0;

interface EditProductPageProps {
  params: { id: string };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const storeId = await getStoreId();

  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        variants: { orderBy: { sku: 'asc' } },
      },
    }),
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

  if (!product) {
    notFound();
  }

  return (
    <ProductForm
      initialData={product}
      categories={categories}
      brands={brands}
      isEditing={true}
    />
  );
}
