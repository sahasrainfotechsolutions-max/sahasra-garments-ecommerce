'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface ProductDeleteButtonProps {
  productId: string;
  productName: string;
}

export const ProductDeleteButton: React.FC<ProductDeleteButtonProps> = ({
  productId,
  productName,
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 transition"
        title="Delete Garment"
      >
        <Trash2 size={13} />
      </button>

      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title="Delete Garment"
        message={`Are you sure you want to permanently delete "${productName}" and its variants? This action cannot be undone.`}
        confirmText="Yes, Delete"
        isLoading={loading}
      />
    </>
  );
};
