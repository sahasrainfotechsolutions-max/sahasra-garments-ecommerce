import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { getStoreId } from '@/lib/store-config';
import { formatCurrency } from '@/lib/utils';
import { PlusCircle, Search, Edit2, Package, Sparkles } from 'lucide-react';
import { ProductDeleteButton } from './ProductDeleteButton';

export const revalidate = 0;

interface AdminProductsPageProps {
  searchParams: { q?: string };
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const storeId = await getStoreId();
  const query = searchParams.q?.trim() || '';

  const products = await prisma.product.findMany({
    where: {
      storeId,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { sku: { contains: query, mode: 'insensitive' } },
              { fabric: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      brand: true,
      images: { orderBy: { displayOrder: 'asc' } },
      variants: true,
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-black text-neutral-900 tracking-tight">
            Garment Product Management
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure fashion apparel, manage color/size variants, pricing, and availability.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 shadow-sm transition self-start sm:self-auto"
        >
          <PlusCircle size={15} /> Add New Garment
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-2xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form className="w-full sm:w-80 relative flex items-center">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by product name, SKU..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
          />
          <Search size={15} className="absolute left-3 text-neutral-400" />
        </form>

        <span className="text-xs text-neutral-500 font-medium">
          Total: <strong className="text-neutral-900">{products.length}</strong> garments
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3.5">Garment Details</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Brand</th>
                <th className="px-4 py-3.5">Base Price</th>
                <th className="px-4 py-3.5">Variants & Stock</th>
                <th className="px-4 py-3.5">Badges</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400 text-xs">
                    No garments found. Click &quot;Add New Garment&quot; to create one.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
                  const primaryImage = p.images[0]?.url;

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/60 transition">
                      {/* Product Thumbnail + Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-14 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0 border border-neutral-200">
                            {primaryImage ? (
                              <Image
                                src={primaryImage}
                                alt={p.name}
                                fill
                                className="object-cover object-top"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">
                                None
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-900 line-clamp-1">{p.name}</div>
                            <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                              SKU: {p.sku}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-neutral-600 font-medium">
                        {p.category.name}
                      </td>

                      {/* Brand */}
                      <td className="px-4 py-3 text-neutral-600">
                        {p.brand?.name || '—'}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 font-mono font-bold text-neutral-900">
                        {formatCurrency(p.basePrice)}
                      </td>

                      {/* Variants & Stock */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-neutral-800">
                            {p.variants.length} {p.variants.length === 1 ? 'variant' : 'variants'}
                          </span>
                          <span
                            className={`text-[11px] font-mono ${
                              totalStock <= 5 ? 'text-amber-700 font-bold' : 'text-neutral-500'
                            }`}
                          >
                            Total Stock: {totalStock}
                          </span>
                        </div>
                      </td>

                      {/* Badges */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {p.isFeatured && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                              Featured
                            </span>
                          )}
                          {p.isNewArrival && (
                            <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                              New
                            </span>
                          )}
                          {p.isBestseller && (
                            <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                              Bestseller
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            p.isPublished
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                          }`}
                        >
                          {p.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-amber-800 hover:bg-neutral-100 transition"
                            title="Edit Product"
                          >
                            <Edit2 size={13} />
                          </Link>
                          <ProductDeleteButton productId={p.id} productName={p.name} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
