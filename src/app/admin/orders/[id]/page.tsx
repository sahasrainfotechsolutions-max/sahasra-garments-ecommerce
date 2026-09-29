import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getStoreConfig } from '@/lib/store-config';
import { OrderStatusChanger } from '@/components/admin/OrderStatusChanger';
import { OrderInvoice } from '@/components/storefront/OrderInvoice';
import { ArrowLeft } from 'lucide-react';

export const revalidate = 0;

interface AdminOrderDetailPageProps {
  params: { id: string };
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const config = await getStoreConfig();

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      payments: true,
      user: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3 border-b border-neutral-200 pb-4">
        <Link
          href="/admin/orders"
          className="p-2 rounded-lg border border-neutral-200 text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-serif font-bold text-neutral-900">
            Manage Order #{order.orderNumber}
          </h1>
          <p className="text-xs text-neutral-500">
            Customer: {order.customerName} ({order.customerEmail})
          </p>
        </div>
      </div>

      {/* Status Controls */}
      <OrderStatusChanger
        orderId={order.id}
        currentStatus={order.status}
        currentPaymentStatus={order.paymentStatus}
      />

      {/* Tax Invoice View */}
      <OrderInvoice order={order} config={config} />
    </div>
  );
}
