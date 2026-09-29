export type Role = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'COD' | 'ONLINE' | 'UPI';

export interface StoreConfig {
  id?: string;
  storeName: string;
  shortName: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  gstin?: string;
  currency: string;
  currencySymbol: string;
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  siteTitle: string;
  metaDescription: string;
  keywords?: string;
  ogImageUrl?: string;
  shippingCharge: number;
  freeShippingThreshold: number;
  enableCod: boolean;
  enableOnlinePayment: boolean;
  taxPercentage: number;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: Role;
  storeId: string;
}

export interface ProductVariantItem {
  id: string;
  sku: string;
  size: string;
  color: string;
  colorHex?: string | null;
  price?: number | null;
  mrp?: number | null;
  stock: number;
  imageUrl?: string | null;
  isActive: boolean;
}

export interface ProductImageItem {
  id: string;
  url: string;
  altText?: string | null;
  displayOrder: number;
  isPrimary: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: string | null;
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  children?: CategoryItem[];
  _count?: {
    products: number;
  };
}

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription?: string | null;
  description: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  brandId?: string | null;
  brand?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  basePrice: number;
  mrp: number;
  discountPercent: number;
  taxPercent: number;
  fabric?: string | null;
  careInstructions?: string | null;
  specifications?: string | null;
  tags?: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;
  images: ProductImageItem[];
  variants: ProductVariantItem[];
}

export interface CartLineItem {
  productId: string;
  variantId?: string | null;
  productName: string;
  productSlug: string;
  imageUrl?: string;
  size?: string;
  color?: string;
  sku: string;
  unitPrice: number;
  mrp: number;
  quantity: number;
  stock: number;
}

export interface CouponData {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number | null;
}

export interface OrderCustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface OrderShippingAddress {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  area?: string;
  city: string;
  state: string;
  pincode: string;
}
