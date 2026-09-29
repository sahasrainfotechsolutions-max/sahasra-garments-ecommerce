'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, CheckCircle2, Sliders, Phone, Building2, Truck, CreditCard, Share2 } from 'lucide-react';
import { StoreConfig } from '@/types';

export const StoreSettingsForm: React.FC<{ initialSettings: StoreConfig }> = ({
  initialSettings,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'business' | 'shipping' | 'payment' | 'social'>('general');
  const [formData, setFormData] = useState<StoreConfig>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to save settings');
        setLoading(false);
        return;
      }

      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3500);
    } catch (err: any) {
      setError(err.message || 'Error occurred saving settings');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General & Branding', icon: Sliders },
    { id: 'contact', label: 'Contact & Address', icon: Phone },
    { id: 'business', label: 'GST & Business', icon: Building2 },
    { id: 'shipping', label: 'Shipping Rules', icon: Truck },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'social', label: 'Social & SEO', icon: Share2 },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-2xl font-serif font-black text-neutral-900 tracking-tight">
            Store Customization & Configuration
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Centralized settings for brand name, colors, contact numbers, GSTIN, shipping, and payments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 size={15} /> Settings Saved
            </span>
          )}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 disabled:opacity-50 shadow-sm transition"
          >
            <Save size={15} /> {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: General Branding */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-serif font-bold text-neutral-900 border-b border-neutral-100 pb-2">
            Store Identity & Brand Colors
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Store Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                placeholder="e.g. Sahasra Fashion"
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Short Name / Acronym
              </label>
              <input
                type="text"
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                placeholder="e.g. Sahasra"
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Brand Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g. Style That Speaks For You"
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Store Summary / Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Primary Brand Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-10 h-8 rounded border border-neutral-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-28 px-3 py-1.5 text-xs font-mono border border-neutral-200 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Secondary Brand Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-10 h-8 rounded border border-neutral-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-28 px-3 py-1.5 text-xs font-mono border border-neutral-200 rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Contact & Address */}
      {activeTab === 'contact' && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-serif font-bold text-neutral-900 border-b border-neutral-100 pb-2">
            Contact Channels & Showroom Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Phone Number (Customer Helpline)
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                WhatsApp Business Number (with country code)
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+919876543210"
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 font-mono"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Support Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@sahasrafashion.com"
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Showroom / Boutique Street Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Plot 42, Road No. 36, Jubilee Hills"
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                PIN Code
              </label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Business & GST */}
      {activeTab === 'business' && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-serif font-bold text-neutral-900 border-b border-neutral-100 pb-2">
            Taxation & Currency Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                GSTIN / Tax Registration Number
              </label>
              <input
                type="text"
                value={formData.gstin || ''}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                placeholder="e.g. 36AAAAA0000A1Z5"
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 font-mono uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Default Apparel GST Tax Rate (%)
              </label>
              <input
                type="number"
                value={formData.taxPercentage}
                onChange={(e) => setFormData({ ...formData, taxPercentage: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Currency Code
              </label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Currency Symbol
              </label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Shipping */}
      {activeTab === 'shipping' && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-serif font-bold text-neutral-900 border-b border-neutral-100 pb-2">
            Delivery & Shipping Thresholds
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Standard Shipping Charge (₹)
              </label>
              <input
                type="number"
                value={formData.shippingCharge}
                onChange={(e) => setFormData({ ...formData, shippingCharge: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                value={formData.freeShippingThreshold}
                onChange={(e) => setFormData({ ...formData, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Payment Methods */}
      {activeTab === 'payment' && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-serif font-bold text-neutral-900 border-b border-neutral-100 pb-2">
            Payment Gateways & Methods
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-50">
              <input
                type="checkbox"
                checked={formData.enableCod}
                onChange={(e) => setFormData({ ...formData, enableCod: e.target.checked })}
                className="rounded text-amber-700 focus:ring-amber-700"
              />
              <div>
                <span className="text-xs font-bold text-neutral-900 block">Cash on Delivery (COD)</span>
                <span className="text-[11px] text-neutral-500">
                  Allow customers to pay upon receiving physical package at their doorstep.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-50">
              <input
                type="checkbox"
                checked={formData.enableOnlinePayment}
                onChange={(e) => setFormData({ ...formData, enableOnlinePayment: e.target.checked })}
                className="rounded text-amber-700 focus:ring-amber-700"
              />
              <div>
                <span className="text-xs font-bold text-neutral-900 block">
                  Online Payments (UPI, Cards, NetBanking)
                </span>
                <span className="text-[11px] text-neutral-500">
                  Enable digital payments through configured payment gateway providers.
                </span>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Tab 6: Social & SEO */}
      {activeTab === 'social' && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-serif font-bold text-neutral-900 border-b border-neutral-100 pb-2">
            Search Engine Optimization (SEO) & Social Channels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Default Site Title (Meta Title)
              </label>
              <input
                type="text"
                value={formData.siteTitle}
                onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Meta Description (Search snippet)
              </label>
              <textarea
                rows={2}
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Instagram URL
              </label>
              <input
                type="url"
                value={formData.instagramUrl || ''}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/..."
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                Facebook URL
              </label>
              <input
                type="url"
                value={formData.facebookUrl || ''}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 uppercase">
                YouTube URL
              </label>
              <input
                type="url"
                value={formData.youtubeUrl || ''}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                placeholder="https://youtube.com/..."
                className="w-full px-3.5 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
