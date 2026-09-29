import React from 'react';
import prisma from '@/lib/prisma';
import { getStoreId } from '@/lib/store-config';
import { InventoryTable } from '@/components/admin/InventoryTable';

export const revalidate = 0;

export default async function AdminInventoryPage() {
  const storeId = await getStoreId();

  const inventories = await prisma.inventory.findMany({
    where: {
      variant: { product: { storeId } },
    },
    include: {
      variant: {
        include: {
          product: {
            select: { id: true, name: true, sku: true, category: { select: { name: true } } },
          },
        },
      },
    },
    orderBy: { currentStock: 'asc' },
  });

  return <InventoryTable initialInventories={inventories as any} />;
}
