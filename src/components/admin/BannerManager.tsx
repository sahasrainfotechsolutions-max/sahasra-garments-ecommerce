'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface BannerItem {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  ctaText?: string | null;
  ctaUrl?: string | null;
  position: string;
  displayOrder: number;
  isActive: boolean;
}

export const BannerManager: React.FC<{ initialBanners: BannerItem[] }> = ({ initialBanners }) => {
  const router = useRouter();
  const [banners, setBanners] = useState<BannerItem[]>(initialBanners);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    ctaText: 'Shop Now',
    ctaUrl: '/shop',
    position: 'HERO',
    displayOrder: 1,
    isActive: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<BannerItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      imageUrl: '',
      ctaText: 'Shop the Collection',
      ctaUrl: '/shop',
      position: 'HERO',
      displayOrder: banners.length + 1,
      isActive: true,
    });
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (b: BannerItem) => {
    setEditingBanner(b);
    setFormData({
      title: b.title,
      subtitle: b.subtitle || '',
      imageUrl: b.imageUrl,
      ctaText: b.ctaText || '',
      ctaUrl: b.ctaUrl || '',
      position: b.position,
      displayOrder: b.displayOrder,
      isActive: b.isActive,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const url = editingBanner
        ? `/api/admin/banners/${editingBanner.id}`
        : '/api/admin/banners';
      const method = editingBanner ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to save banner');
        setSubmitting(false);
        return;
      }

      setModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error saving banner');
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!bannerToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/banners/${bannerToDelete.id}`, {
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
            Homepage Hero & Promotional Banners
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage high-fashion promotional campaigns, hero imagery, titles, and call-to-actions.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 shadow-sm transition"
        >
          <Plus size={15} /> Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {initialBanners.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-2xs flex flex-col justify-between"
          >
            <div className="relative aspect-[16/9] w-full bg-neutral-900">
              <Image src={b.imageUrl} alt={b.title} fill className="object-cover opacity-80" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-neutral-900/90 text-white border border-neutral-700">
                  {b.position}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    b.isActive ? 'bg-emerald-600 text-white' : 'bg-neutral-600 text-neutral-300'
                  }`}
                >
                  {b.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-serif font-bold text-base text-neutral-900">{b.title}</h3>
                {b.subtitle && (
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{b.subtitle}</p>
                )}
                {b.ctaText && (
                  <div className="mt-2 text-xs text-amber-800 font-semibold flex items-center gap-1">
                    Button: &quot;{b.ctaText}&quot; → {b.ctaUrl}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-xs">
                <span className="font-mono text-neutral-400 text-[11px]">
                  Order: #{b.displayOrder}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-amber-800 hover:bg-neutral-100 transition"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => {
                      setBannerToDelete(b);
                      setDeleteDialogOpen(true);
                    }}
                    className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBanner ? 'Edit Banner' : 'Create New Banner'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Banner Heading *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Festive Grandeur Collection"
              className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Sub-heading / Tagline
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g. Handcrafted pure silk sarees with heritage weaves"
              className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              High-Res Image URL *
            </label>
            <input
              type="url"
              required
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Button CTA Text
              </label>
              <input
                type="text"
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                placeholder="Shop Collection"
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Destination Link URL
              </label>
              <input
                type="text"
                value={formData.ctaUrl}
                onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                placeholder="/shop or /category/women-sarees"
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Display Position
              </label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 bg-white"
              >
                <option value="HERO">Homepage Hero Header</option>
                <option value="PROMO_1">Mid-Page Promotional Banner</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Display Order
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-neutral-700">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded text-amber-700 focus:ring-amber-700"
              />
              <span>Banner Active & Displayed on Storefront</span>
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
              {submitting ? 'Saving...' : 'Save Banner'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Banner"
        message={`Are you sure you want to delete banner "${bannerToDelete?.title}"?`}
        confirmText="Yes, Delete"
        isLoading={deleting}
      />
    </div>
  );
};
