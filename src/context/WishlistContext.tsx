'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface WishlistContextType {
  wishlistIds: string[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
  count: number;
  isLoaded: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Synchronize with server if authenticated or fallback to localStorage
  const refreshWishlist = useCallback(async () => {
    try {
      // 1. Check local storage first
      let localIds: string[] = [];
      try {
        const stored = localStorage.getItem('sg_wishlist_ids');
        if (stored) {
          localIds = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Failed to parse local wishlist:', e);
      }

      // 2. Fetch from server API
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.productIds)) {
          // If server has items, use server items (and merge with local if any)
          const merged = Array.from(new Set([...data.productIds, ...localIds]));
          setWishlistIds(merged);
          localStorage.setItem('sg_wishlist_ids', JSON.stringify(merged));
          return;
        }
      }

      setWishlistIds(localIds);
    } catch (e) {
      console.error('Failed to sync wishlist:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  // Save to localStorage whenever wishlistIds changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('sg_wishlist_ids', JSON.stringify(wishlistIds));
    } catch (e) {
      console.error('Failed to save wishlist to storage:', e);
    }
  }, [wishlistIds, isLoaded]);

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  const toggleWishlist = async (productId: string) => {
    const isCurrentlyIn = wishlistIds.includes(productId);
    const nextIds = isCurrentlyIn
      ? wishlistIds.filter((id) => id !== productId)
      : [...wishlistIds, productId];

    // Optimistic UI update
    setWishlistIds(nextIds);
    try {
      localStorage.setItem('sg_wishlist_ids', JSON.stringify(nextIds));
    } catch {}

    // Server-side synchronization
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          action: isCurrentlyIn ? 'remove' : 'add',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.productIds && Array.isArray(data.productIds)) {
          setWishlistIds(data.productIds);
          localStorage.setItem('sg_wishlist_ids', JSON.stringify(data.productIds));
        }
      }
    } catch (e) {
      console.error('Failed to sync toggle with server:', e);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    const nextIds = wishlistIds.filter((id) => id !== productId);
    setWishlistIds(nextIds);
    try {
      localStorage.setItem('sg_wishlist_ids', JSON.stringify(nextIds));
    } catch {}

    try {
      const res = await fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.productIds && Array.isArray(data.productIds)) {
          setWishlistIds(data.productIds);
          localStorage.setItem('sg_wishlist_ids', JSON.stringify(data.productIds));
        }
      }
    } catch (e) {
      console.error('Failed to sync remove with server:', e);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        refreshWishlist,
        count: wishlistIds.length,
        isLoaded,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
