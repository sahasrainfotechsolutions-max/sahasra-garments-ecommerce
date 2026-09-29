'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductItem } from '@/types';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { WishlistButton } from '@/components/ui/WishlistButton';

interface ProductCardProps {
  product: ProductItem;
  currencySymbol?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currencySymbol = '₹',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url;
  const secondaryImage = product.images.find((img) => !img.isPrimary)?.url || primaryImage;

  // Extract unique sizes and colors from variants
  const sizes = Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean)));
  const colors = Array.from(
    new Map(
      product.variants
        .filter((v) => v.color)
        .map((v) => [v.color, { name: v.color, hex: v.colorHex }])
    ).values()
  );

  const [fallbackActive, setFallbackActive] = useState(false);
  const currentImage = isHovered && secondaryImage ? secondaryImage : primaryImage;

  return (
    <div
      className="group flex flex-col bg-white rounded-2xl border border-neutral-150 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          {primaryImage ? (
            <Image
              src={fallbackActive ? '/placeholder-garment.svg' : currentImage}
              alt={product.name}
              fill
              unoptimized
              onError={() => setFallbackActive(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
              No Image
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isNewArrival && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-900 text-white shadow-xs">
              New
            </span>
          )}
          {product.isBestseller && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-600 text-white shadow-xs">
              Bestseller
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <WishlistButton productId={product.id} />
        </div>

        {/* Available Sizes Bar (Appears on Hover on Desktop) */}
        {sizes.length > 0 && (
          <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm py-1.5 px-3 flex items-center justify-center gap-1.5 text-[11px] font-medium text-neutral-700 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200 hidden sm:flex border-t border-neutral-100">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider mr-1">
              Sizes:
            </span>
            {sizes.slice(0, 5).map((s) => (
              <span key={s} className="px-1.5 py-0.5 rounded bg-neutral-100 font-mono">
                {s}
              </span>
            ))}
            {sizes.length > 5 && (
              <span className="text-[10px] text-neutral-400">+{sizes.length - 5}</span>
            )}
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
            <span className="uppercase tracking-wider font-semibold text-neutral-500">
              {product.brand?.name || 'Sahasra'}
            </span>
            {product.category && <span>{product.category.name}</span>}
          </div>

          {/* Product Name */}
          <Link
            href={`/product/${product.slug}`}
            className="block text-sm font-semibold text-neutral-900 line-clamp-1 group-hover:text-amber-700 transition"
          >
            {product.name}
          </Link>

          {/* Color Swatches */}
          {colors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              {colors.slice(0, 4).map((c) => (
                <span
                  key={c.name}
                  title={c.name}
                  className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-2xs flex-shrink-0"
                  style={{ backgroundColor: c.hex || '#ccc' }}
                />
              ))}
              {colors.length > 4 && (
                <span className="text-[10px] text-neutral-400">+{colors.length - 4}</span>
              )}
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
          <PriceDisplay
            price={product.basePrice}
            mrp={product.mrp}
            currencySymbol={currencySymbol}
            size="md"
          />
        </div>
      </div>
    </div>
  );
};
