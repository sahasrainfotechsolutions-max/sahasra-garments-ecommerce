import React from 'react';
import { getStoreConfig } from '@/lib/store-config';
import { formatCurrency } from '@/lib/utils';
import { Truck, Clock, ShieldCheck } from 'lucide-react';

export const revalidate = 0;

export default async function ShippingPolicyPage() {
  const config = await getStoreConfig();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-3xl font-serif font-black text-neutral-900 tracking-tight">
          Shipping & Delivery Policy
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Fast, reliable express shipping across 19,000+ Indian pincodes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 space-y-2">
          <Truck className="w-6 h-6 text-amber-700" />
          <h4 className="font-bold text-xs uppercase text-neutral-900">Pan-India Reach</h4>
          <p className="text-xs text-neutral-600">
            Delivering across all states and union territories via premium logistics carriers.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 space-y-2">
          <Clock className="w-6 h-6 text-amber-700" />
          <h4 className="font-bold text-xs uppercase text-neutral-900">Swift Dispatch</h4>
          <p className="text-xs text-neutral-600">
            Orders dispatched within 24 to 48 business hours with live SMS tracking.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 space-y-2">
          <ShieldCheck className="w-6 h-6 text-amber-700" />
          <h4 className="font-bold text-xs uppercase text-neutral-900">Free Delivery</h4>
          <p className="text-xs text-neutral-600">
            Complimentary shipping on all cart orders above{' '}
            {formatCurrency(config.freeShippingThreshold, config.currencySymbol)}.
          </p>
        </div>
      </div>

      <div className="text-xs sm:text-sm text-neutral-700 space-y-6 leading-relaxed">
        <h3 className="text-base font-bold text-neutral-900">1. Shipping Charges</h3>
        <p>
          We offer FREE delivery for all prepaid and COD orders exceeding{' '}
          <strong>
            {formatCurrency(config.freeShippingThreshold, config.currencySymbol)}
          </strong>
          . For orders below this threshold, a flat delivery charge of{' '}
          <strong>{formatCurrency(config.shippingCharge, config.currencySymbol)}</strong> applies.
        </p>

        <h3 className="text-base font-bold text-neutral-900">2. Estimated Delivery Time</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Metro Cities:</strong> 2 - 4 business days.
          </li>
          <li>
            <strong>Tier 2 & Tier 3 Cities:</strong> 4 - 6 business days.
          </li>
          <li>
            <strong>Remote & North-Eastern regions:</strong> 5 - 8 business days.
          </li>
        </ul>

        <h3 className="text-base font-bold text-neutral-900">3. Live Tracking</h3>
        <p>
          As soon as your package leaves our fulfillment center, you will receive an email and
          WhatsApp message with your consignment tracking number and estimated delivery day.
        </p>
      </div>
    </div>
  );
}
