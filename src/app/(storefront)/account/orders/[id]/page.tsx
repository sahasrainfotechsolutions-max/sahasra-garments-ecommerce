import React from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { getStoreConfig } from '@/lib/store-config';
import { OrderInvoice } from '@/components/storefront/OrderInvoice';
import { ArrowLeft, CheckCircle, Clock, PackageCheck, Truck, MapPin, MessageCircle } from 'lucide-react';
import { getWhatsAppUrl } from '@/lib/utils';

export const revalidate = 0;

interface OrderDetailPageProps {
  params: { id: string };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await getSession();
  const config = await getStoreConfig();

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      payments: true,
    },
  });

  if (!order) {
    notFound();
  }

  // Authorize: user must be authenticated and own the order (by userId or email) or be an ADMIN
  const isOwner = session && (
    (order.userId && session.id === order.userId) ||
    (order.customerEmail && session.email?.toLowerCase() === order.customerEmail.toLowerCase())
  );
  const isAdmin = session?.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    redirect('/auth/login?redirect=' + encodeURIComponent(`/account/orders/${params.id}`));
  }

  const steps = [
    { key: 'CONFIRMED', label: 'Order Confirmed', icon: CheckCircle },
    { key: 'PROCESSING', label: 'In Tailoring / Prep', icon: Clock },
    { key: 'PACKED', label: 'Packed & Quality Checked', icon: PackageCheck },
    { key: 'SHIPPED', label: 'Dispatched in Transit', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: MapPin },
  ];

  const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const currentIndex = statusOrder.indexOf(order.status);

  const whatsappSupportUrl = getWhatsAppUrl(
    config.whatsapp,
    `Hi ${config.storeName}, I have a query regarding my order #${order.orderNumber}.`
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <Link href="/account/orders" className="hover:text-neutral-700 flex items-center gap-1">
              <ArrowLeft size={12} /> All Orders
            </Link>
            <span>/</span>
            <span className="font-mono text-neutral-800 font-bold">{order.orderNumber}</span>
          </div>
          <h1 className="text-2xl font-serif font-black text-neutral-900">
            Order Status & Tax Invoice
          </h1>
        </div>

        {config.whatsapp && (
          <a
            href={whatsappSupportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition"
          >
            <MessageCircle size={15} /> WhatsApp Support for Order
          </a>
        )}
      </div>

      {/* Visual Timeline Tracker */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
          Delivery Timeline Status
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {steps.map((step, idx) => {
            const stepIndex = statusOrder.indexOf(step.key);
            const isCompleted = currentIndex >= stepIndex && order.status !== 'CANCELLED';
            const isCurrent = order.status === step.key;
            const IconComponent = step.icon;

            return (
              <div
                key={step.key}
                className={`p-3 rounded-xl border flex flex-col items-center text-center gap-2 transition ${
                  isCurrent
                    ? 'border-amber-700 bg-amber-50/70 text-amber-900 shadow-2xs'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
                    : 'border-neutral-200 bg-neutral-50/50 text-neutral-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCurrent
                      ? 'bg-amber-700 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-200 text-neutral-500'
                  }`}
                >
                  <IconComponent size={16} />
                </div>
                <span className="text-[11px] font-semibold leading-tight">{step.label}</span>
              </div>
            );
          })}
        </div>

        {order.status === 'CANCELLED' && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold text-center">
            This order has been cancelled.
          </div>
        )}
      </div>

      {/* Tax Invoice */}
      <OrderInvoice order={order} config={config} />
    </div>
  );
}
