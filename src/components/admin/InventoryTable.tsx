'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Check, RefreshCw, Plus, Minus, Search } from 'lucide-react';

interface InventoryItem {
  id: string;
  variantId: string;
  currentStock: number;
  reservedStock: number;
  soldQuantity: number;
  lowStockThreshold: number;
  variant: {
    id: string;
    sku: string;
    size: string;
    color: string;
    product: {
      id: string;
      name: string;
      sku: string;
      category?: { name: string };
    };
  };
}

export const InventoryTable: React.FC<{ initialInventories: InventoryItem[] }> = ({
  initialInventories,
}) => {
  const router = useRouter();
  const [inventories, setInventories] = useState<InventoryItem[]>(initialInventories);
  const [filter, setFilter] = useState<'all' | 'low'>('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStockChange = async (variantId: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    setUpdatingId(variantId);

    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, currentStock: newStock }),
      });

      if (res.ok) {
        setInventories((prev) =>
          prev.map((item) =>
            item.variantId === variantId ? { ...item, currentStock: newStock } : item
          )
        );
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = inventories.filter((item) => {
    if (filter === 'low' && item.currentStock > (item.lowStockThreshold || 5)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.variant.sku.toLowerCase().includes(q) ||
        item.variant.product.name.toLowerCase().includes(q) ||
        item.variant.color.toLowerCase().includes(q) ||
        item.variant.size.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-black text-neutral-900 tracking-tight">
            Inventory & Stock Control
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Monitor real-time stock levels, low-stock threshold warnings, and adjust quantities per variant.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filter === 'all'
                ? 'bg-neutral-900 text-white'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            All Items ({inventories.length})
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              filter === 'low'
                ? 'bg-amber-700 text-white'
                : 'bg-white border border-neutral-200 text-amber-800 hover:bg-amber-50'
            }`}
          >
            <AlertTriangle size={13} />
            Low Stock Alerts (
            {inventories.filter((i) => i.currentStock <= (i.lowStockThreshold || 5)).length})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-3 shadow-2xs flex items-center">
        <Search size={15} className="text-neutral-400 ml-2 mr-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by garment name, variant color, size, or SKU..."
          className="w-full text-xs outline-none bg-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50/80 text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3.5">Product & Collection</th>
              <th className="px-4 py-3.5">Variant Details</th>
              <th className="px-4 py-3.5 font-mono">SKU</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Current Stock</th>
              <th className="px-4 py-3.5 text-center">Adjust Stock</th>
              <th className="px-4 py-3.5 text-right font-mono">Units Sold</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs text-neutral-400">
                  No inventory records match the current filter.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isLow = item.currentStock <= (item.lowStockThreshold || 5);
                const isOut = item.currentStock <= 0;

                return (
                  <tr key={item.id} className="hover:bg-neutral-50/60 transition">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-neutral-900">{item.variant.product.name}</div>
                      <div className="text-[11px] text-neutral-400">
                        {item.variant.product.category?.name}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral-800">{item.variant.color}</span>
                        <span className="bg-neutral-100 px-2 py-0.5 rounded text-[11px] font-bold">
                          {item.variant.size}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono text-neutral-600 text-[11px]">
                      {item.variant.sku}
                    </td>

                    <td className="px-4 py-3">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <AlertTriangle size={11} /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Check size={11} /> Healthy
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-sm text-neutral-900">
                      {item.currentStock}
                    </td>

                    {/* Quick Stepper */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStockChange(item.variantId, item.currentStock, -1)}
                          disabled={item.currentStock <= 0 || updatingId === item.variantId}
                          className="p-1 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-30 transition"
                          title="Subtract 1 unit"
                        >
                          <Minus size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStockChange(item.variantId, item.currentStock, 5)}
                          disabled={updatingId === item.variantId}
                          className="px-2 py-1 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 text-[11px] font-semibold transition"
                          title="Add 5 units"
                        >
                          +5
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStockChange(item.variantId, item.currentStock, 10)}
                          disabled={updatingId === item.variantId}
                          className="px-2 py-1 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 text-[11px] font-semibold transition"
                          title="Add 10 units"
                        >
                          +10
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-semibold text-neutral-700">
                      {item.soldQuantity}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
