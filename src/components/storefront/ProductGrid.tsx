import React from 'react';
import { ProductItem } from '@/types';
import { ProductCard } from './ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';

interface ProductGridProps {
  products: ProductItem[];
  currencySymbol?: string;
  columns?: 2 | 3 | 4;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  currencySymbol = '₹',
  columns = 4,
  emptyTitle = 'No garments found',
  emptyDescription = 'Try adjusting your search criteria or filters.',
}) => {
  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionText="Browse All Garments"
        actionHref="/shop"
      />
    );
  }

  const gridClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }[columns];

  return (
    <div className={`grid ${gridClass} gap-4 sm:gap-6`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          currencySymbol={currencySymbol}
        />
      ))}
    </div>
  );
};
