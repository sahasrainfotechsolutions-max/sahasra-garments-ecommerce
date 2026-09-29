import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    const storeId = process.env.DEFAULT_STORE_ID || 'default-store';

    const store = await prisma.store.findUnique({
      where: { code: storeId },
      include: { settings: true },
    });

    return NextResponse.json({ settings: store?.settings });
  } catch (error: any) {
    return NextResponse.json({ error: 'Unauthorized or Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const storeCode = process.env.DEFAULT_STORE_ID || 'default-store';

    const store = await prisma.store.findUnique({
      where: { code: storeCode },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const {
      storeName,
      shortName,
      tagline,
      description,
      logoUrl,
      faviconUrl,
      primaryColor,
      secondaryColor,
      accentColor,
      phone,
      whatsapp,
      email,
      address,
      city,
      state,
      pincode,
      gstin,
      currency,
      currencySymbol,
      instagramUrl,
      facebookUrl,
      youtubeUrl,
      siteTitle,
      metaDescription,
      keywords,
      shippingCharge,
      freeShippingThreshold,
      enableCod,
      enableOnlinePayment,
      taxPercentage,
    } = body;

    const updated = await prisma.storeSetting.upsert({
      where: { storeId: store.id },
      update: {
        storeName,
        shortName,
        tagline,
        description,
        logoUrl: logoUrl || null,
        faviconUrl: faviconUrl || null,
        primaryColor,
        secondaryColor,
        accentColor,
        phone,
        whatsapp,
        email,
        address,
        city,
        state,
        pincode,
        gstin,
        currency,
        currencySymbol,
        instagramUrl: instagramUrl || null,
        facebookUrl: facebookUrl || null,
        youtubeUrl: youtubeUrl || null,
        siteTitle,
        metaDescription,
        keywords: keywords || null,
        shippingCharge: parseFloat(shippingCharge || 0),
        freeShippingThreshold: parseFloat(freeShippingThreshold || 0),
        enableCod: Boolean(enableCod),
        enableOnlinePayment: Boolean(enableOnlinePayment),
        taxPercentage: parseFloat(taxPercentage || 5.0),
      },
      create: {
        storeId: store.id,
        storeName,
        shortName,
        tagline,
        description,
        logoUrl: logoUrl || null,
        faviconUrl: faviconUrl || null,
        primaryColor,
        secondaryColor,
        accentColor,
        phone,
        whatsapp,
        email,
        address,
        city,
        state,
        pincode,
        gstin,
        currency,
        currencySymbol,
        instagramUrl: instagramUrl || null,
        facebookUrl: facebookUrl || null,
        youtubeUrl: youtubeUrl || null,
        siteTitle,
        metaDescription,
        keywords: keywords || null,
        shippingCharge: parseFloat(shippingCharge || 0),
        freeShippingThreshold: parseFloat(freeShippingThreshold || 0),
        enableCod: Boolean(enableCod),
        enableOnlinePayment: Boolean(enableOnlinePayment),
        taxPercentage: parseFloat(taxPercentage || 5.0),
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 });
  }
}
