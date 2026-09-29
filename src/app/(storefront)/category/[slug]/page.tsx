import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getStoreConfig, getStoreId } from '@/lib/store-config';
import { ProductGrid } from '@/components/storefront/ProductGrid';
import { ProductItem } from '@/types';
import type { Metadata } from 'next';

export const revalidate = 0;

interface CategoryPageProps {
  params: { slug: string };
  searchParams: { sort?: string };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const storeId = await getStoreId();
  if (params.slug === 'new-arrivals') {
    return {
      title: 'New Arrivals Collection | Sahasra Fashion',
      description: 'Discover the latest designer sarees, kurtis, menswear, and fashion arrivals.',
    };
  }

  const category = await prisma.category.findUnique({
    where: { storeId_slug: { storeId, slug: params.slug } },
  });

  if (!category) return { title: 'Category Not Found' };

  return {
    title: `${category.name} Collection`,
    description: category.description || `Browse our latest ${category.name} collection.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const config = await getStoreConfig();
  const storeId = await getStoreId();
  const isNewArrivals = params.slug === 'new-arrivals';

  const category = await prisma.category.findUnique({
    where: { storeId_slug: { storeId, slug: params.slug } },
    include: {
      children: { where: { isActive: true }, orderBy: { displayOrder: 'asc' } },
    },
  });

  if (!category && !isNewArrivals) {
    notFound();
  }

  const categoryName = category?.name || 'New Arrivals';
  const categoryDescription = category?.description || 'Explore the freshest fashion arrivals and seasonal collections.';
  const childCategoryIds = category?.children ? category.children.map((c) => c.id) : [];
  const relevantCategoryIds = category ? [category.id, ...childCategoryIds] : [];

  const productsDb = await prisma.product.findMany({
    where: {
      storeId,
      isPublished: true,
      ...(isNewArrivals
        ? {
            OR: [
              { isNewArrival: true },
              ...(relevantCategoryIds.length > 0 ? [{ categoryId: { in: relevantCategoryIds } }] : []),
            ],
          }
        : {
            categoryId: { in: relevantCategoryIds },
          }),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      images: { orderBy: { displayOrder: 'asc' } },
      variants: { where: { isActive: true } },
      category: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true, slug: true } },
    },
  });

  const products: ProductItem[] = productsDb as unknown as ProductItem[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Category Header */}
      <div className="border-b border-neutral-200 pb-6">
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
          <Link href="/" className="hover:text-neutral-700">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-neutral-700">
            Shop
          </Link>
          <span>/</span>
          <span className="text-neutral-900 font-semibold">{categoryName}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-serif font-black text-neutral-900 tracking-tight">
          {categoryName}
        </h1>
        {categoryDescription && (
          <p className="text-xs sm:text-sm text-neutral-500 mt-2 max-w-2xl">
            {categoryDescription}
          </p>
        )}

        {/* Subcategories Filter Chips */}
        {category?.children && category.children.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4">
            <span className="text-xs font-semibold text-neutral-400 self-center mr-1">
              Subcategories:
            </span>
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/category/${child.slug}`}
                className="px-3 py-1.5 rounded-full border border-neutral-200 bg-white text-xs font-medium text-neutral-700 hover:border-amber-700 hover:text-amber-800 transition"
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div>
        <div className="mb-4 text-xs text-neutral-500">
          Showing <strong>{products.length}</strong> items in {categoryName}
        </div>
        <ProductGrid
          products={products}
          currencySymbol={config.currencySymbol}
          columns={4}
          emptyTitle={`No items currently in ${categoryName}`}
          emptyDescription="Check back soon as we are adding new garments continuously."
        />
      </div>
    </div>
  );
}
