import prisma from './prisma';
import { StoreConfig } from '@/types';

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  storeName: 'Sahasra Fashion',
  shortName: 'Sahasra',
  tagline: 'Style That Speaks For You',
  description: 'Curators of fine ethnic wear, luxury handloom sarees, designer kurtis, bespoke menswear, and contemporary fashion apparel.',
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#b45309',
  secondaryColor: '#1e293b',
  accentColor: '#0f172a',
  phone: '+91 98765 43210',
  whatsapp: '+919876543210',
  email: 'contact@sahasrafashion.com',
  address: 'Plot 42, Road No. 36, Jubilee Hills',
  city: 'Hyderabad',
  state: 'Telangana',
  pincode: '500033',
  country: 'India',
  gstin: '36AAAAA0000A1Z5',
  currency: 'INR',
  currencySymbol: '₹',
  instagramUrl: 'https://instagram.com',
  facebookUrl: 'https://facebook.com',
  youtubeUrl: 'https://youtube.com',
  siteTitle: 'Sahasra Fashion | Premium Garments & Ethnic Wear',
  metaDescription: 'Discover our premium fashion collection: sarees, kurtis, menswear, and fashion garments crafted with luxury fabrics.',
  keywords: 'fashion, sarees, menswear, kurtis, ethnic wear, garments, sahasra',
  shippingCharge: 99.0,
  freeShippingThreshold: 999.0,
  enableCod: true,
  enableOnlinePayment: true,
  taxPercentage: 5.0,
};

export async function getStoreId(storeIdentifier?: string): Promise<string> {
  const code = storeIdentifier || process.env.DEFAULT_STORE_ID || 'default-store';

  try {
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { code },
          { id: code },
        ],
      },
      select: { id: true },
    });

    if (store) {
      return store.id;
    }
  } catch (error) {
    console.warn('Failed to resolve store ID from DB, falling back to identifier:', error);
  }

  return code;
}

export async function getStoreConfig(storeCode?: string): Promise<StoreConfig> {
  const code = storeCode || process.env.DEFAULT_STORE_ID || 'default-store';

  try {
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { code },
          { id: code },
        ],
      },
      include: { settings: true },
    });

    if (store && store.settings) {
      const s = store.settings;
      return {
        id: s.id,
        storeName: s.storeName || DEFAULT_STORE_CONFIG.storeName,
        shortName: s.shortName || DEFAULT_STORE_CONFIG.shortName,
        tagline: s.tagline || DEFAULT_STORE_CONFIG.tagline,
        description: s.description || DEFAULT_STORE_CONFIG.description,
        logoUrl: s.logoUrl || undefined,
        faviconUrl: s.faviconUrl || undefined,
        primaryColor: s.primaryColor || DEFAULT_STORE_CONFIG.primaryColor,
        secondaryColor: s.secondaryColor || DEFAULT_STORE_CONFIG.secondaryColor,
        accentColor: s.accentColor || DEFAULT_STORE_CONFIG.accentColor,
        phone: s.phone || DEFAULT_STORE_CONFIG.phone,
        whatsapp: s.whatsapp || DEFAULT_STORE_CONFIG.whatsapp,
        email: s.email || DEFAULT_STORE_CONFIG.email,
        address: s.address || DEFAULT_STORE_CONFIG.address,
        city: s.city || DEFAULT_STORE_CONFIG.city,
        state: s.state || DEFAULT_STORE_CONFIG.state,
        pincode: s.pincode || DEFAULT_STORE_CONFIG.pincode,
        country: s.country || DEFAULT_STORE_CONFIG.country,
        gstin: s.gstin || DEFAULT_STORE_CONFIG.gstin,
        currency: s.currency || DEFAULT_STORE_CONFIG.currency,
        currencySymbol: s.currencySymbol || DEFAULT_STORE_CONFIG.currencySymbol,
        instagramUrl: s.instagramUrl || undefined,
        facebookUrl: s.facebookUrl || undefined,
        youtubeUrl: s.youtubeUrl || undefined,
        siteTitle: s.siteTitle || DEFAULT_STORE_CONFIG.siteTitle,
        metaDescription: s.metaDescription || DEFAULT_STORE_CONFIG.metaDescription,
        keywords: s.keywords || undefined,
        shippingCharge: s.shippingCharge,
        freeShippingThreshold: s.freeShippingThreshold,
        enableCod: s.enableCod,
        enableOnlinePayment: s.enableOnlinePayment,
        taxPercentage: s.taxPercentage,
      };
    }
  } catch (error) {
    console.warn('Failed to load store settings from DB, falling back to default config:', error);
  }

  return DEFAULT_STORE_CONFIG;
}
