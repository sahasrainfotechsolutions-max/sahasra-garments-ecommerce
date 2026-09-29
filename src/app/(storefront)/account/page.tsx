import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Package,
  Heart,
  User,
  ShoppingBag,
  Clock,
  ArrowRight,
  LogOut,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { LogoutButton } from './LogoutButton';

export const revalidate = 0;

export default async function AccountPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { items: true },
      },
      addresses: true,
      customer: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  const totalSpent = user.orders.reduce((acc, order) => acc + order.grandTotal, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-serif text-2xl font-bold border border-amber-200">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Customer Dashboard
            </span>
            <h1 className="text-2xl font-serif font-black text-neutral-900">{user.name}</h1>
            <p className="text-xs text-neutral-500">{user.email} • Member since {formatDate(user.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            href="/account/orders"
            className="flex-1 md:flex-none text-center px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 transition"
          >
            My Orders
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
            <Package size={22} />
          </div>
          <div>
            <div className="text-xs text-neutral-500 font-medium">Total Orders</div>
            <div className="text-xl font-bold text-neutral-900 mt-0.5">{user.orders.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
            <ShoppingBag size={22} />
          </div>
          <div>
            <div className="text-xs text-neutral-500 font-medium">Total Spent</div>
            <div className="text-xl font-bold text-neutral-900 mt-0.5">
              {formatCurrency(totalSpent)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <Heart size={22} />
          </div>
          <div>
            <div className="text-xs text-neutral-500 font-medium">Saved Garments</div>
            <Link
              href="/wishlist"
              className="text-xs font-semibold text-rose-600 hover:underline mt-1 block"
            >
              View Wishlist →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-base font-serif font-bold text-neutral-900">Recent Orders</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Track recent package statuses, items, and download invoices.
            </p>
          </div>
          <Link
            href="/account/orders"
            className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1"
          >
            View all orders <ArrowRight size={13} />
          </Link>
        </div>

        {user.orders.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 space-y-3">
            <Package className="w-10 h-10 mx-auto text-neutral-300" />
            <p className="text-xs">You have not placed any orders yet.</p>
            <Link
              href="/shop"
              className="inline-block px-5 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {user.orders.map((order) => (
              <div
                key={order.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 p-2 rounded-xl transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-neutral-900">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : order.status === 'CANCELLED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500">
                    Placed on {formatDate(order.createdAt)} • {order.items.length}{' '}
                    {order.items.length === 1 ? 'garment' : 'garments'}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-sm font-bold text-neutral-900 font-mono">
                    {formatCurrency(order.grandTotal)}
                  </div>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 transition"
                  >
                    View Details <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
