import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  count?: number;
  size?: number;
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value = 5,
  count,
  size = 14,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={star <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-neutral-500 font-medium ml-1">({count})</span>
      )}
    </div>
  );
};
