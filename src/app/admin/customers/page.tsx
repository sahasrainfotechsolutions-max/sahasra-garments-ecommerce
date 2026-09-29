import React from 'react';
import prisma from '@/lib/prisma';
import { getStoreId } from '@/lib/store-config';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Users, Mail, Phone, ShoppingCart } from 'lucide-react';

export const revalidate = 0;

export default async function AdminCustomersPage() {
  const storeId = await getStoreId();

  const customers = await prisma.customer.findMany({
    where: { storeId },
    orderBy: { createdAt: 'desc' },
    include: {
      orders: {
        select: { id: true, orderNumber: true, grandTotal: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-black text-neutral-900 tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Registered customer accounts, contact directories, and lifetime spend histories.
          </p>
        </div>

        <span className="text-xs text-neutral-500 font-medium">
          Total: <strong className="text-neutral-900">{customers.length}</strong> customers
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50/80 text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3.5">Customer Name</th>
              <th className="px-4 py-3.5">Contact Details</th>
              <th className="px-4 py-3.5">Joined Date</th>
              <th className="px-4 py-3.5 text-center">Orders Placed</th>
              <th className="px-4 py-3.5 font-mono">Lifetime Spend</th>
              <th className="px-4 py-3.5">Most Recent Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-neutral-400">
                  No registered customers yet.
                </td>
              </tr>
            ) : (
              customers.map((c) => {
                const totalSpent = c.orders.reduce((acc, o) => acc + o.grandTotal, 0);
                const recent = c.orders[0];

                return (
                  <tr key={c.id} className="hover:bg-neutral-50/60 transition">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-neutral-900">{c.name}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">ID: {c.id.slice(-6)}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5 text-neutral-600">
                        <span className="flex items-center gap-1">
                          <Mail size={12} className="text-neutral-400" /> {c.email}
                        </span>
                        {c.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={12} className="text-neutral-400" /> {c.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-neutral-500">{formatDate(c.createdAt)}</td>

                    <td className="px-4 py-3 text-center">
                      <span className="bg-neutral-100 px-2 py-0.5 rounded text-[11px] font-mono font-bold text-neutral-700">
                        {c.orders.length}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-neutral-900">
                      {formatCurrency(totalSpent)}
                    </td>

                    <td className="px-4 py-3">
                      {recent ? (
                        <div className="text-neutral-700">
                          <span className="font-mono font-semibold">{recent.orderNumber}</span>
                          <span className="text-[10px] text-neutral-400 block">
                            {formatDate(recent.createdAt)} ({formatCurrency(recent.grandTotal)})
                          </span>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic">No orders yet</span>
                      )}
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
}
