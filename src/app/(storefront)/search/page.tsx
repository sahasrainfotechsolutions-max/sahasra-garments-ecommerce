import React from 'react';
import prisma from '@/lib/prisma';
import { getStoreConfig, getStoreId } from '@/lib/store-config';
import { ProductGrid } from '@/components/storefront/ProductGrid';
import { SearchBar } from '@/components/storefront/SearchBar';
import { ProductItem } from '@/types';

export const revalidate = 0;

interface SearchPageProps {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const config = await getStoreConfig();
  const storeId = await getStoreId();
  const query = searchParams.q?.trim() || '';

  let products: ProductItem[] = [];

  if (query) {
    const productsDb = await prisma.product.findMany({
      where: {
        storeId,
        isPublished: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { fabric: { contains: query, mode: 'insensitive' } },
          { tags: { contains: query, mode: 'insensitive' } },
          { category: { name: { contains: query, mode: 'insensitive' } } },
          { brand: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        variants: { where: { isActive: true } },
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
      },
    });

    products = productsDb as unknown as ProductItem[];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="max-w-xl mx-auto text-center space-y-4">
        <h1 className="text-3xl font-serif font-bold text-neutral-900">
          Search Master Garments
        </h1>
        <SearchBar placeholder="Search by name, fabric, color, or SKU..." />
        {query && (
          <p className="text-xs text-neutral-500">
            Showing results for <span className="font-semibold text-neutral-900">&quot;{query}&quot;</span> ({products.length} found)
          </p>
        )}
      </div>

      <div className="pt-4">
        <ProductGrid
          products={products}
          currencySymbol={config.currencySymbol}
          columns={4}
          emptyTitle={query ? `No items found for "${query}"` : 'Begin your search'}
          emptyDescription={
            query
              ? 'Try using broader keywords like "silk", "shirt", "linen", or "kurti".'
              : 'Type what you are looking for in the search bar above.'
          }
        />
      </div>
    </div>
  );
}
