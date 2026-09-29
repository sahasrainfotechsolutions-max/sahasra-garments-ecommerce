'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: number;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  className = '',
  size = 18,
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const active = isInWishlist(productId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(productId);
      }}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`p-2 rounded-full transition-all duration-200 bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 active:scale-95 ${
        active ? 'text-rose-600 bg-rose-50/90' : 'text-neutral-500 hover:text-rose-500'
      } ${className}`}
    >
      <Heart
        size={size}
        className={`transition-colors ${active ? 'fill-rose-600 text-rose-600' : ''}`}
      />
    </button>
  );
};
