'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to register account');
        setLoading(false);
        return;
      }

      router.push('/account');
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-8 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Join the Sahasra Circle
          </span>
          <h1 className="text-2xl font-serif font-black text-neutral-900">Create Your Account</h1>
          <p className="text-xs text-neutral-500">
            Enjoy personalized recommendations, order tracking, and exclusive discounts.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ananya Sharma"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
              />
              <User size={15} className="absolute left-3 top-3 text-neutral-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
              />
              <Mail size={15} className="absolute left-3 top-3 text-neutral-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
              />
              <Phone size={15} className="absolute left-3 top-3 text-neutral-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Password *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
              />
              <Lock size={15} className="absolute left-3 top-3 text-neutral-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Re-enter password"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
              />
              <Lock size={15} className="absolute left-3 top-3 text-neutral-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-neutral-900 text-white font-semibold text-xs hover:bg-neutral-800 disabled:opacity-50 transition shadow-sm"
          >
            {loading ? 'Creating Account...' : 'Register Account'} <ArrowRight size={15} />
          </button>
        </form>

        <div className="text-center text-xs text-neutral-500 pt-2 border-t border-neutral-100">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-amber-800 hover:text-amber-900">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
