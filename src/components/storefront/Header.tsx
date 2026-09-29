'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Heart,
  ShoppingBag,
  User,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { StoreConfig } from '@/types';
import { SearchBar } from './SearchBar';
import { CartDrawer } from './CartDrawer';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getWhatsAppUrl, formatCurrency } from '@/lib/utils';

interface HeaderProps {
  config: StoreConfig;
  user?: { name: string; role: string } | null;
}

export const Header: React.FC<HeaderProps> = ({ config, user }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop All', href: '/shop' },
    { label: 'Men', href: '/category/men' },
    { label: 'Women', href: '/category/women' },
    { label: 'Kids', href: '/category/kids' },
    { label: 'New Arrivals', href: '/category/new-arrivals' },
  ];

  const whatsappInquiryUrl = getWhatsAppUrl(
    config.whatsapp,
    `Hi ${config.storeName}, I have a shopping inquiry regarding your collection.`
  );

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-neutral-900 text-neutral-300 text-xs py-2 px-4 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">
              ✨ Free Shipping across India on orders above{' '}
              <strong className="text-white">
                {formatCurrency(config.freeShippingThreshold, config.currencySymbol)}
              </strong>
            </span>
            <span className="sm:hidden">✨ Free Shipping on orders above ₹999</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            {config.phone && (
              <a
                href={`tel:${config.phone}`}
                className="hidden md:flex items-center gap-1 hover:text-white transition"
              >
                <Phone size={12} /> {config.phone}
              </a>
            )}
            {config.whatsapp && (
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition"
              >
                <MessageCircle size={13} /> WhatsApp Us
              </a>
            )}
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="px-2 py-0.5 rounded bg-amber-600 text-white font-semibold text-[10px] hover:bg-amber-500 transition"
              >
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Brand Logo / Name */}
            <div className="flex items-center">
              <Link href="/" className="flex flex-col group">
                <span className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-neutral-900 group-hover:text-amber-800 transition">
                  {config.storeName}
                </span>
                {config.tagline && (
                  <span className="text-[10px] tracking-widest uppercase text-neutral-500 font-medium font-sans">
                    {config.tagline}
                  </span>
                )}
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-7">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium tracking-wide transition relative py-1 ${
                      isActive
                        ? 'text-amber-800 font-semibold'
                        : 'text-neutral-700 hover:text-amber-800'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-700 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons & Search */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:block w-48 lg:w-60">
                <SearchBar />
              </div>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative p-2 text-neutral-700 hover:text-amber-800 hover:bg-neutral-100 rounded-full transition"
                aria-label="Wishlist"
              >
                <Heart size={21} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={() => setCartDrawerOpen(true)}
                className="relative p-2 text-neutral-700 hover:text-amber-800 hover:bg-neutral-100 rounded-full transition"
                aria-label="Shopping Cart"
              >
                <ShoppingBag size={21} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* User Account */}
              <Link
                href={user ? '/account' : '/login'}
                className="flex items-center gap-1.5 p-2 text-neutral-700 hover:text-amber-800 hover:bg-neutral-100 rounded-full transition"
                aria-label="Account"
                title={user ? `Signed in as ${user.name}` : 'Login to account'}
              >
                <User size={21} />
                {user && (
                  <span className="hidden md:inline text-xs font-semibold max-w-[80px] truncate text-neutral-800">
                    {user.name.split(' ')[0]}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Search Bar Row */}
          <div className="sm:hidden pb-3 pt-1">
            <SearchBar />
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-base font-medium rounded-lg text-neutral-800 hover:bg-neutral-100"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-neutral-100 flex flex-col gap-2">
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs text-neutral-600 px-3 py-1"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs text-neutral-600 px-3 py-1"
              >
                Contact & Support
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        currencySymbol={config.currencySymbol}
      />
    </>
  );
};
