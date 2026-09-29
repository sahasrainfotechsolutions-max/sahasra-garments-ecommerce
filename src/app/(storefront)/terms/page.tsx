import React from 'react';
import { getStoreConfig } from '@/lib/store-config';

export const revalidate = 0;

export default async function TermsPage() {
  const config = await getStoreConfig();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-3xl font-serif font-black text-neutral-900 tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs text-neutral-500 mt-1">Effective Date: January 1, {new Date().getFullYear()}</p>
      </div>

      <div className="text-xs sm:text-sm text-neutral-700 space-y-6 leading-relaxed">
        <p>
          Welcome to <strong>{config.storeName}</strong>. These terms and conditions outline the
          rules and regulations for the use of our garments e-commerce platform.
        </p>

        <h3 className="text-base font-bold text-neutral-900">1. Acceptance of Terms</h3>
        <p>
          By accessing this website and placing an order, we assume you accept these terms and
          conditions in full. Do not continue to use {config.storeName} if you do not agree to all
          of the terms stated on this page.
        </p>

        <h3 className="text-base font-bold text-neutral-900">2. Garment Products & Colors</h3>
        <p>
          We strive to display as accurately as possible the colors and weaves of our fashion
          garments. However, due to natural lighting during photography and varying screen displays,
          minor shade variances may occasionally exist.
        </p>

        <h3 className="text-base font-bold text-neutral-900">3. Pricing and Availability</h3>
        <p>
          All prices are listed in Indian Rupees ({config.currencySymbol}) and include applicable GST
          as per Indian statutory regulations. We reserve the right to amend prices and correct any
          inadvertent typographical errors prior to order dispatch.
        </p>

        <h3 className="text-base font-bold text-neutral-900">4. Governing Law</h3>
        <p>
          Any disputes arising out of your purchase shall be governed by the laws of India and
          subject to the exclusive jurisdiction of the courts located in {config.city}, {config.state}.
        </p>
      </div>
    </div>
  );
}
