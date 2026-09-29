import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getStoreConfig, getStoreId } from '@/lib/store-config';
import { ProductGallery } from '@/components/storefront/ProductGallery';
import { ProductVariantSelector } from '@/components/storefront/ProductVariantSelector';
import { ProductGrid } from '@/components/storefront/ProductGrid';
import { ProductItem } from '@/types';
import { ShieldCheck, Truck, RotateCcw, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 0;

interface ProductPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const storeId = await getStoreId();
  const product = await prisma.product.findUnique({
    where: { storeId_slug: { storeId, slug: params.slug } },
    include: { images: true },
  });

  if (!product) return { title: 'Product Not Found' };

  return {
    title: product.name,
    description: product.shortDescription || product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description.slice(0, 160),
      images: product.images[0]?.url ? [{ url: product.images[0].url }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const config = await getStoreConfig();
  const storeId = await getStoreId();

  const productDb = await prisma.product.findUnique({
    where: { storeId_slug: { storeId, slug: params.slug } },
    include: {
      images: { orderBy: { displayOrder: 'asc' } },
      variants: { where: { isActive: true }, orderBy: { sku: 'asc' } },
      category: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!productDb || !productDb.isPublished) {
    notFound();
  }

  // Fetch related products in the same category
  const relatedDbProducts = await prisma.product.findMany({
    where: {
      storeId,
      categoryId: productDb.categoryId,
      id: { not: productDb.id },
      isPublished: true,
    },
    take: 4,
    include: {
      images: { orderBy: { displayOrder: 'asc' } },
      variants: { where: { isActive: true } },
      category: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true, slug: true } },
    },
  });

  const product: ProductItem = productDb as unknown as ProductItem;
  const relatedProducts: ProductItem[] = relatedDbProducts as unknown as ProductItem[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-neutral-700">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-neutral-700">
          Shop
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/category/${product.category.slug}`} className="hover:text-neutral-700">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-neutral-800 font-semibold truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Right Column: Information & Garment Variant Selector */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span className="uppercase tracking-widest font-bold text-amber-700">
                {product.brand?.name || 'Sahasra'}
              </span>
              <span className="font-mono text-[11px] text-neutral-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-black text-neutral-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {product.shortDescription && (
              <p className="text-xs sm:text-sm text-neutral-600 mt-2.5 leading-relaxed font-light">
                {product.shortDescription}
              </p>
            )}
          </div>

          {/* Interactive Garment Variant Selector */}
          <ProductVariantSelector
            product={product}
            currencySymbol={config.currencySymbol}
            whatsappNumber={config.whatsapp}
            storeName={config.storeName}
          />

          {/* Trust Value Badges */}
          <div className="grid grid-cols-3 gap-3 py-4 border-y border-neutral-150 text-center">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck size={18} className="text-amber-700" />
              <span className="text-[11px] font-semibold text-neutral-800">100% Authentic</span>
              <span className="text-[10px] text-neutral-400">Direct from artisans</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Truck size={18} className="text-amber-700" />
              <span className="text-[11px] font-semibold text-neutral-800">Fast Shipping</span>
              <span className="text-[10px] text-neutral-400">Dispatches in 24-48h</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RotateCcw size={18} className="text-amber-700" />
              <span className="text-[11px] font-semibold text-neutral-800">7-Day Return</span>
              <span className="text-[10px] text-neutral-400">Doorstep pickup</span>
            </div>
          </div>

          {/* Specifications, Fabric & Care Tabs/Accordion */}
          <div className="space-y-4 pt-2">
            {product.fabric && (
              <div className="p-3.5 rounded-xl bg-neutral-100/70 border border-neutral-200/60 text-xs">
                <span className="font-semibold text-neutral-900 block mb-0.5">
                  Fabric & Weave:
                </span>
                <span className="text-neutral-600">{product.fabric}</span>
              </div>
            )}

            {product.careInstructions && (
              <div className="p-3.5 rounded-xl bg-neutral-100/70 border border-neutral-200/60 text-xs">
                <span className="font-semibold text-neutral-900 block mb-0.5">
                  Care Instructions:
                </span>
                <span className="text-neutral-600">{product.careInstructions}</span>
              </div>
            )}

            {product.specifications && (
              <div className="p-3.5 rounded-xl bg-neutral-100/70 border border-neutral-200/60 text-xs">
                <span className="font-semibold text-neutral-900 block mb-0.5">
                  Garment Specifications:
                </span>
                <span className="text-neutral-600">{product.specifications}</span>
              </div>
            )}

            {/* Full Product Description */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2">
                About this Garment
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-neutral-200 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
                You May Also Admire
              </span>
              <h2 className="text-2xl font-serif font-bold text-neutral-900 mt-0.5">
                Related Garments
              </h2>
            </div>
          </div>
          <ProductGrid products={relatedProducts} currencySymbol={config.currencySymbol} />
        </section>
      )}
    </div>
  );
}
