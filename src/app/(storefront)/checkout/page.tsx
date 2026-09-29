'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import {
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle,
  Truck,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { PaymentMethod } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discountAmount, shippingFee, taxAmount, grandTotal, coupon, clearCart } =
    useCart();

  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [address, setAddress] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    area: '',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500034',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400 mb-4">
          <ShoppingBag size={28} />
        </div>
        <h2 className="text-xl font-serif font-bold text-neutral-900 mb-2">No items to checkout</h2>
        <p className="text-xs text-neutral-500 mb-6">
          Your shopping bag is empty. Please add garments before checking out.
        </p>
        <Link
          href="/shop"
          className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition"
        >
          Browse Collections
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic validation
    if (!customer.name.trim() || !customer.email.trim() || !customer.phone.trim()) {
      setErrorMsg('Please complete all contact information fields.');
      return;
    }

    if (!address.addressLine1.trim() || !address.city.trim() || !address.pincode.trim()) {
      setErrorMsg('Please enter a complete delivery address with pincode.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            ...customer,
            name: customer.name.trim(),
            email: customer.email.trim().toLowerCase(),
            phone: customer.phone.trim(),
          },
          address: {
            ...address,
            name: customer.name.trim(),
            phone: customer.phone.trim(),
          },
          items,
          couponCode: coupon?.code,
          paymentMethod,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to complete order');
        setIsSubmitting(false);
        return;
      }

      // Order created successfully
      clearCart();
      router.push(`/order-success?orderNumber=${encodeURIComponent(data.orderNumber)}`);
    } catch (err) {
      console.error('Order error:', err);
      setErrorMsg('Network error while processing order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-neutral-900 tracking-tight">
          Secure Checkout
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Complete your contact, shipping, and payment details to confirm your order.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Customer Info */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-serif font-bold text-neutral-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-700 text-white text-[11px] font-mono flex items-center justify-center font-bold">
                1
              </span>
              Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-semibold text-neutral-700 uppercase">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full px-3.5 py-2.5 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-neutral-700 uppercase">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  placeholder="e.g. ananya@example.com"
                  className="w-full px-3.5 py-2.5 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-neutral-700 uppercase">
                  Phone Number (for SMS & Tracking) *
                </label>
                <input
                  type="tel"
                  required
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Delivery Address */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-serif font-bold text-neutral-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-700 text-white text-[11px] font-mono flex items-center justify-center font-bold">
                2
              </span>
              Delivery Address (Pan-India)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-semibold text-neutral-700 uppercase">
                  Flat / House No. / Building / Street *
                </label>
                <input
                  type="text"
                  required
                  value={address.addressLine1}
                  onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                  placeholder="e.g. Flat 402, Lotus Residency, Road No. 12"
                  className="w-full px-3.5 py-2.5 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-neutral-700 uppercase">
                  Area / Locality / Landmark
                </label>
                <input
                  type="text"
                  value={address.area}
                  onChange={(e) => setAddress({ ...address, area: e.target.value })}
                  placeholder="e.g. Near City Center Mall"
                  className="w-full px-3.5 py-2.5 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-neutral-700 uppercase">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="e.g. Hyderabad"
                  className="w-full px-3.5 py-2.5 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-neutral-700 uppercase">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  placeholder="e.g. Telangana"
                  className="w-full px-3.5 py-2.5 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-neutral-700 uppercase">
                  PIN Code *
                </label>
                <input
                  type="text"
                  required
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  placeholder="e.g. 500034"
                  className="w-full px-3.5 py-2.5 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-serif font-bold text-neutral-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-700 text-white text-[11px] font-mono flex items-center justify-center font-bold">
                3
              </span>
              Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* COD Option */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                  paymentMethod === 'COD'
                    ? 'border-amber-700 bg-amber-50/50 shadow-2xs'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 text-amber-700 focus:ring-amber-700"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-neutral-900 text-xs">
                    <Banknote size={16} className="text-amber-700" />
                    Cash on Delivery (COD)
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-normal">
                    Pay securely with cash or UPI scanner upon delivery at your doorstep.
                  </p>
                </div>
              </label>

              {/* Online Payment Option */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                  paymentMethod === 'ONLINE'
                    ? 'border-amber-700 bg-amber-50/50 shadow-2xs'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'ONLINE'}
                  onChange={() => setPaymentMethod('ONLINE')}
                  className="mt-1 text-amber-700 focus:ring-amber-700"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-neutral-900 text-xs">
                    <CreditCard size={16} className="text-amber-700" />
                    Online Payment (UPI, Cards, NetBanking)
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-normal">
                    Instant automated verification with 256-bit SSL encrypted checkout.
                  </p>
                </div>
              </label>
            </div>

            {/* Special Instructions */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-neutral-700 uppercase mb-1">
                Order Notes / Tailoring Requests (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Leave package with neighbor, call before arriving..."
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700"
              />
            </div>
          </div>
        </div>

        {/* Right Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-serif font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              Order Review ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h3>

            {/* Items miniature list */}
            <div className="max-h-60 overflow-y-auto space-y-3 divide-y divide-neutral-100 pr-1">
              {items.map((item) => (
                <div key={item.sku} className="pt-3 first:pt-0 flex gap-3 items-center">
                  <div className="relative w-12 h-16 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0 border border-neutral-200">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        className="object-cover object-top"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-semibold text-neutral-900 truncate">{item.productName}</p>
                    <p className="text-neutral-500 text-[11px]">
                      {item.color} / {item.size} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-xs font-bold text-neutral-900 font-mono">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-neutral-100 space-y-2 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-neutral-900">{formatCurrency(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount ({coupon?.code})</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping Charge</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-semibold">FREE</span>
                  ) : (
                    formatCurrency(shippingFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>GST Tax (5%)</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-baseline justify-between text-sm font-bold text-neutral-900">
                <span>Total Payable</span>
                <span className="text-xl font-black font-serif">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-amber-700 text-white font-semibold text-sm hover:bg-amber-800 disabled:opacity-50 shadow-md transition"
            >
              {isSubmitting ? (
                'Confirming Order...'
              ) : (
                <>
                  Confirm & Place Order <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="pt-2 text-center flex items-center justify-center gap-2 text-[11px] text-neutral-400">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>100% Encrypted & Safe Transaction</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
