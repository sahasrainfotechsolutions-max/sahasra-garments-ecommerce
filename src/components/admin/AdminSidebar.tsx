'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ShoppingCart,
  Users,
  Tag,
  Image as ImageIcon,
  Settings,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { label: 'Inventory', href: '/admin/inventory', icon: Boxes },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Coupons', href: '/admin/coupons', icon: Tag },
    { label: 'Banners', href: '/admin/banners', icon: ImageIcon },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-neutral-950 text-neutral-300 min-h-screen flex flex-col flex-shrink-0 border-r border-neutral-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-neutral-850 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-600 flex items-center justify-center text-white text-xs font-bold font-serif">
              S
            </div>
            <span className="text-sm font-bold text-white tracking-wide">Admin Portal</span>
          </div>
          <span className="text-[10px] text-amber-500 font-mono mt-1 block">Master E-Commerce v1.0</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                isActive
                  ? 'bg-amber-600 text-white font-semibold shadow-xs'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Icon size={17} className={isActive ? 'text-white' : 'text-neutral-500'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Return Link */}
      <div className="p-4 border-t border-neutral-850 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-neutral-900 transition"
        >
          <span className="flex items-center gap-2">
            <ExternalLink size={14} /> Open Storefront
          </span>
          <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400">Live</span>
        </Link>
      </div>
    </aside>
  );
};
