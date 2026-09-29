'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { ProductItem } from '@/types';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { formatCurrency } from '@/lib/utils';
import {
  Heart,
  ShoppingBag,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export default function WishlistPage() {
  const router = useRouter();
  const { wishlistIds, removeFromWishlist, isLoaded } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addedMsg, setAddedMsg] = useState<{ [id: string]: string }>({});

  useEffect(() => {
    async function fetchWishlistProducts() {
      if (!isLoaded) return;

      if (wishlistIds.length === 0) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/wishlist?ids=${encodeURIComponent(wishlistIds.join(','))}`);
        if (res.ok) {
          const data = await res.json();
          if (data.items && Array.isArray(data.items)) {
            // Map items to products
            const productList = data.items
              .map((item: any) => item.product || item)
              .filter(Boolean);
            setProducts(productList);
          } else if (data.products && Array.isArray(data.products)) {
            setProducts(data.products);
          }
        }
      } catch (err) {
        console.error('Failed to load wishlist products:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWishlistProducts();
  }, [wishlistIds, isLoaded]);

  const handleRemove = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    await removeFromWishlist(productId);
  };

  const handleAddToBag = (product: ProductItem) => {
    const activeVariants = product.variants?.filter((v) => v.isActive) || [];

    // Distinct sizes check
    const uniqueSizes = Array.from(new Set(activeVariants.map((v) => v.size).filter(Boolean)));

    // If multiple sizes or variants exist, customer must select size on product detail page
    if (uniqueSizes.length > 1 || activeVariants.length > 1) {
      router.push(`/product/${product.slug}`);
      return;
    }

    // Single variant flow
    const singleVariant = activeVariants[0];
    const stock = singleVariant?.stock ?? 10;
    if (stock <= 0) {
      setAddedMsg((prev) => ({ ...prev, [product.id]: 'Out of Stock' }));
      setTimeout(() => setAddedMsg((prev) => ({ ...prev, [product.id]: '' })), 2500);
      return;
    }

    addItem({
      productId: product.id,
      variantId: singleVariant?.id || null,
      productName: product.name,
      productSlug: product.slug,
      imageUrl: product.images?.[0]?.url,
      size: singleVariant?.size || 'Free Size',
      color: singleVariant?.color || 'Standard',
      sku: singleVariant?.sku || product.sku,
      unitPrice: singleVariant?.price ?? product.basePrice,
      mrp: singleVariant?.mrp ?? product.mrp,
      quantity: 1,
      stock,
    });

    setAddedMsg((prev) => ({ ...prev, [product.id]: 'Added to Bag!' }));
    setTimeout(() => setAddedMsg((prev) => ({ ...prev, [product.id]: '' })), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-neutral-900 tracking-tight flex items-center gap-3">
          <Heart className="w-7 h-7 text-rose-600 fill-rose-600" />
          My Wishlist ({wishlistIds.length})
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Your saved garments. Items remain here until you remove them or move them to your bag.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-sm text-neutral-500">Loading your saved items...</div>
      ) : products.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
            <Heart size={28} />
          </div>
          <h2 className="text-lg font-serif font-bold text-neutral-900 mb-1">
            Your Wishlist is Empty
          </h2>
          <p className="text-xs text-neutral-500 mb-6">
            Tap the heart icon on any garment to save it for later while you explore.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition"
          >
            <ShoppingBag size={16} /> Explore Collections
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const primaryImage =
              product.images?.find((img) => img.isPrimary)?.url ||
              product.images?.[0]?.url ||
              '/placeholder-garment.svg';

            const activeVariants = product.variants?.filter((v) => v.isActive) || [];
            const totalStock = activeVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
            const isOutOfStock = activeVariants.length > 0 && totalStock <= 0;
            const uniqueSizes = Array.from(
              new Set(activeVariants.map((v) => v.size).filter(Boolean))
            );
            const hasMultipleSizes = uniqueSizes.length > 1;

            return (
              <div
                key={product.id}
                className="group flex flex-col bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300"
              >
                {/* Product Image & Badges */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
                  <Link href={`/product/${product.slug}`} className="block w-full h-full">
                    <Image
                      src={primaryImage}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(product.id)}
                    title="Remove from wishlist"
                    className="absolute top-2.5 right-2.5 z-10 p-2 rounded-full bg-white/90 backdrop-blur-xs text-neutral-400 hover:text-rose-600 hover:bg-white shadow-sm transition"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Availability Badge */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    {isOutOfStock ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                        Out of Stock
                      </span>
                    ) : totalStock <= 5 && totalStock > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-600 text-white shadow-xs">
                        Only {totalStock} Left
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-700 text-white shadow-xs">
                        In Stock
                      </span>
                    )}
                  </div>

                  {/* Size hints */}
                  {uniqueSizes.length > 0 && (
                    <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1 z-10 pointer-events-none">
                      {uniqueSizes.slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="bg-black/60 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded font-mono font-medium"
                        >
                          {s}
                        </span>
                      ))}
                      {uniqueSizes.length > 4 && (
                        <span className="bg-black/60 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded font-mono font-medium">
                          +{uniqueSizes.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
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
                      className="block text-sm font-semibold text-neutral-900 line-clamp-1 hover:text-amber-800 transition"
                    >
                      {product.name}
                    </Link>

                    {/* Pricing */}
                    <div className="pt-2 flex items-center justify-between">
                      <PriceDisplay
                        price={product.basePrice}
                        mrp={product.mrp}
                        currencySymbol="₹"
                        size="md"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-neutral-100 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddToBag(product)}
                      disabled={isOutOfStock}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        addedMsg[product.id]
                          ? 'bg-emerald-600 text-white'
                          : hasMultipleSizes
                          ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                          : 'bg-amber-700 text-white hover:bg-amber-800'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      <ShoppingBag size={14} />
                      {addedMsg[product.id] ||
                        (hasMultipleSizes ? 'Select Size & Add' : 'Add to Bag')}
                    </button>

                    <Link
                      href={`/product/${product.slug}`}
                      className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 text-center transition flex items-center justify-center gap-1.5"
                    >
                      <Eye size={13} /> View Product
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
