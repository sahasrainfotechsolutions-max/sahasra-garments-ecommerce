'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart, getCartItemKey } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol?: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  currencySymbol = '₹',
}) => {
  const { items, itemCount, subtotal, removeItem, updateQuantity } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neutral-800" />
              <h2 className="text-lg font-serif font-bold text-neutral-900">
                Shopping Bag ({itemCount})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
                  <ShoppingBag size={28} />
                </div>
                <p className="text-base font-medium text-neutral-900 mb-1">Your bag is empty</p>
                <p className="text-xs text-neutral-500 mb-6">
                  Explore our luxury collection and find something special.
                </p>
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const itemKey = getCartItemKey(item);
                return (
                  <div
                    key={itemKey}
                    className="flex gap-4 p-3 rounded-xl border border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50 transition"
                  >
                    <div className="relative w-20 h-24 flex-shrink-0 bg-neutral-200 rounded-lg overflow-hidden">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <Link
                            href={`/product/${item.productSlug}`}
                            onClick={onClose}
                            className="text-sm font-medium text-neutral-900 line-clamp-1 hover:text-amber-700 transition"
                          >
                            {item.productName}
                          </Link>
                          <button
                            onClick={() => removeItem(itemKey)}
                            className="text-neutral-400 hover:text-rose-500 p-1 transition"
                            title="Remove item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div className="text-xs text-neutral-500 mt-1 space-x-2">
                          {item.color && <span>Color: <strong>{item.color}</strong></span>}
                          {item.size && <span>Size: <strong>{item.size}</strong></span>}
                        </div>

                        <div className="text-xs text-neutral-400 font-mono mt-0.5">SKU: {item.sku}</div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-neutral-200 rounded-lg bg-white overflow-hidden">
                          <button
                            onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                            className="px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-100 transition"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-semibold text-neutral-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                            disabled={item.stock > 0 && item.quantity >= item.stock}
                            className="px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 transition"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-sm font-bold text-neutral-900">
                          {formatCurrency(item.unitPrice * item.quantity, currencySymbol)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-neutral-100 bg-neutral-50/70 space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-neutral-600">Subtotal</span>
                <span className="text-lg font-bold text-neutral-900">
                  {formatCurrency(subtotal, currencySymbol)}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Taxes, coupons, and shipping calculated at checkout.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="w-full text-center py-2.5 px-4 rounded-xl border border-neutral-300 text-neutral-800 text-sm font-semibold hover:bg-neutral-100 transition"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-amber-700 text-white text-sm font-semibold hover:bg-amber-800 shadow-sm transition"
                >
                  Checkout <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
