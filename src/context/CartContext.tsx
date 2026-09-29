'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartLineItem, CouponData } from '@/types';

/**
 * Returns a stable unique line item identity for cart management.
 * Scoped by productId + variantId so different garment sizes/variants
 * of the SAME product remain distinct cart lines.
 */
export const getCartItemKey = (item: {
  productId: string;
  variantId?: string | null;
  sku?: string;
}): string => {
  if (item.variantId) {
    return `${item.productId}::${item.variantId}`;
  }
  return `${item.productId}::${item.sku || 'default'}`;
};

interface CartContextType {
  items: CartLineItem[];
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  grandTotal: number;
  coupon: CouponData | null;
  couponError: string | null;
  addItem: (item: CartLineItem) => void;
  removeItem: (identifier: string) => void;
  updateQuantity: (identifier: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  children,
  shippingCharge = 99,
  freeShippingThreshold = 999,
  taxPercentage = 5,
}: {
  children: React.ReactNode;
  shippingCharge?: number;
  freeShippingThreshold?: number;
  taxPercentage?: number;
}) {
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [coupon, setCoupon] = useState<CouponData | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sg_cart_items');
      if (stored) {
        setItems(JSON.parse(stored));
      }
      const storedCoupon = localStorage.getItem('sg_cart_coupon');
      if (storedCoupon) {
        setCoupon(JSON.parse(storedCoupon));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('sg_cart_items', JSON.stringify(items));
      if (coupon) {
        localStorage.setItem('sg_cart_coupon', JSON.stringify(coupon));
      } else {
        localStorage.removeItem('sg_cart_coupon');
      }
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  }, [items, coupon, isLoaded]);

  /**
   * Add Item Rule:
   * Same product + same variant: merge quantity up to variant stock.
   * Same product + different variant: remain separate cart lines.
   * Different products: remain separate cart lines.
   */
  const addItem = (item: CartLineItem) => {
    setItems((prev) => {
      const targetKey = getCartItemKey(item);
      const index = prev.findIndex((i) => getCartItemKey(i) === targetKey);
      if (index > -1) {
        const next = [...prev];
        const maxStock = item.stock > 0 ? item.stock : 99;
        const newQty = Math.min(next[index].quantity + item.quantity, maxStock);
        next[index] = { ...next[index], quantity: newQty };
        return next;
      }
      return [...prev, item];
    });
  };

  const removeItem = (identifier: string) => {
    setItems((prev) =>
      prev.filter((i) => {
        const key = getCartItemKey(i);
        return (
          key !== identifier &&
          i.sku !== identifier &&
          i.variantId !== identifier
        );
      })
    );
  };

  const updateQuantity = (identifier: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(identifier);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        const key = getCartItemKey(i);
        const matches =
          key === identifier ||
          i.sku === identifier ||
          i.variantId === identifier;
        if (matches) {
          const maxStock = i.stock > 0 ? i.stock : 99;
          return { ...i, quantity: Math.min(quantity, maxStock) };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
    setCouponError(null);
  };

  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  // Discount calculation
  let discountAmount = 0;
  if (coupon && subtotal >= coupon.minOrderValue) {
    if (coupon.discountType === 'PERCENTAGE') {
      const calculated = (subtotal * coupon.discountValue) / 100;
      discountAmount = coupon.maxDiscount ? Math.min(calculated, coupon.maxDiscount) : calculated;
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const shippingFee = subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : shippingCharge;
  const taxAmount = Math.round((discountedSubtotal * taxPercentage) / 100);
  const grandTotal = discountedSubtotal + shippingFee + taxAmount;
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const applyCoupon = async (code: string): Promise<boolean> => {
    setCouponError(null);
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(code)}&amount=${subtotal}`);
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCouponError(data.message || 'Invalid or inapplicable coupon');
        return false;
      }
      setCoupon(data.coupon);
      return true;
    } catch (e) {
      setCouponError('Failed to validate coupon');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discountAmount,
        shippingFee,
        taxAmount,
        grandTotal,
        coupon,
        couponError,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
