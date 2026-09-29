import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Package, ChevronRight, ArrowLeft } from 'lucide-react';

export const revalidate = 0;

export default async function CustomerOrdersPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <Link href="/account" className="hover:text-neutral-700 flex items-center gap-1">
              <ArrowLeft size={12} /> Dashboard
            </Link>
            <span>/</span>
            <span className="text-neutral-800 font-semibold">Orders</span>
          </div>
          <h1 className="text-2xl font-serif font-black text-neutral-900">Order History</h1>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center space-y-3">
          <Package className="w-12 h-12 mx-auto text-neutral-300" />
          <h3 className="text-base font-serif font-bold text-neutral-800">No orders found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            You have not placed any orders yet. Discover our master collection of hand-crafted garments.
          </p>
          <Link
            href="/shop"
            className="inline-block px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition"
          >
            Explore Collections
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4 hover:shadow-xs transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-bold text-neutral-900">
                    {order.orderNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      order.status === 'DELIVERED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : order.status === 'CANCELLED'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="text-xs text-neutral-400">
                    Payment: <strong className="text-neutral-700 uppercase font-mono">{order.paymentMethod}</strong> ({order.paymentStatus})
                  </span>
                </div>

                <div className="text-xs text-neutral-500">
                  Ordered on {formatDate(order.createdAt)}
                </div>
              </div>

              {/* Items Summary */}
              <div className="divide-y divide-neutral-100">
                {order.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-neutral-900">{item.productName}</span>
                      <span className="text-neutral-500 ml-2">
                        ({item.variantTitle || item.sku}) × {item.quantity}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-neutral-900">
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer Total & Link */}
              <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-xs text-neutral-500">
                  Total Payable:{' '}
                  <strong className="text-sm font-bold text-neutral-900 font-mono">
                    {formatCurrency(order.grandTotal)}
                  </strong>
                </div>

                <Link
                  href={`/account/orders/${order.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 transition"
                >
                  View Details & Invoice <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
