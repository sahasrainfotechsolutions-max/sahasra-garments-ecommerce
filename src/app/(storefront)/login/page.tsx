'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid email or password');
        setLoading(false);
        return;
      }

      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/account');
      }
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const setDemoCredentials = (role: 'customer' | 'admin') => {
    if (role === 'customer') {
      setEmail('customer@demo.com');
      setPassword('Customer@12345');
    } else {
      setEmail('admin@sahasra.com');
      setPassword('Admin@12345');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-8 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Welcome Back
          </span>
          <h1 className="text-2xl font-serif font-black text-neutral-900">Sign In to Your Account</h1>
          <p className="text-xs text-neutral-500">
            Access your order tracking, address book, and saved garments.
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
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
              />
              <Mail size={15} className="absolute left-3 top-3 text-neutral-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700 uppercase">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={15} />
          </button>
        </form>

        {/* Demo Login Quick Fills */}
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2.5">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Demo Credentials (Quick Fill)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDemoCredentials('customer')}
              className="py-1.5 px-2.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 text-[11px] font-medium text-neutral-700 flex items-center justify-center gap-1 transition"
            >
              <UserCheck size={12} className="text-amber-700" /> Demo Customer
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('admin')}
              className="py-1.5 px-2.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 text-[11px] font-medium text-neutral-700 flex items-center justify-center gap-1 transition"
            >
              <ShieldCheck size={12} className="text-amber-700" /> Store Admin
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-neutral-500 pt-2 border-t border-neutral-100">
          Don&apos;t have an account yet?{' '}
          <Link href="/register" className="font-semibold text-amber-800 hover:text-amber-900">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
