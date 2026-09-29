import React from 'react';
import { getStoreConfig } from '@/lib/store-config';

export const revalidate = 0;

export default async function PrivacyPolicyPage() {
  const config = await getStoreConfig();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-3xl font-serif font-black text-neutral-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-neutral-500 mt-1">Last updated: {new Date().getFullYear()}</p>
      </div>

      <div className="prose prose-neutral max-w-none text-xs sm:text-sm text-neutral-700 space-y-6 leading-relaxed">
        <p>
          At <strong>{config.storeName}</strong>, accessible from our online boutique, one of our
          main priorities is the privacy of our visitors and customers. This Privacy Policy document
          contains types of information that is collected and recorded by {config.storeName} and how
          we use it.
        </p>

        <h3 className="text-base font-bold text-neutral-900">1. Information We Collect</h3>
        <p>
          When you register for an account, make an order, or contact us, we may ask for your
          contact information including name, email address, shipping delivery address, and phone
          number.
        </p>

        <h3 className="text-base font-bold text-neutral-900">2. How We Use Your Information</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Fulfill, ship, and track your garment orders across India.</li>
          <li>Communicate with you regarding order confirmations, updates, and customer support.</li>
          <li>Send promotional vouchers and seasonal collection alerts (which you can opt out of).</li>
          <li>Prevent fraudulent transactions and secure account logins.</li>
        </ul>

        <h3 className="text-base font-bold text-neutral-900">3. Data Security</h3>
        <p>
          We use industry-standard encryption, salted bcrypt password hashing, and secure HTTPS/SSL
          protocols to safeguard your personal information. Payment transactions are processed
          through encrypted gateways; we never store raw credit/debit card numbers or CVVs.
        </p>

        <h3 className="text-base font-bold text-neutral-900">4. Contact Information</h3>
        <p>
          If you have any questions or suggestions about our Privacy Policy, please contact us at{' '}
          <a href={`mailto:${config.email}`} className="text-amber-800 underline">
            {config.email}
          </a>{' '}
          or write to us at {config.address}, {config.city}, {config.state} - {config.pincode}.
        </p>
      </div>
    </div>
  );
}
