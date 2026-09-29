'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ProductItem, ProductVariantItem } from '@/types';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { WishlistButton } from '@/components/ui/WishlistButton';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Zap, MessageCircle, Check, AlertCircle } from 'lucide-react';
import { getWhatsAppUrl } from '@/lib/utils';

interface ProductVariantSelectorProps {
  product: ProductItem;
  currencySymbol?: string;
  whatsappNumber?: string;
  storeName?: string;
}

export const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  product,
  currencySymbol = '₹',
  whatsappNumber = '+919876543210',
  storeName = 'Sahasra Fashion',
}) => {
  const router = useRouter();
  const { addItem } = useCart();

  // Extract unique colors and sizes
  const uniqueColors = useMemo(() => {
    const map = new Map<string, { name: string; hex?: string | null }>();
    product.variants.forEach((v) => {
      if (v.color && !map.has(v.color)) {
        map.set(v.color, { name: v.color, hex: v.colorHex });
      }
    });
    return Array.from(map.values());
  }, [product.variants]);

  const uniqueSizes = useMemo(() => {
    const set = new Set<string>();
    product.variants.forEach((v) => {
      if (v.size) set.add(v.size);
    });
    return Array.from(set);
  }, [product.variants]);

  // Initial selection
  const [selectedColor, setSelectedColor] = useState<string>(
    uniqueColors[0]?.name || product.variants[0]?.color || ''
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    uniqueSizes[0] || product.variants[0]?.size || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Active matching variant based on color and size
  const activeVariant: ProductVariantItem | undefined = useMemo(() => {
    // 1. Try exact match on both color and size
    let found = product.variants.find(
      (v) =>
        (!selectedColor || v.color.toLowerCase() === selectedColor.toLowerCase()) &&
        (!selectedSize || v.size.toLowerCase() === selectedSize.toLowerCase())
    );
    // 2. If no match on both, match size first (garment sizing is primary)
    if (!found && selectedSize) {
      found = product.variants.find(
        (v) => v.size.toLowerCase() === selectedSize.toLowerCase()
      );
    }
    // 3. If no match on size, match color
    if (!found && selectedColor) {
      found = product.variants.find(
        (v) => v.color.toLowerCase() === selectedColor.toLowerCase()
      );
    }
    return found || product.variants[0];
  }, [product.variants, selectedColor, selectedSize]);

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    // Auto-align color if the currently selected color is not available for this size
    const availableVariantForSize =
      product.variants.find(
        (v) =>
          v.size.toLowerCase() === size.toLowerCase() &&
          v.color.toLowerCase() === selectedColor.toLowerCase()
      ) || product.variants.find((v) => v.size.toLowerCase() === size.toLowerCase());

    if (availableVariantForSize && availableVariantForSize.color !== selectedColor) {
      setSelectedColor(availableVariantForSize.color);
    }
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    // Auto-align size if the currently selected size is not available for this color
    const availableVariantForColor =
      product.variants.find(
        (v) =>
          v.color.toLowerCase() === color.toLowerCase() &&
          v.size.toLowerCase() === selectedSize.toLowerCase()
      ) || product.variants.find((v) => v.color.toLowerCase() === color.toLowerCase());

    if (availableVariantForColor && availableVariantForColor.size !== selectedSize) {
      setSelectedSize(availableVariantForColor.size);
    }
  };

  // Stock status
  const currentStock = activeVariant?.stock ?? 0;
  const isOutOfStock = currentStock <= 0;
  const isLowStock = currentStock > 0 && currentStock <= 5;

  // Effective price & MRP
  const effectivePrice = activeVariant?.price ?? product.basePrice;
  const effectiveMrp = activeVariant?.mrp ?? product.mrp;

  const handleAddToCart = (isBuyNow = false) => {
    if (!activeVariant || isOutOfStock) return;

    addItem({
      productId: product.id,
      variantId: activeVariant.id,
      productName: product.name,
      productSlug: product.slug,
      imageUrl: activeVariant.imageUrl || product.images[0]?.url,
      size: activeVariant.size,
      color: activeVariant.color,
      sku: activeVariant.sku,
      unitPrice: effectivePrice,
      mrp: effectiveMrp,
      quantity,
      stock: currentStock,
    });

    if (isBuyNow) {
      router.push('/checkout');
    } else {
      setFeedbackMsg('Added to bag!');
      setTimeout(() => setFeedbackMsg(null), 2500);
    }
  };

  const whatsappMessage = `Hi ${storeName}, I am interested in purchasing:\nProduct: ${product.name}\nColor: ${selectedColor}\nSize: ${selectedSize}\nSKU: ${activeVariant?.sku || product.sku}\nPrice: ${currencySymbol}${effectivePrice}`;
  const whatsappUrl = getWhatsAppUrl(whatsappNumber, whatsappMessage);

  return (
    <div className="space-y-6">
      {/* Price Section */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-150">
        <div>
          <PriceDisplay
            price={effectivePrice}
            mrp={effectiveMrp}
            currencySymbol={currencySymbol}
            size="xl"
          />
          <span className="text-xs text-neutral-400 mt-1 block">Inclusive of all taxes</span>
        </div>

        <div className="flex items-center gap-2">
          <WishlistButton productId={product.id} size={22} className="p-3" />
        </div>
      </div>

      {/* Color Selection */}
      {uniqueColors.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-xs font-semibold text-neutral-800">
            <span>
              COLOR: <span className="text-neutral-500 font-normal">{selectedColor}</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {uniqueColors.map((color) => {
              const isSelected = selectedColor === color.name;
              return (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => handleColorChange(color.name)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                      : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-2xs"
                    style={{ backgroundColor: color.hex || '#ccc' }}
                  />
                  <span>{color.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {uniqueSizes.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-xs font-semibold text-neutral-800">
            <span>
              SELECT SIZE: <span className="text-neutral-500 font-normal">{selectedSize}</span>
            </span>
            <span className="text-neutral-400 text-[11px] font-mono">
              SKU: {activeVariant?.sku || product.sku}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {uniqueSizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeChange(size)}
                  className={`min-w-[48px] h-10 px-3 flex items-center justify-center rounded-xl border text-sm font-semibold transition ${
                    isSelected
                      ? 'border-amber-700 bg-amber-50 text-amber-900 shadow-2xs ring-1 ring-amber-700'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock Availability Indicator */}
      <div className="flex items-center gap-2 text-xs">
        {isOutOfStock ? (
          <div className="flex items-center gap-1.5 text-rose-600 font-semibold">
            <AlertCircle size={15} /> Currently Out of Stock
          </div>
        ) : isLowStock ? (
          <div className="flex items-center gap-1.5 text-amber-600 font-semibold">
            <AlertCircle size={15} /> Only {currentStock} left in stock - order soon
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <Check size={15} /> In Stock ({currentStock} available)
          </div>
        )}
      </div>

      {/* Quantity & CTA Buttons */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-neutral-700 uppercase">Quantity</span>
          <div className="flex items-center border border-neutral-200 rounded-xl bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || isOutOfStock}
              className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 transition"
            >
              -
            </button>
            <span className="px-4 text-sm font-semibold text-neutral-800">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
              disabled={quantity >= currentStock || isOutOfStock}
              className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 transition"
            >
              +
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Add to Bag */}
          <button
            type="button"
            onClick={() => handleAddToCart(false)}
            disabled={isOutOfStock}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl border border-neutral-900 bg-white text-neutral-900 font-semibold text-sm hover:bg-neutral-900 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition"
          >
            <ShoppingBag size={18} />
            {feedbackMsg || 'Add to Bag'}
          </button>

          {/* Buy Now */}
          <button
            type="button"
            onClick={() => handleAddToCart(true)}
            disabled={isOutOfStock}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-amber-700 text-white font-semibold text-sm hover:bg-amber-800 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition"
          >
            <Zap size={18} /> Buy Now
          </button>
        </div>

        {/* WhatsApp Inquiry Link */}
        {whatsappNumber && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition mt-2"
          >
            <MessageCircle size={16} /> Inquire on WhatsApp about this garment
          </a>
        )}
      </div>
    </div>
  );
};
