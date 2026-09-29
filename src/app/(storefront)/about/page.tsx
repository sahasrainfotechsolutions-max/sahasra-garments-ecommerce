import React from 'react';
import { getStoreConfig } from '@/lib/store-config';
import Image from 'next/image';
import { Award, Sparkles, HeartHandshake, Scissors } from 'lucide-react';

export const revalidate = 0;

export default async function AboutPage() {
  const config = await getStoreConfig();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Intro */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
          Our Heritage & Craft
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-black text-neutral-900 tracking-tight">
          About {config.storeName}
        </h1>
        <p className="text-sm text-neutral-600 leading-relaxed font-light">
          {config.description ||
            `${config.storeName} is dedicated to bringing you the finest hand-loomed textiles, luxury sarees, designer kurtis, and bespoke menswear tailored with uncompromising precision.`}
        </p>
      </div>

      {/* Hero Showcase Image */}
      <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden bg-neutral-900 shadow-xl">
        <Image
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80"
          alt={config.storeName}
          fill
          className="object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-8 sm:p-12">
          <div className="text-white max-w-lg">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold">Rooted in Tradition, Designed for Today</h2>
            <p className="text-xs sm:text-sm text-neutral-200 mt-2">
              Every drape, weave, and stitch tells a story of authentic Indian textile mastery.
            </p>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Scissors size={22} />
          </div>
          <h3 className="text-base font-bold text-neutral-900">Master Craftsmanship</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            We partner directly with certified master weavers across Varanasi, Kanchipuram, and Chanderi to preserve century-old loom techniques.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Sparkles size={22} />
          </div>
          <h3 className="text-base font-bold text-neutral-900">Pure Natural Fabrics</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Zero shortcuts. Our garments feature Mulberry Katan silk, European flax linen, and organic combed cotton that breathe effortlessly.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <HeartHandshake size={22} />
          </div>
          <h3 className="text-base font-bold text-neutral-900">Artisan Empowerment</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Fair wages and ethical sourcing ensure our artisan communities thrive as custodians of India&apos;s rich handloom heritage.
          </p>
        </div>
      </div>
    </div>
  );
}
