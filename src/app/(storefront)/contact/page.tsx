import React from 'react';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { getStoreConfig } from '@/lib/store-config';
import { getWhatsAppUrl } from '@/lib/utils';
import { ContactForm } from '@/components/storefront/ContactForm';

export const revalidate = 60;

export default async function ContactPage() {
  const config = await getStoreConfig();
  const whatsappUrl = getWhatsAppUrl(
    config.whatsapp,
    `Hi ${config.storeName}, I have an inquiry.`
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-neutral-900">
          We&apos;re Here to Assist You
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Have a query regarding a garment, custom sizing, bridal order, or order tracking? Reach out to us.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Card */}
        <div className="lg:col-span-5 bg-neutral-900 text-white rounded-3xl p-8 sm:p-10 space-y-8 shadow-xl">
          <div>
            <h3 className="text-xl font-serif font-bold">Contact Concierge</h3>
            <p className="text-xs text-neutral-400 mt-1">
              Our fashion specialists are available Monday to Saturday, 10:00 AM to 7:00 PM IST.
            </p>
          </div>

          <div className="space-y-5 text-xs text-neutral-300">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Boutique & Showroom:</strong>
                <span>
                  {config.address}, {config.city}, {config.state} - {config.pincode}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <strong className="text-white block mb-0.5">Customer Support:</strong>
                <a href={`tel:${config.phone.replace(/\s+/g, '')}`} className="hover:text-white transition">
                  {config.phone}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <strong className="text-white block mb-0.5">General Inquiries:</strong>
                <a href={`mailto:${config.email}`} className="hover:text-white transition">
                  {config.email}
                </a>
              </div>
            </div>
          </div>

          {config.whatsapp && (
            <div className="pt-4 border-t border-neutral-800">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition w-full justify-center"
              >
                <MessageCircle size={16} /> Instant Chat on WhatsApp
              </a>
            </div>
          )}
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-neutral-200/80 p-8 shadow-sm">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
