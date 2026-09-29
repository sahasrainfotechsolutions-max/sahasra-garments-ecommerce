'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Layers } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: string | null;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  parent?: { id: string; name: string } | null;
  _count?: { products: number };
}

export const CategoryManager: React.FC<{ initialCategories: CategoryItem[] }> = ({
  initialCategories,
}) => {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    parentId: '',
    isFeatured: false,
    isActive: true,
    displayOrder: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      parentId: '',
      isFeatured: false,
      isActive: true,
      displayOrder: categories.length + 1,
    });
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      imageUrl: cat.imageUrl || '',
      parentId: cat.parentId || '',
      isFeatured: cat.isFeatured,
      isActive: cat.isActive,
      displayOrder: cat.displayOrder,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to save category');
        setSubmitting(false);
        return;
      }

      setModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error occurred');
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
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
            Categories & Collections
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Organize garments hierarchically into departments and subcategories.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 shadow-sm transition"
        >
          <Plus size={15} /> Add Category
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50/80 text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3.5">Category Name</th>
              <th className="px-4 py-3.5">Slug</th>
              <th className="px-4 py-3.5">Parent Category</th>
              <th className="px-4 py-3.5">Order</th>
              <th className="px-4 py-3.5">Products</th>
              <th className="px-4 py-3.5">Featured</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {initialCategories.map((c) => (
              <tr key={c.id} className="hover:bg-neutral-50/60 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0 border border-neutral-200">
                      {c.imageUrl ? (
                        <Image src={c.imageUrl} alt={c.name} fill className="object-cover" />
                      ) : (
                        <Layers size={14} className="text-neutral-400 m-auto mt-2" />
                      )}
                    </div>
                    <span className="font-semibold text-neutral-900">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-neutral-500 text-[11px]">{c.slug}</td>
                <td className="px-4 py-3 text-neutral-600">{c.parent?.name || 'Top-level'}</td>
                <td className="px-4 py-3 font-mono text-neutral-700">{c.displayOrder}</td>
                <td className="px-4 py-3">
                  <span className="bg-neutral-100 px-2 py-0.5 rounded text-[11px] font-mono">
                    {c._count?.products || 0}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {c.isFeatured ? (
                    <span className="text-amber-700 font-bold">Yes</span>
                  ) : (
                    <span className="text-neutral-400">No</span>
                  )}
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
                      title="Edit Category"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => {
                        setCategoryToDelete(c);
                        setDeleteDialogOpen(true);
                      }}
                      className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 transition"
                      title="Delete Category"
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

      {/* Edit/Create Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Sarees, Men's Shirts..."
              className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              SEO Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g. sarees, men-shirts"
              className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Parent Category (Optional)
            </label>
            <select
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 bg-white"
            >
              <option value="">Top-Level Category</option>
              {categories
                .filter((c) => c.id !== editingCategory?.id && !c.parentId)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Banner / Thumbnail Image URL
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the collection..."
              className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-neutral-700">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded text-amber-700 focus:ring-amber-700"
              />
              <span>Feature on Homepage</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-neutral-700">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded text-amber-700 focus:ring-amber-700"
              />
              <span>Active</span>
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
              {submitting ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete category "${categoryToDelete?.name}"? Any subcategories or products will be detached.`}
        confirmText="Yes, Delete"
        isLoading={deleting}
      />
    </div>
  );
};
