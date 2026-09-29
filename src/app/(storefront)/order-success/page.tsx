import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ShoppingBag, MessageCircle, ArrowRight } from 'lucide-react';
import { getStoreConfig } from '@/lib/store-config';
import { getWhatsAppUrl } from '@/lib/utils';

export const revalidate = 0;

interface OrderSuccessPageProps {
  searchParams: { orderNumber?: string };
}

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const config = await getStoreConfig();
  const orderNumber = searchParams.orderNumber || 'SG-2026';

  const whatsappUrl = getWhatsAppUrl(
    config.whatsapp,
    `Hi ${config.storeName}, I have just placed order #${orderNumber} and wanted to confirm details.`
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-8 sm:p-12 shadow-sm space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
          <CheckCircle2 size={40} />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Order Confirmed
          </span>
          <h1 className="text-3xl font-serif font-black text-neutral-900 mt-1">
            Thank You for Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2 max-w-md mx-auto">
            Your garments are being carefully prepared and packaged by our master tailors.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-100/70 border border-neutral-200 inline-block text-left">
          <div className="text-xs text-neutral-500">Order Reference Number:</div>
          <div className="text-xl font-bold font-mono text-neutral-900 mt-0.5">{orderNumber}</div>
        </div>

        <p className="text-xs text-neutral-500">
          A confirmation with your order tracking link has been dispatched to your email and phone.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/account/orders"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-neutral-900 text-white font-semibold text-xs hover:bg-neutral-800 transition"
          >
            <ShoppingBag size={16} /> View in My Orders
          </Link>

          {config.whatsapp && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold text-xs hover:bg-emerald-100 transition"
            >
              <MessageCircle size={16} /> WhatsApp Order Support
            </a>
          )}
        </div>

        <div className="pt-4 border-t border-neutral-100">
          <Link
            href="/shop"
            className="text-xs text-amber-800 hover:text-amber-900 font-semibold inline-flex items-center gap-1"
          >
            Continue browsing collections <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
