import React from 'react';
import Link from 'next/link';
import { StoreConfig } from '@/types';
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Instagram,
  Facebook,
  Youtube,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
} from 'lucide-react';
import { getWhatsAppUrl } from '@/lib/utils';

interface FooterProps {
  config: StoreConfig;
}

export const Footer: React.FC<FooterProps> = ({ config }) => {
  const currentYear = new Date().getFullYear();
  const whatsappUrl = getWhatsAppUrl(
    config.whatsapp,
    `Hello ${config.storeName}, I would like to get in touch.`
  );

  return (
    <footer className="bg-neutral-950 text-neutral-400 border-t border-neutral-800">
      {/* Value Proposition Highlights Banner */}
      <div className="border-b border-neutral-850 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 flex items-center justify-center text-amber-500 flex-shrink-0">
              <Truck size={22} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-100">Pan-India Delivery</h4>
              <p className="text-xs text-neutral-500 mt-0.5">Express shipping to 19,000+ pincodes</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 flex items-center justify-center text-amber-500 flex-shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-100">Authentic Quality</h4>
              <p className="text-xs text-neutral-500 mt-0.5">100% verified luxury weaves & fabrics</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 flex items-center justify-center text-amber-500 flex-shrink-0">
              <RotateCcw size={22} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-100">Hassle-Free Returns</h4>
              <p className="text-xs text-neutral-500 mt-0.5">7-day easy exchange & return policy</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 flex items-center justify-center text-amber-500 flex-shrink-0">
              <CreditCard size={22} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-100">Secure Payments</h4>
              <p className="text-xs text-neutral-500 mt-0.5">UPI, Cards, NetBanking & COD</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto py-14 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & About */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-serif font-black tracking-tight text-white">
                {config.storeName}
              </span>
            </Link>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              {config.description ||
                'Curators of exceptional fashion, bespoke sarees, modern ethnic wear, and premium garments designed for life’s most celebrated moments.'}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {config.whatsapp && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-9 h-9 rounded-full bg-neutral-900 hover:bg-emerald-600 hover:text-white flex items-center justify-center text-neutral-400 transition"
                >
                  <MessageCircle size={18} />
                </a>
              )}
              {config.instagramUrl && (
                <a
                  href={config.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full bg-neutral-900 hover:bg-pink-600 hover:text-white flex items-center justify-center text-neutral-400 transition"
                >
                  <Instagram size={18} />
                </a>
              )}
              {config.facebookUrl && (
                <a
                  href={config.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full bg-neutral-900 hover:bg-blue-600 hover:text-white flex items-center justify-center text-neutral-400 transition"
                >
                  <Facebook size={18} />
                </a>
              )}
              {config.youtubeUrl && (
                <a
                  href={config.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-full bg-neutral-900 hover:bg-red-600 hover:text-white flex items-center justify-center text-neutral-400 transition"
                >
                  <Youtube size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Shop Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-200">
              Collections
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/category/women-sarees" className="hover:text-white transition">
                  Handloom Sarees
                </Link>
              </li>
              <li>
                <Link href="/category/women-kurtis" className="hover:text-white transition">
                  Designer Kurtis
                </Link>
              </li>
              <li>
                <Link href="/category/men-shirts" className="hover:text-white transition">
                  Pure Linen Shirts
                </Link>
              </li>
              <li>
                <Link href="/category/men-jeans" className="hover:text-white transition">
                  Selvedge Denim
                </Link>
              </li>
              <li>
                <Link href="/category/kids" className="hover:text-white transition">
                  Kids Festive Wear
                </Link>
              </li>
              <li>
                <Link href="/category/new-arrivals" className="hover:text-white transition">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-200">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/account/orders" className="hover:text-white transition">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-white transition">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-white transition">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Store Business Contact & GST */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-200">
              Store Information
            </h4>
            <div className="space-y-2.5 text-xs text-neutral-400">
              {config.address && (
                <div className="flex items-start gap-2">
                  <MapPin size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>
                    {config.address}, {config.city}, {config.state} - {config.pincode}
                  </span>
                </div>
              )}
              {config.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-amber-500 flex-shrink-0" />
                  <a href={`tel:${config.phone}`} className="hover:text-white transition">
                    {config.phone}
                  </a>
                </div>
              )}
              {config.email && (
                <div className="flex items-center gap-2">
                  <Mail size={15} className="text-amber-500 flex-shrink-0" />
                  <a href={`mailto:${config.email}`} className="hover:text-white transition">
                    {config.email}
                  </a>
                </div>
              )}
              {config.gstin && (
                <div className="pt-2 text-[11px] text-neutral-500">
                  GSTIN: <span className="font-mono text-neutral-300">{config.gstin}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Copyright & Engine Attribution */}
        <div className="mt-12 pt-6 border-t border-neutral-850 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {currentYear} {config.storeName}. All rights reserved.</p>
          <p className="text-[11px] text-neutral-600">
            Powered by{' '}
            <span className="text-neutral-400 font-medium">Sahasra Garments E-Commerce Engine</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
