import React from 'react';
import { getStoreConfig } from '@/lib/store-config';
import { getSession } from '@/lib/auth';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';

export const revalidate = 0; // dynamic

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getStoreConfig();
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <Header config={config} user={session} />
      <main className="flex-1">{children}</main>
      <Footer config={config} />
    </div>
  );
}
