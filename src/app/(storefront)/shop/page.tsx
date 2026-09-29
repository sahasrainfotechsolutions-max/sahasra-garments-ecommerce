import React from 'react';
import prisma from '@/lib/prisma';
import { getStoreConfig, getStoreId } from '@/lib/store-config';
import { ShopFilters } from '@/components/storefront/ShopFilters';
import { ProductGrid } from '@/components/storefront/ProductGrid';
import { ProductItem } from '@/types';
import { Prisma } from '@prisma/client';

export const revalidate = 0;

interface ShopPageProps {
  searchParams: {
    category?: string;
    brand?: string;
    size?: string;
    color?: string;
    sort?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const config = await getStoreConfig();
  const storeId = await getStoreId();

  const { category, brand, size, color, sort = 'featured', q, minPrice, maxPrice } = searchParams;

  // Build Prisma where query
  const where: Prisma.ProductWhereInput = {
    storeId,
    isPublished: true,
  };

  if (category) {
    where.category = {
      OR: [{ slug: category }, { parent: { slug: category } }],
    };
  }

  if (brand) {
    where.brand = { slug: brand };
  }

  if (minPrice || maxPrice) {
    where.basePrice = {
      ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
      ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
    };
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { sku: { contains: q, mode: 'insensitive' } },
      { tags: { contains: q, mode: 'insensitive' } },
      { fabric: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (size || color) {
    where.variants = {
      some: {
        isActive: true,
        ...(size ? { size: { equals: size, mode: 'insensitive' } } : {}),
        ...(color ? { color: { equals: color, mode: 'insensitive' } } : {}),
      },
    };
  }

  // Determine sort order
  let orderBy: Prisma.ProductOrderByWithRelationInput[] = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
  if (sort === 'newest') {
    orderBy = [{ createdAt: 'desc' }];
  } else if (sort === 'price_asc') {
    orderBy = [{ basePrice: 'asc' }];
  } else if (sort === 'price_desc') {
    orderBy = [{ basePrice: 'desc' }];
  } else if (sort === 'popular') {
    orderBy = [{ isBestseller: 'desc' }, { createdAt: 'desc' }];
  }

  // Fetch products
  const productsDb = await prisma.product.findMany({
    where,
    orderBy,
    include: {
      images: { orderBy: { displayOrder: 'asc' } },
      variants: { where: { isActive: true } },
      category: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true, slug: true } },
    },
  });

  // Fetch filter aggregations
  const categoriesDb = await prisma.category.findMany({
    where: { storeId, isActive: true },
    orderBy: { displayOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  });

  const brandsDb = await prisma.brand.findMany({
    where: { storeId, isActive: true },
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });

  const allVariants = await prisma.productVariant.findMany({
    where: { product: { storeId, isPublished: true }, isActive: true },
    select: { size: true, color: true },
  });

  const distinctSizes = Array.from(new Set(allVariants.map((v) => v.size).filter(Boolean)));
  const distinctColors = Array.from(new Set(allVariants.map((v) => v.color).filter(Boolean)));

  const products: ProductItem[] = productsDb as unknown as ProductItem[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-neutral-900 tracking-tight">
          {category ? `${category.replace(/-/g, ' ')} Collection` : 'All Garments & Fashion'}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1.5">
          Explore artisanal weaves, contemporary silhouettes, and handcrafted luxury garments.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <ShopFilters
            categories={categoriesDb.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              count: c._count.products,
            }))}
            brands={brandsDb.map((b) => ({
              id: b.id,
              name: b.name,
              slug: b.slug,
              count: b._count.products,
            }))}
            sizes={distinctSizes}
            colors={distinctColors}
            totalProducts={products.length}
          />
        </div>

        {/* Product Grid */}
        <div className="flex-1 w-full">
          <ProductGrid
            products={products}
            currencySymbol={config.currencySymbol}
            columns={3}
            emptyTitle="No garments match your filters"
            emptyDescription="Try clearing some filter options or searching for a different keyword."
          />
        </div>
      </div>
    </div>
  );
}
