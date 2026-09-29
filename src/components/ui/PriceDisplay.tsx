import React from 'react';
import { formatCurrency, calculateDiscount } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  mrp?: number | null;
  currencySymbol?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDiscountBadge?: boolean;
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  mrp,
  currencySymbol = '₹',
  size = 'md',
  showDiscountBadge = true,
  className = '',
}) => {
  const discount = mrp ? calculateDiscount(mrp, price) : 0;

  const sizeClasses = {
    sm: { price: 'text-sm font-semibold', mrp: 'text-xs', badge: 'text-[10px] px-1.5 py-0.5' },
    md: { price: 'text-base font-bold', mrp: 'text-xs', badge: 'text-xs px-2 py-0.5' },
    lg: { price: 'text-xl font-bold', mrp: 'text-sm', badge: 'text-xs px-2.5 py-1' },
    xl: { price: 'text-3xl font-extrabold', mrp: 'text-lg', badge: 'text-sm px-3 py-1' },
  }[size];

  return (
    <div className={`flex items-baseline flex-wrap gap-2 ${className}`}>
      <span className={`text-neutral-900 ${sizeClasses.price}`}>
        {formatCurrency(price, currencySymbol)}
      </span>

      {mrp && mrp > price && (
        <>
          <span className={`line-through text-neutral-400 font-normal ${sizeClasses.mrp}`}>
            {formatCurrency(mrp, currencySymbol)}
          </span>

          {showDiscountBadge && discount > 0 && (
            <span
              className={`bg-emerald-50 text-emerald-700 font-semibold rounded-full border border-emerald-200/60 ${sizeClasses.badge}`}
            >
              {discount}% OFF
            </span>
          )}
        </>
      )}
    </div>
  );
};
