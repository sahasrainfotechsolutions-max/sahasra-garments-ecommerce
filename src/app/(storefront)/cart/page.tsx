'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart, getCartItemKey } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    discountAmount,
    shippingFee,
    taxAmount,
    grandTotal,
    coupon,
    couponError,
    removeItem,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    await applyCoupon(couponInput.trim().toUpperCase());
    setIsApplying(false);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-md mx-auto text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto">
            <ShoppingBag size={36} />
          </div>
          <h1 className="text-2xl font-serif font-black text-neutral-900">Your Bag is Empty</h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Looks like you haven&apos;t added any garments to your shopping bag yet.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-amber-700 text-white font-semibold text-sm hover:bg-amber-800 transition shadow-sm"
            >
              Continue Shopping <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-neutral-900 tracking-tight">
            Shopping Bag ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Review your selected garments and apply eligible promotional vouchers.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-neutral-400 hover:text-rose-600 transition"
        >
          Clear bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Cart Items Table/List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs divide-y divide-neutral-100 overflow-hidden">
            {items.map((item) => {
              const itemKey = getCartItemKey(item);
              return (
                <div key={itemKey} className="p-4 sm:p-6 flex gap-4 sm:gap-6 items-start">
                  {/* Product Thumbnail */}
                  <div className="relative w-24 h-32 sm:w-28 sm:h-36 flex-shrink-0 bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        unoptimized
                        className="object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-full space-y-3">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/product/${item.productSlug}`}
                          className="text-base font-semibold text-neutral-900 hover:text-amber-800 transition line-clamp-1"
                        >
                          {item.productName}
                        </Link>
                        <button
                          onClick={() => removeItem(itemKey)}
                          className="text-neutral-400 hover:text-rose-500 p-1 transition"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mt-1">
                        {item.color && (
                          <span>
                            Color: <strong className="text-neutral-700">{item.color}</strong>
                          </span>
                        )}
                        {item.size && (
                          <span>
                            Size: <strong className="text-neutral-700">{item.size}</strong>
                          </span>
                        )}
                        <span className="font-mono text-neutral-400">SKU: {item.sku}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-neutral-200 rounded-xl bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                          className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 transition"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-bold text-neutral-900">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                          disabled={item.stock > 0 && item.quantity >= item.stock}
                          className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 transition"
                        >
                          +
                        </button>
                      </div>

                    {/* Line Total */}
                    <div className="text-right">
                      <div className="text-base font-bold text-neutral-900">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </div>
                      {item.mrp && item.mrp > item.unitPrice && (
                        <div className="text-xs line-through text-neutral-400">
                          {formatCurrency(item.mrp * item.quantity)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

          {/* Value Highlights */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-neutral-100/60 border border-neutral-200/60 text-xs text-neutral-600">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-amber-700 flex-shrink-0" />
              <span>Authentic Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-amber-700 flex-shrink-0" />
              <span>Express Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw size={16} className="text-amber-700 flex-shrink-0" />
              <span>7-Day Return Policy</span>
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary & Coupon */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon Box */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
              <Tag size={14} className="text-amber-700" /> Apply Promo Coupon
            </h3>

            {coupon ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                <div>
                  <span className="font-mono font-bold text-emerald-800">{coupon.code}</span>
                  <p className="text-emerald-700 text-[11px] mt-0.5">
                    Saved {formatCurrency(discountAmount)} with this voucher!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="e.g. FESTIVE20"
                    className="flex-1 px-3 py-2 text-xs uppercase font-mono tracking-wider border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
                  />
                  <button
                    type="submit"
                    disabled={isApplying || !couponInput.trim()}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 disabled:opacity-50 transition"
                  >
                    {isApplying ? 'Applying...' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-xs text-rose-500 font-medium">{couponError}</p>}
                <p className="text-[11px] text-neutral-400">
                  Try codes: <strong className="text-neutral-700">FESTIVE20</strong>,{' '}
                  <strong className="text-neutral-700">WELCOME100</strong>
                </p>
              </form>
            )}
          </div>

          {/* Summary Breakdown */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-serif font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Bag Subtotal</span>
                <span className="font-semibold text-neutral-900">{formatCurrency(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-semibold">FREE</span>
                  ) : (
                    formatCurrency(shippingFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated GST Tax (5%)</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex items-baseline justify-between">
              <div>
                <span className="text-sm font-bold text-neutral-900 block">Grand Total</span>
                <span className="text-[11px] text-neutral-400">Includes all taxes</span>
              </div>
              <span className="text-2xl font-black text-neutral-900 font-serif">
                {formatCurrency(grandTotal)}
              </span>
            </div>

            <div className="pt-2">
              <Link
                href="/checkout"
                className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-amber-700 text-white font-semibold text-sm hover:bg-amber-800 shadow-md transition"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
