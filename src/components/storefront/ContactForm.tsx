'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-lg font-serif font-bold text-neutral-900">Message Received</h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          Thank you for reaching out. One of our fashion advisors will respond to your inquiry shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-base font-serif font-bold text-neutral-900 mb-2">Send Us an Inquiry</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-neutral-700 uppercase">
            Your Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3.5 py-2.5 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
            placeholder="e.g. Radhika Sen"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-neutral-700 uppercase">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3.5 py-2.5 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
            placeholder="e.g. radhika@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-neutral-700 uppercase">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3.5 py-2.5 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
            placeholder="+91 98765 43210"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-neutral-700 uppercase">
            Subject *
          </label>
          <input
            type="text"
            required
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-3.5 py-2.5 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
            placeholder="e.g. Garment Customization / Sizing"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-semibold text-neutral-700 uppercase">
          Message *
        </label>
        <textarea
          required
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-3.5 py-2.5 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
          placeholder="How can our garments team help you today?"
        />
      </div>

      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-neutral-900 text-white font-semibold text-xs hover:bg-neutral-800 transition shadow-sm"
      >
        <Send size={14} /> Send Message
      </button>
    </form>
  );
}
