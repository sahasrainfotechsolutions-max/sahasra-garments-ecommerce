import React from 'react';
import { getStoreConfig } from '@/lib/store-config';
import { StoreSettingsForm } from '@/components/admin/StoreSettingsForm';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const config = await getStoreConfig();
  return <StoreSettingsForm initialSettings={config} />;
}
