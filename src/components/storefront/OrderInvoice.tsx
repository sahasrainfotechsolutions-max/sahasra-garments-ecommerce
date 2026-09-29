'use client';

import React from 'react';
import { StoreConfig } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Printer } from 'lucide-react';

interface OrderInvoiceProps {
  order: any;
  config: StoreConfig;
}

export const OrderInvoice: React.FC<OrderInvoiceProps> = ({ order, config }) => {
  const handlePrint = () => {
    window.print();
  };

  const address = order.shippingAddress as any;

  return (
    <div className="space-y-4">
      <div className="flex justify-end no-print">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 shadow-sm transition"
        >
          <Printer size={15} /> Print / Save Tax Invoice
        </button>
      </div>

      {/* Printable Invoice Container */}
      <div
        id="printable-invoice"
        className="bg-white rounded-2xl border border-neutral-200 p-8 sm:p-12 shadow-sm space-y-8"
      >
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-neutral-200 pb-8">
          <div>
            <span className="text-2xl font-serif font-black tracking-tight text-neutral-900">
              {config.storeName}
            </span>
            <p className="text-xs text-neutral-500 mt-1 max-w-xs">
              {config.address}, {config.city}, {config.state} - {config.pincode}
            </p>
            <p className="text-xs text-neutral-500">
              Phone: {config.phone} | Email: {config.email}
            </p>
            {config.gstin && (
              <p className="text-xs font-mono font-bold text-neutral-700 mt-1">
                GSTIN: {config.gstin}
              </p>
            )}
          </div>

          <div className="sm:text-right space-y-1">
            <span className="inline-block px-3 py-1 rounded bg-neutral-100 text-neutral-800 text-[10px] font-bold uppercase tracking-widest">
              Original Tax Invoice
            </span>
            <div className="text-base font-mono font-bold text-neutral-900 mt-1">
              Invoice #{order.orderNumber}
            </div>
            <div className="text-xs text-neutral-500">Date: {formatDate(order.createdAt)}</div>
            <div className="text-xs text-neutral-500">
              Payment: <strong className="uppercase">{order.paymentMethod}</strong> (
              {order.paymentStatus})
            </div>
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-neutral-200 pb-8">
          <div>
            <h4 className="font-bold uppercase tracking-wider text-neutral-400 mb-2">Billed To:</h4>
            <div className="font-semibold text-neutral-900 text-sm">{order.customerName}</div>
            <div className="text-neutral-600 mt-0.5">{order.customerEmail}</div>
            <div className="text-neutral-600">{order.customerPhone}</div>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Shipped / Delivered To:
            </h4>
            <div className="text-neutral-700 leading-relaxed">
              <span className="font-semibold text-neutral-900 block">{address?.name}</span>
              <span>{address?.addressLine1}</span>
              {address?.addressLine2 && <span>, {address?.addressLine2}</span>}
              {address?.area && <span>, {address?.area}</span>}
              <span className="block">
                {address?.city}, {address?.state} - {address?.pincode}
              </span>
              <span className="block mt-1 font-mono text-[11px] text-neutral-500">
                Contact: {address?.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-300 text-neutral-500 uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-2.5">Item & Description</th>
                <th className="py-2.5">SKU / Variant</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Unit Rate</th>
                <th className="py-2.5 text-right">GST (5%)</th>
                <th className="py-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {order.items.map((item: any, idx: number) => (
                <tr key={idx} className="py-3">
                  <td className="py-3 pr-2">
                    <span className="font-semibold text-neutral-900 block">{item.productName}</span>
                  </td>
                  <td className="py-3 pr-2 font-mono text-neutral-600">
                    {item.variantTitle || item.sku}
                  </td>
                  <td className="py-3 text-center font-bold text-neutral-800">{item.quantity}</td>
                  <td className="py-3 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-3 text-right font-mono text-neutral-500">
                    {formatCurrency(item.taxAmount || 0)}
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-neutral-900">
                    {formatCurrency(item.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-4 border-t border-neutral-200">
          <div className="text-xs text-neutral-500 max-w-xs space-y-1">
            <p className="font-semibold text-neutral-800">Terms & Conditions:</p>
            <p>1. Garments eligible for return/exchange within 7 days in original condition with tags intact.</p>
            <p>2. Subject to {config.city} jurisdiction only.</p>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal:</span>
              <span className="font-mono">{formatCurrency(order.subtotal)}</span>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Voucher Discount ({order.couponCode || 'PROMO'}):</span>
                <span className="font-mono">-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-neutral-600">
              <span>Shipping Charge:</span>
              <span className="font-mono">
                {order.shippingFee === 0 ? 'FREE' : formatCurrency(order.shippingFee)}
              </span>
            </div>

            <div className="flex justify-between text-neutral-600">
              <span>GST Tax Amount:</span>
              <span className="font-mono">{formatCurrency(order.taxAmount)}</span>
            </div>

            <div className="flex justify-between text-sm font-bold text-neutral-900 border-t border-neutral-300 pt-2 font-serif">
              <span>Grand Total:</span>
              <span className="text-base font-black font-mono">
                {formatCurrency(order.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[10px] text-neutral-400 border-t border-neutral-100 pt-4">
          This is a computer-generated tax invoice and requires no physical signature. Thank you for
          choosing {config.storeName}!
        </div>
      </div>
    </div>
  );
};
