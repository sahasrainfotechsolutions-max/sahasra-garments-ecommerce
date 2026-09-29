'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

interface OrderStatusChangerProps {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
}

export const OrderStatusChanger: React.FC<OrderStatusChangerProps> = ({
  orderId,
  currentStatus,
  currentPaymentStatus,
}) => {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [loading, setLoading] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const statuses = [
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'PACKED',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'RETURNED',
    'REFUNDED',
  ];

  const paymentStatuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

  const handleUpdate = async () => {
    setLoading(true);
    setSavedMsg(false);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, paymentStatus }),
      });

      if (res.ok) {
        setSavedMsg(true);
        router.refresh();
        setTimeout(() => setSavedMsg(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
        Order Status Controls
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-neutral-600 uppercase">
            Fulfillment Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 bg-white font-medium"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-neutral-600 uppercase">
            Payment Status
          </label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-amber-700 bg-white font-medium"
          >
            {paymentStatuses.map((ps) => (
              <option key={ps} value={ps}>
                {ps}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
        <div>
          {savedMsg && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 size={14} /> Updated Successfully
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleUpdate}
          disabled={loading}
          className="px-4 py-2 bg-amber-700 text-white rounded-xl text-xs font-semibold hover:bg-amber-800 disabled:opacity-50 transition"
        >
          {loading ? 'Updating...' : 'Save Status Update'}
        </button>
      </div>
    </div>
  );
};
