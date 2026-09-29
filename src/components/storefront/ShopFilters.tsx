'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, RotateCcw } from 'lucide-react';

interface FilterOption {
  id: string;
  name: string;
  slug?: string;
  count?: number;
}

interface ShopFiltersProps {
  categories: FilterOption[];
  brands: FilterOption[];
  sizes: string[];
  colors: string[];
  totalProducts: number;
}

export const ShopFilters: React.FC<ShopFiltersProps> = ({
  categories,
  brands,
  sizes,
  colors,
  totalProducts,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentCategory = searchParams.get('category') || '';
  const currentBrand = searchParams.get('brand') || '';
  const currentSize = searchParams.get('size') || '';
  const currentColor = searchParams.get('color') || '';
  const currentSort = searchParams.get('sort') || 'featured';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && params.get(key) !== value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/shop?${params.toString()}`);
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    router.push(`/shop?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/shop');
  };

  const hasActiveFilters =
    Boolean(currentCategory || currentBrand || currentSize || currentColor || currentMinPrice || currentMaxPrice);

  const FilterContent = (
    <div className="space-y-6">
      {/* Active Filter Clear Header */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
            Active Filters
          </span>
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-xs text-amber-800 hover:text-amber-900 font-medium"
          >
            <RotateCcw size={12} /> Clear all
          </button>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
          Categories
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
          {categories.map((c) => {
            const isSelected = currentCategory === c.slug;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => updateFilter('category', c.slug || '')}
                className={`w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-left transition ${
                  isSelected
                    ? 'bg-amber-50 text-amber-900 font-semibold'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>{c.name}</span>
                {c.count !== undefined && (
                  <span className="text-neutral-400 font-mono text-[11px]">({c.count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div className="space-y-2.5 pt-4 border-t border-neutral-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
            Brands / Labels
          </h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-xs">
            {brands.map((b) => {
              const isSelected = currentBrand === b.slug;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => updateFilter('brand', b.slug || '')}
                  className={`w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-left transition ${
                    isSelected
                      ? 'bg-amber-50 text-amber-900 font-semibold'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <span>{b.name}</span>
                  {b.count !== undefined && (
                    <span className="text-neutral-400 font-mono text-[11px]">({b.count})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sizes */}
      {sizes.length > 0 && (
        <div className="space-y-2.5 pt-4 border-t border-neutral-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
            Garment Size
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((s) => {
              const isSelected = currentSize === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateFilter('size', s)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-900 text-white font-semibold'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Colors */}
      {colors.length > 0 && (
        <div className="space-y-2.5 pt-4 border-t border-neutral-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
            Color
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {colors.map((c) => {
              const isSelected = currentColor.toLowerCase() === c.toLowerCase();
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => updateFilter('color', c)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-900 text-white font-semibold'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Top Filter Bar Controls */}
      <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-800 shadow-2xs hover:bg-neutral-50"
          >
            <Filter size={15} />
            Filters {hasActiveFilters && '•'}
          </button>

          <span className="text-xs text-neutral-500 font-medium">
            Showing <strong className="text-neutral-900">{totalProducts}</strong> products
          </span>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-500 hidden sm:inline">Sort by:</span>
          <select
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="bg-white border border-neutral-200 text-neutral-800 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-amber-700 shadow-2xs"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Popular</option>
          </select>
        </div>
      </div>

      {/* Desktop Sidebar Content */}
      <div className="hidden lg:block w-64 flex-shrink-0 pt-2">{FilterContent}</div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
              <h3 className="font-serif font-bold text-base text-neutral-900">Filters</h3>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-800"
              >
                <X size={20} />
              </button>
            </div>
            {FilterContent}
            <div className="mt-8 pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="w-full py-3 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
