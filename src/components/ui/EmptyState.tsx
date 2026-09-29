import React from 'react';
import Link from 'next/link';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  actionHref,
  onAction,
  icon,
  className = 'py-16',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center px-4 max-w-md mx-auto ${className}`}>
      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
        {icon || <PackageOpen className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-serif font-bold text-neutral-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-neutral-500 mb-6">{description}</p>}
      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition"
        >
          {actionText}
        </Link>
      )}
      {actionText && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
