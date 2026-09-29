import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getStoreId } from '@/lib/store-config';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ShoppingCart, Eye, Search, Filter } from 'lucide-react';

export const revalidate = 0;

interface AdminOrdersPageProps {
  searchParams: { q?: string; status?: string };
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const storeId = await getStoreId();
  const query = searchParams.q?.trim() || '';
  const statusFilter = searchParams.status || '';

  const orders = await prisma.order.findMany({
    where: {
      storeId,
      ...(statusFilter ? { status: statusFilter as any } : {}),
      ...(query
        ? {
            OR: [
              { orderNumber: { contains: query, mode: 'insensitive' } },
              { customerName: { contains: query, mode: 'insensitive' } },
              { customerEmail: { contains: query, mode: 'insensitive' } },
              { customerPhone: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
    },
  });

  const statuses = [
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'PACKED',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-black text-neutral-900 tracking-tight">
            Order Fulfillment & Management
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Process incoming orders, track payment statuses, manage packaging, and print tax invoices.
          </p>
        </div>

        <span className="text-xs text-neutral-500 self-start sm:self-auto font-medium">
          Total: <strong className="text-neutral-900">{orders.length}</strong> orders
        </span>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-2xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form className="w-full sm:w-80 relative flex items-center">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by order #, customer name, email..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
          />
          <Search size={15} className="absolute left-3 text-neutral-400" />
        </form>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap gap-1.5 self-start sm:self-auto">
          <Link
            href="/admin/orders"
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              !statusFilter ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            All
          </Link>
          {['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((st) => (
            <Link
              key={st}
              href={`/admin/orders?status=${st}`}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                statusFilter === st
                  ? 'bg-amber-700 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {st}
            </Link>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3.5">Order Number</th>
                <th className="px-4 py-3.5">Customer & Phone</th>
                <th className="px-4 py-3.5">Items</th>
                <th className="px-4 py-3.5">Order Date</th>
                <th className="px-4 py-3.5">Payment</th>
                <th className="px-4 py-3.5">Fulfillment Status</th>
                <th className="px-4 py-3.5 text-right font-mono">Grand Total</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-neutral-400">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-50/60 transition">
                    <td className="px-4 py-3 font-mono font-bold text-neutral-900">
                      <Link href={`/admin/orders/${o.id}`} className="hover:text-amber-800">
                        {o.orderNumber}
                      </Link>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-neutral-900">{o.customerName}</div>
                      <div className="text-[11px] text-neutral-500">{o.customerPhone}</div>
                    </td>

                    <td className="px-4 py-3 text-neutral-700">
                      {o.items.length} {o.items.length === 1 ? 'garment' : 'garments'}
                    </td>

                    <td className="px-4 py-3 text-neutral-500">{formatDate(o.createdAt)}</td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold uppercase text-neutral-800 font-mono">
                          {o.paymentMethod}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            o.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {o.paymentStatus}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          o.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : o.status === 'CANCELLED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-bold text-neutral-900">
                      {formatCurrency(o.grandTotal)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 hover:text-amber-800 hover:bg-neutral-100 transition"
                      >
                        <Eye size={13} />
                        <span>Manage</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
