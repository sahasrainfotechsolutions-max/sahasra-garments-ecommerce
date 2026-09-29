import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getStoreId } from '@/lib/store-config';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const storeId = await getStoreId();

  // Gather stats concurrently
  const [
    totalOrders,
    pendingOrders,
    totalProducts,
    totalCustomers,
    recentOrders,
    recentCustomers,
    lowStockVariants,
    allOrders,
  ] = await Promise.all([
    prisma.order.count({ where: { storeId } }),
    prisma.order.count({ where: { storeId, status: 'PENDING' } }),
    prisma.product.count({ where: { storeId } }),
    prisma.customer.count({ where: { storeId } }),
    prisma.order.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { items: true },
    }),
    prisma.customer.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { _count: { select: { orders: true } } },
    }),
    prisma.inventory.count({
      where: {
        currentStock: { lte: 5 },
        variant: { product: { storeId } },
      },
    }),
    prisma.order.findMany({
      where: { storeId, paymentStatus: 'PAID' },
      select: { grandTotal: true },
    }),
  ]);

  const totalSales = allOrders.reduce((sum, o) => sum + o.grandTotal, 0);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-black text-neutral-900 tracking-tight">
            Store Performance Overview
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time analytics, inventory signals, and customer orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 shadow-sm transition"
          >
            <PlusCircle size={15} /> Add New Garment
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Total Sales</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-neutral-900">
            {formatCurrency(totalSales)}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <TrendingUp size={12} /> Confirmed & Paid Revenue
          </p>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingCart size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-neutral-900">{totalOrders}</div>
          <p className="text-[11px] text-neutral-500">
            <strong className="text-amber-700">{pendingOrders}</strong> pending processing
          </p>
        </div>

        {/* Catalog Products */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Garments in Catalog</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Package size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-neutral-900">{totalProducts}</div>
          <p className="text-[11px] text-neutral-500">Across active collections</p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Low Stock Warnings</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-neutral-900">{lowStockVariants}</div>
          <p className="text-[11px] text-neutral-500">
            <Link href="/admin/inventory" className="text-amber-800 hover:underline font-semibold">
              Review Inventory →
            </Link>
          </p>
        </div>
      </div>

      {/* Main Row: Recent Orders Table & Recent Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h2 className="text-base font-serif font-bold text-neutral-900">Recent Customer Orders</h2>
              <p className="text-xs text-neutral-500">Latest transactions placed in this store.</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1"
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-neutral-400 border-b border-neutral-200 pb-2">
                <tr>
                  <th className="py-2.5">Order</th>
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50/60 transition">
                    <td className="py-3 font-mono font-bold text-neutral-900">
                      <Link href={`/admin/orders/${order.id}`} className="hover:text-amber-800">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 text-neutral-800">{order.customerName}</td>
                    <td className="py-3 text-neutral-500">{formatDate(order.createdAt)}</td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          order.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : order.status === 'CANCELLED'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-neutral-900">
                      {formatCurrency(order.grandTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Customers (1 Column) */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h2 className="text-base font-serif font-bold text-neutral-900">New Customers</h2>
              <p className="text-xs text-neutral-500">{totalCustomers} registered accounts</p>
            </div>
            <Link
              href="/admin/customers"
              className="text-xs font-semibold text-amber-800 hover:text-amber-900"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-neutral-100">
            {recentCustomers.map((cust) => (
              <div key={cust.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-neutral-900">{cust.name}</div>
                  <div className="text-neutral-500 text-[11px]">{cust.email}</div>
                </div>
                <div className="text-right">
                  <span className="font-mono bg-neutral-100 px-2 py-0.5 rounded text-[11px] text-neutral-700">
                    {cust._count.orders} {cust._count.orders === 1 ? 'order' : 'orders'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
