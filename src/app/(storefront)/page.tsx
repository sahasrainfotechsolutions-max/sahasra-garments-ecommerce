import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { getStoreConfig, getStoreId } from '@/lib/store-config';
import { ProductGrid } from '@/components/storefront/ProductGrid';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';
import { ProductItem } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const config = await getStoreConfig();
  const storeId = await getStoreId();

  // Fetch Hero and Promo Banners
  const banners = await prisma.banner.findMany({
    where: { storeId, isActive: true },
    orderBy: { displayOrder: 'asc' },
  });

  const heroBanner = banners.find((b) => b.position === 'HERO') || {
    title: 'Timeless Luxury, Crafted for Celebrations',
    subtitle: 'Hand-woven heritage sarees, bespoke suits & designer festive couture.',
    imageUrl:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=85',
    ctaText: 'Explore New Collection',
    ctaUrl: '/shop',
  };

  const promoBanner = banners.find((b) => b.position === 'PROMO_1') || {
    title: 'The Royal Wedding Edit',
    subtitle: 'Exclusive Pure Silk Sarees & Sherwanis with Authentic Zari Weaves',
    imageUrl:
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1800&q=85',
    ctaText: 'View Wedding Edit',
    ctaUrl: '/category/women-sarees',
  };

  // Fetch Featured Categories
  const categories = await prisma.category.findMany({
    where: { storeId, isActive: true, parentId: null },
    take: 4,
    orderBy: { displayOrder: 'asc' },
    include: {
      _count: { select: { products: true } },
    },
  });

  // Fetch Featured Products
  const featuredDbProducts = await prisma.product.findMany({
    where: { storeId, isPublished: true, isFeatured: true },
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: {
      images: { orderBy: { displayOrder: 'asc' } },
      variants: { where: { isActive: true } },
      category: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true, slug: true } },
    },
  });

  // Fetch New Arrivals
  const newArrivalDbProducts = await prisma.product.findMany({
    where: { storeId, isPublished: true, isNewArrival: true },
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: {
      images: { orderBy: { displayOrder: 'asc' } },
      variants: { where: { isActive: true } },
      category: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true, slug: true } },
    },
  });

  const featuredProducts: ProductItem[] = featuredDbProducts as unknown as ProductItem[];
  const newArrivals: ProductItem[] = newArrivalDbProducts as unknown as ProductItem[];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[540px] sm:min-h-[620px] lg:min-h-[700px] flex items-center justify-center overflow-hidden bg-neutral-900">
        <Image
          src={heroBanner.imageUrl}
          alt={heroBanner.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-70 scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-200 text-xs font-semibold uppercase tracking-widest border border-white/20">
            <Sparkles size={14} /> Master Collection {new Date().getFullYear()}
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight leading-[1.1]">
            {heroBanner.title}
          </h1>

          <p className="text-base sm:text-xl text-neutral-200 max-w-2xl mx-auto font-light leading-relaxed">
            {heroBanner.subtitle}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={heroBanner.ctaUrl || '/shop'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-amber-700 text-white font-semibold text-sm hover:bg-amber-600 shadow-lg hover:shadow-xl transition"
            >
              {heroBanner.ctaText || 'Shop Collection'} <ArrowRight size={18} />
            </Link>
            <Link
              href="/category/women-sarees"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md border border-white/30 transition"
            >
              Browse Sarees
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
              Curated Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900 transition"
          >
            View All Categories <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-200 shadow-2xs hover:shadow-xl transition-all duration-300"
            >
              {cat.imageUrl ? (
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-white">
                  {cat.name}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-lg sm:text-xl font-serif font-bold group-hover:translate-x-1 transition-transform">
                  {cat.name}
                </h3>
                <p className="text-xs text-neutral-300 mt-0.5">
                  {cat._count?.products || 0} Exclusive Designs
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
              Handpicked Styles
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 mt-1">
              Featured Garments
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900 transition"
          >
            Explore Complete Range <ArrowRight size={14} />
          </Link>
        </div>

        <ProductGrid products={featuredProducts} currencySymbol={config.currencySymbol} />
      </section>

      {/* Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white min-h-[380px] flex items-center shadow-xl">
          <Image
            src={promoBanner.imageUrl}
            alt={promoBanner.title}
            fill
            sizes="(max-width: 1024px) 100vw, 1200px"
            className="object-cover object-center opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />

          <div className="relative z-10 p-8 sm:p-14 max-w-xl space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-600/90 text-amber-100 text-xs font-bold uppercase tracking-wider">
              Limited Edition Promo
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight">
              {promoBanner.title}
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-light">
              {promoBanner.subtitle}
            </p>
            <div className="pt-2">
              <Link
                href={promoBanner.ctaUrl || '/shop'}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-neutral-900 font-semibold text-sm hover:bg-neutral-100 transition shadow-md"
              >
                {promoBanner.ctaText || 'Claim Offer'} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
                Fresh Drops
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 mt-1">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/category/new-arrivals"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900 transition"
            >
              See All Arrivals <ArrowRight size={14} />
            </Link>
          </div>

          <ProductGrid products={newArrivals} currencySymbol={config.currencySymbol} />
        </section>
      )}

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-100/70 border border-neutral-200/80 rounded-3xl p-8 sm:p-12">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
              The Sahasra Promise
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 mt-1">
              Why Discerning Shoppers Choose Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                <Award size={24} />
              </div>
              <h3 className="text-base font-bold text-neutral-900">Artisanal Quality</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Hand-inspected natural fabrics, pure silks, and tailored fits made to last.
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                <Truck size={24} />
              </div>
              <h3 className="text-base font-bold text-neutral-900">Swift Pan-India Delivery</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Safely packaged express dispatch to every state and union territory.
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-base font-bold text-neutral-900">100% Genuine Weaves</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Silk Mark certified handlooms and direct artisan sourcing with zero middlemen.
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                <RefreshCw size={24} />
              </div>
              <h3 className="text-base font-bold text-neutral-900">Seamless Returns</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Convenient 7-day doorstep pickup exchange for wrong fits or color changes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Customer Love
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 mt-1">
            Loved by Garment Enthusiasts
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-neutral-150 shadow-2xs space-y-3">
            <div className="text-amber-500 font-bold">★★★★★</div>
            <p className="text-xs text-neutral-700 italic leading-relaxed">
              &quot;The Banarasi silk saree arrived in royal packaging! The zari gleams beautifully,
              and the texture is authentic Katan silk. Got endless compliments at the wedding.&quot;
            </p>
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-900">Pooja Venkatesh</span>
              <span className="text-neutral-400">Bengaluru</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-neutral-150 shadow-2xs space-y-3">
            <div className="text-amber-500 font-bold">★★★★★</div>
            <p className="text-xs text-neutral-700 italic leading-relaxed">
              &quot;The pure linen shirts are impeccable. Perfect breathable collar and tailoring.
              Ordered white and sky blue, definitely returning for more colors.&quot;
            </p>
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-900">Rahul K. Reddy</span>
              <span className="text-neutral-400">Hyderabad</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-neutral-150 shadow-2xs space-y-3">
            <div className="text-amber-500 font-bold">★★★★★</div>
            <p className="text-xs text-neutral-700 italic leading-relaxed">
              &quot;Prompt delivery and customer support on WhatsApp was super helpful with size
              guidance for my daughter&apos;s festive lehenga. Fits like a glove!&quot;
            </p>
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-900">Meenakshi Iyer</span>
              <span className="text-neutral-400">Chennai</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
