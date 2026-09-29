import React from 'react';
import { getStoreConfig } from '@/lib/store-config';
import { RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';

export const revalidate = 0;

export default async function ReturnPolicyPage() {
  const config = await getStoreConfig();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-3xl font-serif font-black text-neutral-900 tracking-tight">
          Returns & Exchange Policy
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          7-day hassle-free return and exchange guarantee on our garments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase">
            <CheckCircle size={16} /> Eligible for Return / Exchange
          </div>
          <ul className="text-xs text-emerald-900 space-y-1 list-disc pl-4">
            <li>Unworn, unwashed garments with all original brand tags intact.</li>
            <li>Size mismatch or fit exchange requests made within 7 days of delivery.</li>
            <li>Damaged in transit or manufacturing defect items reported within 48 hours.</li>
          </ul>
        </div>

        <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase">
            <AlertCircle size={16} /> Non-Returnable Items
          </div>
          <ul className="text-xs text-rose-900 space-y-1 list-disc pl-4">
            <li>Customized, altered, or tailor-hemmed garments.</li>
            <li>Sarees with pre-stitched fall/pico completed on customer request.</li>
            <li>Items returned without original packaging or tags detached.</li>
          </ul>
        </div>
      </div>

      <div className="text-xs sm:text-sm text-neutral-700 space-y-6 leading-relaxed">
        <h3 className="text-base font-bold text-neutral-900">How to Initiate an Exchange or Return</h3>
        <p>
          To request a size change or return, simply message our concierge team on WhatsApp at{' '}
          <strong>{config.whatsapp}</strong> or email{' '}
          <a href={`mailto:${config.email}`} className="text-amber-800 underline">
            {config.email}
          </a>{' '}
          with your Order Number and photos of the garment.
        </p>
        <p>
          Our courier partner will arrange doorstep pickup within 2-3 business days. Once received
          and inspected, your refund or replacement will be initiated immediately.
        </p>
      </div>
    </div>
  );
}
