'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface CouponItem {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usageCount: number;
  isActive: boolean;
}

export const CouponManager: React.FC<{ initialCoupons: CouponItem[] }> = ({ initialCoupons }) => {
  const router = useRouter();
  const [coupons, setCoupons] = useState<CouponItem[]>(initialCoupons);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderValue: 999,
    maxDiscount: 500,
    usageLimit: 100,
    isActive: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<CouponItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      minOrderValue: 999,
      maxDiscount: 500,
      usageLimit: 100,
      isActive: true,
    });
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (c: CouponItem) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderValue: c.minOrderValue,
      maxDiscount: c.maxDiscount || 0,
      usageLimit: c.usageLimit || 0,
      isActive: c.isActive,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const url = editingCoupon
        ? `/api/admin/coupons/${editingCoupon.id}`
        : '/api/admin/coupons';
      const method = editingCoupon ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to save coupon');
        setSubmitting(false);
        return;
      }

      setModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error saving coupon');
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!couponToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/coupons/${couponToDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteDialogOpen(false);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-black text-neutral-900 tracking-tight">
            Promotional Coupons & Vouchers
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure percentage and fixed price discount coupons, minimum orders, and limits.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 shadow-sm transition"
        >
          <Plus size={15} /> Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50/80 text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3.5 font-mono">Coupon Code</th>
              <th className="px-4 py-3.5">Type & Value</th>
              <th className="px-4 py-3.5">Min Order Value</th>
              <th className="px-4 py-3.5">Max Discount</th>
              <th className="px-4 py-3.5 text-center">Usages / Limit</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {initialCoupons.map((c) => (
              <tr key={c.id} className="hover:bg-neutral-50/60 transition">
                <td className="px-4 py-3 font-mono font-bold text-neutral-900 flex items-center gap-2">
                  <Tag size={13} className="text-amber-700" />
                  <span>{c.code}</span>
                </td>

                <td className="px-4 py-3 font-semibold text-neutral-800">
                  {c.discountType === 'PERCENTAGE'
                    ? `${c.discountValue}% OFF`
                    : `${formatCurrency(c.discountValue)} OFF`}
                </td>

                <td className="px-4 py-3 font-mono text-neutral-600">
                  {formatCurrency(c.minOrderValue)}
                </td>

                <td className="px-4 py-3 font-mono text-neutral-600">
                  {c.maxDiscount ? formatCurrency(c.maxDiscount) : 'No Cap'}
                </td>

                <td className="px-4 py-3 text-center font-mono text-neutral-700">
                  {c.usageCount} / {c.usageLimit || '∞'}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>

                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-amber-800 hover:bg-neutral-100 transition"
                      title="Edit Coupon"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => {
                        setCouponToDelete(c);
                        setDeleteDialogOpen(true);
                      }}
                      className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 transition"
                      title="Delete Coupon"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Coupon Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. FESTIVE20"
              className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 font-mono uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Discount Type
              </label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 bg-white"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Discount Value *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Minimum Order Value (₹)
              </label>
              <input
                type="number"
                value={formData.minOrderValue}
                onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Max Discount Cap (₹)
              </label>
              <input
                type="number"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || 0 })}
                placeholder="Optional"
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Usage Limit (Optional)
            </label>
            <input
              type="number"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
              placeholder="e.g. 500"
              className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 font-mono"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-neutral-700">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded text-amber-700 focus:ring-amber-700"
              />
              <span>Coupon Active & Applicable</span>
            </label>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition"
            >
              {submitting ? 'Saving...' : 'Save Coupon'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message={`Are you sure you want to permanently delete coupon "${couponToDelete?.code}"?`}
        confirmText="Yes, Delete"
        isLoading={deleting}
      />
    </div>
  );
};
