import type { Metadata } from 'next';
import { getStoreConfig } from '@/lib/store-config';
import { getSession } from '@/lib/auth';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig();
  return {
    title: {
      default: config.siteTitle || config.storeName,
      template: `%s | ${config.storeName}`,
    },
    description: config.metaDescription,
    keywords: config.keywords?.split(',').map((k) => k.trim()),
    openGraph: {
      title: config.siteTitle || config.storeName,
      description: config.metaDescription,
      siteName: config.storeName,
      type: 'website',
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getStoreConfig();
  const session = await getSession();

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans bg-neutral-50 text-neutral-900 antialiased selection:bg-amber-100 selection:text-amber-900">
        <CartProvider
          shippingCharge={config.shippingCharge}
          freeShippingThreshold={config.freeShippingThreshold}
          taxPercentage={config.taxPercentage}
        >
          <WishlistProvider>{children}</WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
