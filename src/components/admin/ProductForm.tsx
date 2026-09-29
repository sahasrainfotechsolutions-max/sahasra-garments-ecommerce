'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  Sparkles,
  Upload,
  Globe,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Star,
  Loader2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { validateImageUrl, validateImageFile, FALLBACK_IMAGE_URL } from '@/lib/image-utils';

interface CategoryOption {
  id: string;
  name: string;
}

interface BrandOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  initialData?: any;
  categories: CategoryOption[];
  brands: BrandOption[];
  isEditing?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  brands,
  isEditing = false,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || categories[0]?.id || '');
  const [brandId, setBrandId] = useState(initialData?.brandId || brands[0]?.id || '');
  const [basePrice, setBasePrice] = useState(initialData?.basePrice ?? 1999);
  const [mrp, setMrp] = useState(initialData?.mrp ?? 2999);
  const [taxPercent, setTaxPercent] = useState(initialData?.taxPercent ?? 5.0);
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [fabric, setFabric] = useState(initialData?.fabric || '');
  const [careInstructions, setCareInstructions] = useState(initialData?.careInstructions || '');
  const [specifications, setSpecifications] = useState(initialData?.specifications || '');
  const [tags, setTags] = useState(initialData?.tags || '');

  // Flags
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? true);
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);
  const [isNewArrival, setIsNewArrival] = useState(initialData?.isNewArrival ?? false);
  const [isBestseller, setIsBestseller] = useState(initialData?.isBestseller ?? false);

  // Images state & dual-source controls
  const [images, setImages] = useState<Array<{ url: string }>>(
    initialData?.images?.map((img: any) => ({ url: img.url })) || [
      { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80' },
    ]
  );
  const [imageSourceTab, setImageSourceTab] = useState<'upload' | 'url'>('upload');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageSuccess, setImageSuccess] = useState<string | null>(null);
  const [failedImageUrls, setFailedImageUrls] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Variants state
  const [variants, setVariants] = useState<Array<any>>(
    initialData?.variants?.map((v: any) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      colorHex: v.colorHex || '#333333',
      stock: v.stock,
      price: v.price || initialData?.basePrice,
    })) || [
      { sku: 'GAR-WHT-S', size: 'S', color: 'White', colorHex: '#ffffff', stock: 10, price: 1999 },
      { sku: 'GAR-WHT-M', size: 'M', color: 'White', colorHex: '#ffffff', stock: 15, price: 1999 },
      { sku: 'GAR-WHT-L', size: 'L', color: 'White', colorHex: '#ffffff', stock: 12, price: 1999 },
    ]
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setImageError(validation.error || 'Invalid image file.');
      setImageSuccess(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setUploadingImage(true);
      setImageError(null);
      setImageSuccess(null);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image.');
      }

      setImages((prev) => [...prev, { url: data.url }]);
      setImageSuccess(`Image "${file.name}" uploaded successfully from your computer.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setImageError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddOnlineImage = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;

    const validation = validateImageUrl(trimmed);
    if (!validation.valid) {
      setImageError(validation.error || 'Invalid online image URL.');
      setImageSuccess(null);
      return;
    }

    setImages((prev) => [...prev, { url: trimmed }]);
    setNewImageUrl('');
    setImageError(null);
    setImageSuccess('Online image URL added successfully.');
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0 || index >= images.length) return;
    const selected = images[index];
    const remaining = images.filter((_, i) => i !== index);
    setImages([selected, ...remaining]);
    setImageSuccess('Primary image updated.');
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    const defaultColor = variants[0]?.color || 'White';
    const defaultHex = variants[0]?.colorHex || '#ffffff';
    setVariants([
      ...variants,
      {
        sku: `${sku || 'SKU'}-${variants.length + 1}`,
        size: 'M',
        color: defaultColor,
        colorHex: defaultHex,
        stock: 10,
        price: basePrice,
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, key: string, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [key]: value };
    setVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      sku,
      categoryId,
      brandId: brandId || null,
      basePrice,
      mrp,
      taxPercent,
      shortDescription,
      description,
      fabric,
      careInstructions,
      specifications,
      tags,
      isPublished,
      isFeatured,
      isNewArrival,
      isBestseller,
      images,
      variants,
    };

    try {
      const url = isEditing
        ? `/api/admin/products/${initialData.id}`
        : '/api/admin/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to save product');
        setLoading(false);
        return;
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-lg border border-neutral-200 text-neutral-500 hover:text-neutral-900"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-serif font-bold text-neutral-900">
              {isEditing ? `Edit Garment: ${initialData.name}` : 'Create New Garment Product'}
            </h1>
            <p className="text-xs text-neutral-500">
              Set details, images, fabric descriptions, and size/color variants.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 disabled:opacity-50 shadow-sm transition"
        >
          <Save size={15} />
          {loading ? 'Saving Garment...' : isEditing ? 'Save Changes' : 'Create Product'}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-serif font-bold text-neutral-900 border-b border-neutral-100 pb-2">
          Basic Product Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Royal Banarasi Silk Saree"
              className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Master SKU *
            </label>
            <input
              type="text"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. SAR-BAN-001"
              className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              URL Slug (auto-generated if empty)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. royal-banarasi-silk-saree"
              className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Category *
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 bg-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Brand / Label
            </label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 bg-white"
            >
              <option value="">No Brand Selected</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pricing & GST */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-serif font-bold text-neutral-900 border-b border-neutral-100 pb-2">
          Pricing & Taxation
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Selling Base Price (₹) *
            </label>
            <input
              type="number"
              required
              min="0"
              value={basePrice}
              onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              MRP / Original Price (₹)
            </label>
            <input
              type="number"
              min="0"
              value={mrp}
              onChange={(e) => setMrp(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              GST Tax Rate (%)
            </label>
            <input
              type="number"
              value={taxPercent}
              onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Garment Variants Matrix (Size, Color, Stock, SKU) */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
          <div>
            <h3 className="text-sm font-serif font-bold text-neutral-900">
              Garment Variants & Inventory
            </h3>
            <p className="text-[11px] text-neutral-500">
              Each color and size combination has its own SKU, inventory stock, and optional price.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddVariant}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-800 text-xs font-semibold hover:bg-neutral-50"
          >
            <Plus size={14} /> Add Variant
          </button>
        </div>

        <div className="space-y-3">
          {variants.map((v, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/60 grid grid-cols-2 sm:grid-cols-6 gap-3 items-center"
            >
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase">Size</label>
                <input
                  type="text"
                  value={v.size}
                  onChange={(e) => updateVariant(idx, 'size', e.target.value)}
                  placeholder="S, M, L..."
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg outline-none"
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase">Color Name</label>
                <input
                  type="text"
                  value={v.color}
                  onChange={(e) => updateVariant(idx, 'color', e.target.value)}
                  placeholder="e.g. Navy Blue"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg outline-none"
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase">Color Swatch</label>
                <input
                  type="color"
                  value={v.colorHex || '#333333'}
                  onChange={(e) => updateVariant(idx, 'colorHex', e.target.value)}
                  className="w-full h-8 px-1 py-0.5 bg-white border border-neutral-200 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase">Variant SKU</label>
                <input
                  type="text"
                  value={v.sku}
                  onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg outline-none font-mono"
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase">Stock Qty</label>
                <input
                  type="number"
                  min="0"
                  value={v.stock}
                  onChange={(e) => updateVariant(idx, 'stock', parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg outline-none font-mono"
                />
              </div>

              <div className="flex items-end justify-between gap-2 pt-4 sm:pt-0">
                <div className="space-y-0.5 flex-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase">Price (₹)</label>
                  <input
                    type="number"
                    value={v.price}
                    onChange={(e) => updateVariant(idx, 'price', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg outline-none font-mono"
                  />
                </div>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    className="p-2 text-neutral-400 hover:text-rose-600 transition"
                    title="Remove Variant"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Images Section — Dual Source: Local Computer Upload & Online URL */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
          <div>
            <h3 className="text-sm font-serif font-bold text-neutral-900">
              Product Images (Local Computer Upload & Online URLs)
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Select images from your computer or paste direct web URLs. The first image will be used as the primary storefront image.
            </p>
          </div>

          {/* Source Mode Tabs */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setImageSourceTab('upload');
                setImageError(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                imageSourceTab === 'upload'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Upload size={13} />
              Upload from Computer
            </button>
            <button
              type="button"
              onClick={() => {
                setImageSourceTab('url');
                setImageError(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                imageSourceTab === 'url'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Globe size={13} />
              Online Image URL
            </button>
          </div>
        </div>

        {/* Tab 1: Local Computer Upload */}
        {imageSourceTab === 'upload' && (
          <div className="bg-neutral-50/70 border border-dashed border-neutral-300 rounded-xl p-6 text-center hover:bg-neutral-50 transition">
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handleFileUpload}
              className="hidden"
              id="product-image-upload"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60 shadow-2xs">
                {uploadingImage ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-800">
                  {uploadingImage ? 'Processing & saving image...' : 'Upload an image from your computer'}
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Select from Desktop, Downloads, Documents, C:\, D:\ or any local drive (JPEG, PNG, WebP up to 10MB)
                </p>
              </div>
              <button
                type="button"
                disabled={uploadingImage}
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition disabled:opacity-50 flex items-center gap-2"
              >
                {uploadingImage ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={13} />
                    Choose Image from Computer
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Online Image URL */}
        {imageSourceTab === 'url' && (
          <div className="bg-neutral-50/70 border border-neutral-200 rounded-xl p-4 space-y-2">
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => {
                  setNewImageUrl(e.target.value);
                  if (imageError) setImageError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddOnlineImage();
                  }
                }}
                placeholder="https://example.com/product-image.jpg (Unsplash, Cloudinary, AWS S3, etc.)"
                className="flex-1 px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 bg-white"
              />
              <button
                type="button"
                onClick={handleAddOnlineImage}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition flex items-center gap-1.5"
              >
                <Plus size={13} />
                Add Image URL
              </button>
            </div>
            <p className="text-[11px] text-neutral-500">
              Paste a direct HTTPS image URL from any web server. Note: Local paths like D:\ cannot be pasted directly; please use the &ldquo;Upload from Computer&rdquo; tab.
            </p>
          </div>
        )}

        {/* Feedback Alerts */}
        {imageError && (
          <div className="flex items-center justify-between bg-rose-50 border border-rose-200 text-rose-800 px-3.5 py-2.5 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="text-rose-600 flex-shrink-0" />
              <span>{imageError}</span>
            </div>
            <button
              type="button"
              onClick={() => setImageError(null)}
              className="text-rose-600 hover:text-rose-800 p-0.5"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {imageSuccess && (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2.5 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle size={15} className="text-emerald-600 flex-shrink-0" />
              <span>{imageSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setImageSuccess(null)}
              className="text-emerald-600 hover:text-emerald-800 p-0.5"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Image Preview Gallery */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-700">
              Attached Images ({images.length})
            </span>
            <span className="text-[11px] text-neutral-400">
              Hover an image to set as primary or delete
            </span>
          </div>

          {images.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-neutral-200 rounded-xl text-xs text-neutral-400">
              No images added yet. Choose an image file or paste a URL above.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5">
              {images.map((img, idx) => {
                const isLocal = img.url.startsWith('/uploads');
                const isBroken = failedImageUrls[img.url];
                const displaySrc = isBroken ? FALLBACK_IMAGE_URL : img.url;

                return (
                  <div
                    key={idx}
                    className="relative aspect-[3/4] rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 group shadow-2xs"
                  >
                    <Image
                      src={displaySrc}
                      alt={`Preview ${idx + 1}`}
                      fill
                      unoptimized
                      onError={() => {
                        setFailedImageUrls((prev) => ({ ...prev, [img.url]: true }));
                      }}
                      className="object-cover"
                    />

                    {/* Primary Badge or Set Primary Action */}
                    {idx === 0 ? (
                      <span className="absolute top-2 left-2 bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-xs flex items-center gap-1">
                        <Star size={10} fill="currentColor" />
                        Primary
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(idx)}
                        className="absolute top-2 left-2 bg-black/75 hover:bg-neutral-900 text-white text-[10px] px-2 py-0.5 rounded-full font-medium opacity-0 group-hover:opacity-100 transition shadow-xs"
                      >
                        Set Primary
                      </button>
                    )}

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition opacity-0 group-hover:opacity-100 shadow-xs"
                      title="Remove image"
                    >
                      <Trash2 size={13} />
                    </button>

                    {/* Source Badge */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1">
                      <span className="bg-black/70 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
                        {isLocal ? 'Local Upload' : 'Web URL'}
                      </span>
                    </div>

                    {/* Broken URL Indicator */}
                    {isBroken && (
                      <span className="absolute bottom-2 right-2 bg-rose-600 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
                        Unreachable
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Fabric, Care & Description */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-serif font-bold text-neutral-900 border-b border-neutral-100 pb-2">
          Fabric, Care & Specifications
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Fabric & Weave Type
            </label>
            <input
              type="text"
              value={fabric}
              onChange={(e) => setFabric(e.target.value)}
              placeholder="e.g. 100% Pure Katan Banarasi Silk"
              className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Care Instructions
            </label>
            <input
              type="text"
              value={careInstructions}
              onChange={(e) => setCareInstructions(e.target.value)}
              placeholder="e.g. Dry Clean Only. Store in muslin cloth."
              className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Garment Specifications
            </label>
            <input
              type="text"
              value={specifications}
              onChange={(e) => setSpecifications(e.target.value)}
              placeholder="e.g. Length: 5.5m + 0.8m blouse piece | Jacquard Kadwa Zari"
              className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Short Summary
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="One line highlight displayed in product previews"
              className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Full Garment Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Comprehensive product storytelling and details..."
              className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Search Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="saree, banarasi, wedding, silk, luxury"
              className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
            />
          </div>
        </div>
      </div>

      {/* Visibility Flags */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-3">
        <h3 className="text-sm font-serif font-bold text-neutral-900 border-b border-neutral-100 pb-2">
          Visibility & Collection Placement
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="rounded text-amber-700 focus:ring-amber-700"
            />
            <span>Published Live</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded text-amber-700 focus:ring-amber-700"
            />
            <span>Featured Product</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700">
            <input
              type="checkbox"
              checked={isNewArrival}
              onChange={(e) => setIsNewArrival(e.target.checked)}
              className="rounded text-amber-700 focus:ring-amber-700"
            />
            <span>New Arrival</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700">
            <input
              type="checkbox"
              checked={isBestseller}
              onChange={(e) => setIsBestseller(e.target.checked)}
              className="rounded text-amber-700 focus:ring-amber-700"
            />
            <span>Bestseller</span>
          </label>
        </div>
      </div>
    </form>
  );
};
