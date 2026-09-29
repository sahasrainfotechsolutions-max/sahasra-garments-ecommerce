const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Database Seed for Sahasra Garments Master Template ---');

  const storeCode = process.env.DEFAULT_STORE_ID || 'default-store';

  // 1. Create or Update Master Store
  const store = await prisma.store.upsert({
    where: { code: storeCode },
    update: {
      name: 'Sahasra Fashion',
      domain: 'sahasrafashion.com',
      isActive: true,
    },
    create: {
      code: storeCode,
      name: 'Sahasra Fashion',
      domain: 'sahasrafashion.com',
      isActive: true,
    },
  });

  console.log(`✓ Master Store configured: ${store.name} (Code: ${store.code}, ID: ${store.id})`);

  // 2. Configure Store Settings
  await prisma.storeSetting.upsert({
    where: { storeId: store.id },
    update: {
      storeName: 'Sahasra Fashion',
      shortName: 'Sahasra',
      tagline: 'Style That Speaks For You',
      description: 'Exclusive master collection of luxury sarees, designer kurtis, bespoke menswear, and contemporary fashion apparel.',
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
      siteTitle: 'Sahasra Fashion | Premium Garments & Ethnic Wear',
      metaDescription: 'Discover our premium fashion collection: sarees, kurtis, menswear, and fashion garments crafted with luxury fabrics.',
      keywords: 'fashion, sarees, menswear, kurtis, ethnic wear, garments, sahasra',
      shippingCharge: 99.0,
      freeShippingThreshold: 999.0,
      enableCod: true,
      enableOnlinePayment: true,
      taxPercentage: 5.0,
    },
    create: {
      storeId: store.id,
      storeName: 'Sahasra Fashion',
      shortName: 'Sahasra',
      tagline: 'Style That Speaks For You',
      description: 'Exclusive master collection of luxury sarees, designer kurtis, bespoke menswear, and contemporary fashion apparel.',
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
      siteTitle: 'Sahasra Fashion | Premium Garments & Ethnic Wear',
      metaDescription: 'Discover our premium fashion collection: sarees, kurtis, menswear, and fashion garments crafted with luxury fabrics.',
      keywords: 'fashion, sarees, menswear, kurtis, ethnic wear, garments, sahasra',
      shippingCharge: 99.0,
      freeShippingThreshold: 999.0,
      enableCod: true,
      enableOnlinePayment: true,
      taxPercentage: 5.0,
    },
  });

  console.log('✓ Store Settings saved.');

  // 3. Admin User & Customer User
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@sahasra.com';
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@12345';
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      storeId: store.id,
      name: 'Store Administrator',
      phone: '+91 98765 43210',
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      name: 'Store Administrator',
      phone: '+91 98765 43210',
      role: 'ADMIN',
      storeId: store.id,
      isActive: true,
    },
  });

  console.log(`✓ Admin User created: ${admin.email}`);

  const customerPasswordHash = await bcrypt.hash('Customer@12345', 10);
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@demo.com' },
    update: {
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      storeId: store.id,
      name: 'Ananya Sharma',
      phone: '+91 91234 56789',
      isActive: true,
    },
    create: {
      email: 'customer@demo.com',
      passwordHash: customerPasswordHash,
      name: 'Ananya Sharma',
      phone: '+91 91234 56789',
      role: 'CUSTOMER',
      storeId: store.id,
      isActive: true,
    },
  });

  const customerProfile = await prisma.customer.upsert({
    where: { userId: customerUser.id },
    update: {
      name: 'Ananya Sharma',
      email: 'customer@demo.com',
      phone: '+91 91234 56789',
    },
    create: {
      userId: customerUser.id,
      storeId: store.id,
      name: 'Ananya Sharma',
      email: 'customer@demo.com',
      phone: '+91 91234 56789',
    },
  });

  // Default address for customer
  const existingAddress = await prisma.address.findFirst({
    where: { userId: customerUser.id },
  });
  if (!existingAddress) {
    await prisma.address.create({
      data: {
        userId: customerUser.id,
        customerId: customerProfile.id,
        name: 'Ananya Sharma',
        phone: '+91 91234 56789',
        addressLine1: 'Flat 402, Lotus Residency',
        addressLine2: 'Banjara Hills, Road 12',
        area: 'Banjara Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500034',
        isDefault: true,
      },
    });
  }

  console.log(`✓ Demo Customer created: ${customerUser.email}`);

  // 4. Professional Categories Hierarchy
  const categoriesData = [
    {
      name: 'Men',
      slug: 'men',
      description: 'Sophisticated menswear from formal shirts to premium denim and ethnic attire.',
      imageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
      isFeatured: true,
      displayOrder: 1,
      children: [
        { name: 'Shirts', slug: 'mens-shirts', description: 'Crisp casual, oxford, and formal shirts in luxury cotton & linen.' },
        { name: 'T-Shirts', slug: 'mens-tshirts', description: 'Combed cotton crewneck and classic polo t-shirts.' },
        { name: 'Jeans', slug: 'mens-jeans', description: 'Selvedge denim and premium stretch jeans.' },
        { name: 'Trousers', slug: 'mens-trousers', description: 'Tailored formal trousers and smart everyday chinos.' },
        { name: 'Ethnic Wear', slug: 'mens-ethnic-wear', description: 'Grand kurtas, nehru jackets, and festive sherwanis.' },
      ],
    },
    {
      name: 'Women',
      slug: 'women',
      description: 'Timeless ethnic sarees, designer kurtis, chic dresses, and festive couture.',
      imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      isFeatured: true,
      displayOrder: 2,
      children: [
        { name: 'Sarees', slug: 'womens-sarees', description: 'Authentic Banarasi, Kanjeevaram, and lightweight cotton sarees.' },
        { name: 'Kurtis', slug: 'womens-kurtis', description: 'Embroidered Anarkalis, straight kurtis, and designer sets.' },
        { name: 'Dresses', slug: 'womens-dresses', description: 'Contemporary maxi dresses, tiered frocks, and evening gowns.' },
        { name: 'Tops', slug: 'womens-tops', description: 'Chic everyday tops, tunics, and workwear blouses.' },
        { name: 'Ethnic Wear', slug: 'womens-ethnic-wear', description: 'Complete festive kurta sets, lehengas, and fusion wear.' },
      ],
    },
    {
      name: 'Kids',
      slug: 'kids',
      description: 'Comfortable, skin-friendly daily wear and celebration outfits for boys and girls.',
      imageUrl: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=800&q=80',
      isFeatured: true,
      displayOrder: 3,
      children: [
        { name: 'Boys Wear', slug: 'kids-boys-wear', description: 'Smart shirts, kurtas, and comfortable denim for young boys.' },
        { name: 'Girls Wear', slug: 'kids-girls-wear', description: 'Charming dresses, ethnic lehengas, and frocks for girls.' },
        { name: 'Kids T-Shirts', slug: 'kids-tshirts', description: 'Vibrant printed t-shirts in soft organic cotton.' },
        { name: 'Kids Dresses', slug: 'kids-dresses', description: 'Twirl-worthy party frocks and floral summer dresses.' },
      ],
    },
    {
      name: 'New Arrivals',
      slug: 'new-arrivals',
      description: 'The freshest garment drops for the upcoming festive and celebration season.',
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
      isFeatured: true,
      displayOrder: 4,
      children: [],
    },
  ];

  const categoryMap = {};

  for (const cat of categoriesData) {
    const parent = await prisma.category.upsert({
      where: { storeId_slug: { storeId: store.id, slug: cat.slug } },
      update: {
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl,
        isFeatured: cat.isFeatured,
        displayOrder: cat.displayOrder,
        isActive: true,
      },
      create: {
        storeId: store.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageUrl: cat.imageUrl,
        isFeatured: cat.isFeatured,
        displayOrder: cat.displayOrder,
        isActive: true,
      },
    });

    categoryMap[cat.slug] = parent.id;

    for (const sub of cat.children) {
      const child = await prisma.category.upsert({
        where: { storeId_slug: { storeId: store.id, slug: sub.slug } },
        update: {
          name: sub.name,
          description: sub.description,
          parentId: parent.id,
          isActive: true,
        },
        create: {
          storeId: store.id,
          name: sub.name,
          slug: sub.slug,
          description: sub.description,
          parentId: parent.id,
          isActive: true,
        },
      });
      categoryMap[sub.slug] = child.id;
    }
  }

  // Also support legacy slugs so old bookmarks/links work gracefully
  const legacyAliases = [
    { from: 'men-shirts', target: 'mens-shirts', name: 'Shirts', parentSlug: 'men' },
    { from: 'men-tshirts', target: 'mens-tshirts', name: 'T-Shirts', parentSlug: 'men' },
    { from: 'men-jeans', target: 'mens-jeans', name: 'Jeans', parentSlug: 'men' },
    { from: 'women-sarees', target: 'womens-sarees', name: 'Sarees', parentSlug: 'women' },
    { from: 'women-kurtis', target: 'womens-kurtis', name: 'Kurtis', parentSlug: 'women' },
    { from: 'women-dresses', target: 'womens-dresses', name: 'Dresses', parentSlug: 'women' },
  ];

  for (const alias of legacyAliases) {
    if (!categoryMap[alias.from]) {
      const parentId = categoryMap[alias.parentSlug];
      const legacyCat = await prisma.category.upsert({
        where: { storeId_slug: { storeId: store.id, slug: alias.from } },
        update: { parentId, isActive: true },
        create: {
          storeId: store.id,
          name: alias.name,
          slug: alias.from,
          parentId,
          isActive: true,
        },
      });
      categoryMap[alias.from] = legacyCat.id;
    }
  }

  console.log(`✓ Categories hierarchy created.`);

  // 5. Brands
  const brandsData = [
    { name: 'Sahasra Couture', slug: 'sahasra-couture' },
    { name: 'Silk Heritage', slug: 'silk-heritage' },
    { name: 'Royal Loom', slug: 'royal-loom' },
    { name: 'Urban Thread', slug: 'urban-thread' },
  ];

  const brandMap = {};
  for (const b of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { storeId_slug: { storeId: store.id, slug: b.slug } },
      update: { name: b.name, isActive: true },
      create: { storeId: store.id, name: b.name, slug: b.slug, isActive: true },
    });
    brandMap[b.slug] = brand.id;
  }

  console.log(`✓ Brands configured.`);

  // 6. 24 Professional Demo Products
  const productsData = [
    // ----------------- MEN (1 to 8) -----------------
    {
      name: 'Premium Cotton Casual Shirt',
      slug: 'premium-cotton-casual-shirt',
      sku: 'MEN-SHT-001',
      shortDescription: 'Breathable 100% combed cotton casual shirt with button-down collar.',
      description: 'Crafted from finely woven long-staple cotton, this casual shirt features a modern regular fit, curved hem, and durable mother-of-pearl buttons. Ideal for weekend outings and smart casual office wear.',
      categorySlug: 'mens-shirts',
      brandSlug: 'sahasra-couture',
      basePrice: 1299,
      mrp: 1999,
      discountPercent: 35,
      fabric: '100% Combed Cotton',
      careInstructions: 'Machine wash warm with like colors. Warm iron.',
      specifications: 'Fit: Regular | Collar: Button-Down | Sleeve: Full Sleeve',
      tags: 'shirt, casual, cotton, men, topwear',
      isFeatured: true,
      isNewArrival: true,
      isBestseller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80', isPrimary: false },
      ],
      variants: [
        { sku: 'MEN-SHT-001-WHT-S', color: 'White', colorHex: '#ffffff', size: 'S', stock: 8, price: 1299, mrp: 1999 },
        { sku: 'MEN-SHT-001-WHT-M', color: 'White', colorHex: '#ffffff', size: 'M', stock: 15, price: 1299, mrp: 1999 },
        { sku: 'MEN-SHT-001-WHT-L', color: 'White', colorHex: '#ffffff', size: 'L', stock: 20, price: 1299, mrp: 1999 },
        { sku: 'MEN-SHT-001-WHT-XL', color: 'White', colorHex: '#ffffff', size: 'XL', stock: 12, price: 1299, mrp: 1999 },
        { sku: 'MEN-SHT-001-BLU-M', color: 'Sky Blue', colorHex: '#38bdf8', size: 'M', stock: 15, price: 1299, mrp: 1999 },
        { sku: 'MEN-SHT-001-BLU-L', color: 'Sky Blue', colorHex: '#38bdf8', size: 'L', stock: 18, price: 1299, mrp: 1999 },
      ],
    },
    {
      name: 'Classic Oxford Formal Shirt',
      slug: 'classic-oxford-formal-shirt',
      sku: 'MEN-SHT-002',
      shortDescription: 'Tailored formal oxford shirt designed for crisp executive styling.',
      description: 'Heavyweight oxford weave with natural wrinkle resistance. Finished with a firm spread collar, mitered cuffs, and single chest pocket for a sharp corporate appearance.',
      categorySlug: 'mens-shirts',
      brandSlug: 'sahasra-couture',
      basePrice: 1599,
      mrp: 2499,
      discountPercent: 36,
      fabric: '100% Egyptian Giza Cotton',
      careInstructions: 'Machine wash warm, tumble dry low, steam iron.',
      specifications: 'Fit: Slim Fit | Collar: Classic Spread | Sleeve: Full Sleeve',
      tags: 'shirt, formal, oxford, executive, men',
      isFeatured: false,
      isNewArrival: true,
      isBestseller: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
      ],
      variants: [
        { sku: 'MEN-SHT-002-BLU-39', color: 'Ice Blue', colorHex: '#bae6fd', size: 'M', stock: 12, price: 1599, mrp: 2499 },
        { sku: 'MEN-SHT-002-BLU-40', color: 'Ice Blue', colorHex: '#bae6fd', size: 'L', stock: 15, price: 1599, mrp: 2499 },
        { sku: 'MEN-SHT-002-WHT-40', color: 'Pure White', colorHex: '#ffffff', size: 'L', stock: 14, price: 1599, mrp: 2499 },
      ],
    },
    {
      name: 'Premium Slim Fit T-Shirt',
      slug: 'premium-slim-fit-t-shirt',
      sku: 'MEN-TSH-003',
      shortDescription: 'Ultra-soft combed compact cotton crewneck t-shirt.',
      description: 'Bio-washed lightweight fabric with reinforced collar seams that keep their shape wash after wash. Seamless sides for maximum comfort and style.',
      categorySlug: 'mens-tshirts',
      brandSlug: 'urban-thread',
      basePrice: 699,
      mrp: 1199,
      discountPercent: 42,
      fabric: '100% Bio-Washed Combed Cotton (180 GSM)',
      careInstructions: 'Machine wash cold inside out. Do not bleach.',
      specifications: 'Neck: Crew Neck | Fit: Slim Fit | Sleeve: Half Sleeve',
      tags: 'tshirt, casual, basics, crewneck, men',
      isFeatured: true,
      isNewArrival: false,
      isBestseller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
      ],
      variants: [
        { sku: 'MEN-TSH-003-BLK-S', color: 'Jet Black', colorHex: '#0f172a', size: 'S', stock: 10, price: 699, mrp: 1199 },
        { sku: 'MEN-TSH-003-BLK-M', color: 'Jet Black', colorHex: '#0f172a', size: 'M', stock: 20, price: 699, mrp: 1199 },
        { sku: 'MEN-TSH-003-BLK-L', color: 'Jet Black', colorHex: '#0f172a', size: 'L', stock: 25, price: 699, mrp: 1199 },
        { sku: 'MEN-TSH-003-NVY-M', color: 'Navy Blue', colorHex: '#1e3a8a', size: 'M', stock: 15, price: 699, mrp: 1199 },
      ],
    },
    {
      name: 'Essential Polo T-Shirt',
      slug: 'essential-polo-t-shirt',
      sku: 'MEN-TSH-004',
      shortDescription: 'Classic pique cotton polo with rib-knit collar and twin-tipping.',
      description: 'A timeless wardrobe staple. Heavyweight breathable honeycomb pique knit with ribbed collar and dual-button placket.',
      categorySlug: 'mens-tshirts',
      brandSlug: 'urban-thread',
      basePrice: 899,
      mrp: 1499,
      discountPercent: 40,
      fabric: '100% Pique Honeycomb Cotton (220 GSM)',
      careInstructions: 'Machine wash gentle. Dry flat in shade.',
      specifications: 'Fit: Regular | Collar: Ribbed Polo | Placket: 2 Button',
      tags: 'polo, tshirt, classic, smart casual, men',
      isFeatured: false,
      isNewArrival: true,
      isBestseller: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
      ],
      variants: [
        { sku: 'MEN-TSH-004-MAR-M', color: 'Maroon', colorHex: '#881337', size: 'M', stock: 12, price: 899, mrp: 1499 },
        { sku: 'MEN-TSH-004-MAR-L', color: 'Maroon', colorHex: '#881337', size: 'L', stock: 14, price: 899, mrp: 1499 },
        { sku: 'MEN-TSH-004-OLV-L', color: 'Olive Green', colorHex: '#3f6212', size: 'L', stock: 10, price: 899, mrp: 1499 },
      ],
    },
    {
      name: 'Stretch Denim Jeans',
      slug: 'stretch-denim-jeans',
      sku: 'MEN-JNS-005',
      shortDescription: 'Modern tapered dark indigo denim with 2-way flex comfort.',
      description: 'Constructed from durable ring-spun denim with added elastane for day-long freedom of movement. Subtle whiskering and vintage wash effects.',
      categorySlug: 'mens-jeans',
      brandSlug: 'urban-thread',
      basePrice: 1999,
      mrp: 2999,
      discountPercent: 33,
      fabric: '98% Cotton, 2% Elastane (12.5 oz Denim)',
      careInstructions: 'Turn inside out and wash cold. Line dry.',
      specifications: 'Fit: Slim Tapered | Rise: Mid Rise | Fly: YKK Zip Fly',
      tags: 'jeans, denim, stretch, pants, men',
      isFeatured: true,
      isNewArrival: false,
      isBestseller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
      ],
      variants: [
        { sku: 'MEN-JNS-005-IND-30', color: 'Dark Indigo', colorHex: '#1e3a8a', size: '30', stock: 10, price: 1999, mrp: 2999 },
        { sku: 'MEN-JNS-005-IND-32', color: 'Dark Indigo', colorHex: '#1e3a8a', size: '32', stock: 18, price: 1999, mrp: 2999 },
        { sku: 'MEN-JNS-005-IND-34', color: 'Dark Indigo', colorHex: '#1e3a8a', size: '34', stock: 15, price: 1999, mrp: 2999 },
        { sku: 'MEN-JNS-005-IND-36', color: 'Dark Indigo', colorHex: '#1e3a8a', size: '36', stock: 8, price: 1999, mrp: 2999 },
      ],
    },
    {
      name: 'Regular Fit Blue Jeans',
      slug: 'regular-fit-blue-jeans',
      sku: 'MEN-JNS-006',
      shortDescription: 'Everyday durable stone-washed denim in classic straight fit.',
      description: 'The definitive classic straight-cut denim jeans. Features authentic 5-pocket styling, heavy-duty stitching, and copper rivets.',
      categorySlug: 'mens-jeans',
      brandSlug: 'urban-thread',
      basePrice: 1799,
      mrp: 2699,
      discountPercent: 33,
      fabric: '100% Rigid Heavy Cotton Denim (13 oz)',
      careInstructions: 'Wash inside out with dark colors. Do not bleach.',
      specifications: 'Fit: Regular Straight | Rise: Mid Rise | Pockets: 5',
      tags: 'jeans, straight, blue, classic, men',
      isFeatured: false,
      isNewArrival: false,
      isBestseller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
      ],
      variants: [
        { sku: 'MEN-JNS-006-BLU-32', color: 'Mid Blue', colorHex: '#3b82f6', size: '32', stock: 14, price: 1799, mrp: 2699 },
        { sku: 'MEN-JNS-006-BLU-34', color: 'Mid Blue', colorHex: '#3b82f6', size: '34', stock: 16, price: 1799, mrp: 2699 },
      ],
    },
    {
      name: 'Classic Formal Trousers',
      slug: 'classic-formal-trousers',
      sku: 'MEN-TRS-007',
      shortDescription: 'Crease-resistant formal trousers with tailored waistband.',
      description: 'Expertly tailored for everyday boardroom excellence. Features crisp front creases, french-fly closure, and a comfortable stretch lining.',
      categorySlug: 'mens-trousers',
      brandSlug: 'sahasra-couture',
      basePrice: 1499,
      mrp: 2299,
      discountPercent: 35,
      fabric: 'Poly-Viscose Stretch Blend',
      careInstructions: 'Dry clean or gentle cycle warm wash.',
      specifications: 'Fit: Tailored Contemporary | Hem: Unfinished Bottom',
      tags: 'trousers, formal, pants, workwear, men',
      isFeatured: false,
      isNewArrival: false,
      isBestseller: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
      ],
      variants: [
        { sku: 'MEN-TRS-007-GRY-32', color: 'Charcoal Grey', colorHex: '#475569', size: '32', stock: 12, price: 1499, mrp: 2299 },
        { sku: 'MEN-TRS-007-GRY-34', color: 'Charcoal Grey', colorHex: '#475569', size: '34', stock: 15, price: 1499, mrp: 2299 },
        { sku: 'MEN-TRS-007-BLK-32', color: 'Executive Black', colorHex: '#0f172a', size: '32', stock: 16, price: 1499, mrp: 2299 },
      ],
    },
    {
      name: 'Premium Linen Shirt',
      slug: 'premium-linen-shirt',
      sku: 'MEN-SHT-008',
      shortDescription: 'Pure European linen resort shirt for effortless summer style.',
      description: 'Naturally breathable 100% flax linen washed for soft handfeel. Features a relaxed camp collar and lightweight airy drape.',
      categorySlug: 'mens-shirts',
      brandSlug: 'royal-loom',
      basePrice: 1899,
      mrp: 2999,
      discountPercent: 37,
      fabric: '100% Pure European Flax Linen',
      careInstructions: 'Gentle wash cold, iron while damp.',
      specifications: 'Fit: Relaxed Resort | Collar: Camp Collar',
      tags: 'linen, shirt, resortwear, summer, men',
      isFeatured: true,
      isNewArrival: true,
      isBestseller: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
      ],
      variants: [
        { sku: 'MEN-SHT-008-OLV-M', color: 'Sage Green', colorHex: '#65a30d', size: 'M', stock: 10, price: 1899, mrp: 2999 },
        { sku: 'MEN-SHT-008-OLV-L', color: 'Sage Green', colorHex: '#65a30d', size: 'L', stock: 14, price: 1899, mrp: 2999 },
        { sku: 'MEN-SHT-008-WHT-L', color: 'Natural Off-White', colorHex: '#fafaf9', size: 'L', stock: 16, price: 1899, mrp: 2999 },
      ],
    },

    // ----------------- WOMEN (9 to 16) -----------------
    {
      name: 'Elegant Cotton Saree',
      slug: 'elegant-cotton-saree',
      sku: 'WOM-SAR-009',
      shortDescription: 'Handloom Mulmul cotton saree with contrast temple border.',
      description: 'Feather-light organic cotton woven by master artisans. Breathable, easy to drape, and accompanied by a matching running blouse piece.',
      categorySlug: 'womens-sarees',
      brandSlug: 'silk-heritage',
      basePrice: 2199,
      mrp: 3499,
      discountPercent: 37,
      fabric: '100% Handloom Mulmul Cotton',
      careInstructions: 'Gentle hand wash in cold water with mild liquid soap.',
      specifications: 'Length: 5.5 meters saree + 0.8 meter blouse | Pallu: Tasseled',
      tags: 'saree, cotton, handloom, ethnic, women',
      isFeatured: true,
      isNewArrival: false,
      isBestseller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
      ],
      variants: [
        { sku: 'WOM-SAR-009-RED-FS', color: 'Crimson Red', colorHex: '#991b1b', size: 'Free Size', stock: 12, price: 2199, mrp: 3499 },
        { sku: 'WOM-SAR-009-YEL-FS', color: 'Turmeric Yellow', colorHex: '#eab308', size: 'Free Size', stock: 15, price: 2199, mrp: 3499 },
      ],
    },
    {
      name: 'Premium Silk Blend Saree',
      slug: 'premium-silk-blend-saree',
      sku: 'WOM-SAR-010',
      shortDescription: 'Opulent woven zari silk saree with regal floral brocade.',
      description: 'A masterpiece created for weddings and grand celebrations. Features rich metallic zari weaving across the body with an elaborate heritage pallu.',
      categorySlug: 'womens-sarees',
      brandSlug: 'silk-heritage',
      basePrice: 4999,
      mrp: 7999,
      discountPercent: 37,
      fabric: 'Pure Katan Silk & Art Silk Blend',
      careInstructions: 'Dry clean only. Preserve in cloth bag.',
      specifications: 'Length: 6.3 meters including contrast unstitched blouse',
      tags: 'saree, silk, zari, festive, wedding, women',
      isFeatured: true,
      isNewArrival: true,
      isBestseller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
      ],
      variants: [
        { sku: 'WOM-SAR-010-EMR-FS', color: 'Emerald Green', colorHex: '#047857', size: 'Free Size', stock: 10, price: 4999, mrp: 7999 },
        { sku: 'WOM-SAR-010-BLU-FS', color: 'Royal Blue', colorHex: '#1e3a8a', size: 'Free Size', stock: 12, price: 4999, mrp: 7999 },
      ],
    },
    {
      name: 'Floral Print Kurti',
      slug: 'floral-print-kurti',
      sku: 'WOM-KUR-011',
      shortDescription: 'Everyday straight-fit rayon kurti with vintage botanical prints.',
      description: 'Soft, flowing rayon fabric that feels gentle against skin all day. Detailed with delicate piping along the mandarin neck and 3/4 sleeves.',
      categorySlug: 'womens-kurtis',
      brandSlug: 'sahasra-couture',
      basePrice: 999,
      mrp: 1599,
      discountPercent: 38,
      fabric: '100% Viscose Rayon',
      careInstructions: 'Machine wash gentle. Iron inside out.',
      specifications: 'Length: 44 inches (Calf Length) | Neck: Mandarin Collar',
      tags: 'kurti, floral, casual, ethnic, women',
      isFeatured: false,
      isNewArrival: true,
      isBestseller: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
      ],
      variants: [
        { sku: 'WOM-KUR-011-PNK-S', color: 'Pastel Pink', colorHex: '#f472b6', size: 'S', stock: 10, price: 999, mrp: 1599 },
        { sku: 'WOM-KUR-011-PNK-M', color: 'Pastel Pink', colorHex: '#f472b6', size: 'M', stock: 16, price: 999, mrp: 1599 },
        { sku: 'WOM-KUR-011-PNK-L', color: 'Pastel Pink', colorHex: '#f472b6', size: 'L', stock: 18, price: 999, mrp: 1599 },
      ],
    },
    {
      name: 'Embroidered Designer Kurti',
      slug: 'embroidered-designer-kurti',
      sku: 'WOM-KUR-012',
      shortDescription: 'Chanderi silk festive kurti featuring thread and gota patti work.',
      description: 'Lustrous festive garment with intricate gota borders and handcrafted resham thread embroidery on the yoke. Fully lined with breathable mulmul.',
      categorySlug: 'womens-kurtis',
      brandSlug: 'royal-loom',
      basePrice: 1699,
      mrp: 2599,
      discountPercent: 35,
      fabric: 'Chanderi Silk Cotton with Cotton Mulmul Lining',
      careInstructions: 'Dry clean recommended.',
      specifications: 'Length: 46 inches | Work: Gota Patti & Resham Embroidery',
      tags: 'kurti, embroidered, festive, designer, women',
      isFeatured: true,
      isNewArrival: false,
      isBestseller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
      ],
      variants: [
        { sku: 'WOM-KUR-012-YLW-M', color: 'Mustard Yellow', colorHex: '#ca8a04', size: 'M', stock: 14, price: 1699, mrp: 2599 },
        { sku: 'WOM-KUR-012-YLW-L', color: 'Mustard Yellow', colorHex: '#ca8a04', size: 'L', stock: 12, price: 1699, mrp: 2599 },
      ],
    },
    {
      name: 'Casual Women’s Dress',
      slug: 'casual-womens-dress',
      sku: 'WOM-DRS-013',
      shortDescription: 'Effortless A-line midi dress with waist tie and flutter sleeves.',
      description: 'Made from breathable cotton blend fabric with gentle stretch. Perfect for brunch dates, casual Fridays, and holiday getaways.',
      categorySlug: 'womens-dresses',
      brandSlug: 'urban-thread',
      basePrice: 1499,
      mrp: 2299,
      discountPercent: 35,
      fabric: 'Cotton-Viscose Blend',
      careInstructions: 'Machine wash cold. Warm iron.',
      specifications: 'Length: Midi (42 inches) | Silhouette: A-Line with Belt',
      tags: 'dress, casual, western, midi, women',
      isFeatured: false,
      isNewArrival: true,
      isBestseller: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
      ],
      variants: [
        { sku: 'WOM-DRS-013-BLU-S', color: 'Sky Blue', colorHex: '#38bdf8', size: 'S', stock: 8, price: 1499, mrp: 2299 },
        { sku: 'WOM-DRS-013-BLU-M', color: 'Sky Blue', colorHex: '#38bdf8', size: 'M', stock: 15, price: 1499, mrp: 2299 },
        { sku: 'WOM-DRS-013-BLU-L', color: 'Sky Blue', colorHex: '#38bdf8', size: 'L', stock: 12, price: 1499, mrp: 2299 },
      ],
    },
    {
      name: 'Premium Anarkali Dress',
      slug: 'premium-anarkali-dress',
      sku: 'WOM-DRS-014',
      shortDescription: 'Regal flared Anarkali gown with embellished bodice and dupatta.',
      description: 'Boasting a 4-meter flared silhouette with fine georgette pleating, golden mirror-work accents, and a coordinating net dupatta with scalloped borders.',
      categorySlug: 'womens-dresses',
      brandSlug: 'sahasra-couture',
      basePrice: 2999,
      mrp: 4999,
      discountPercent: 40,
      fabric: 'Pure Georgette with Shantoon Inner',
      careInstructions: 'Dry clean only.',
      specifications: 'Flare: 4 Meters | Length: Floor Length (54 inches)',
      tags: 'anarkali, gown, festive, wedding, women',
      isFeatured: true,
      isNewArrival: true,
      isBestseller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
      ],
      variants: [
        { sku: 'WOM-DRS-014-MAR-M', color: 'Deep Maroon', colorHex: '#881337', size: 'M', stock: 12, price: 2999, mrp: 4999 },
        { sku: 'WOM-DRS-014-MAR-L', color: 'Deep Maroon', colorHex: '#881337', size: 'L', stock: 15, price: 2999, mrp: 4999 },
        { sku: 'WOM-DRS-014-MAR-XL', color: 'Deep Maroon', colorHex: '#881337', size: 'XL', stock: 9, price: 2999, mrp: 4999 },
      ],
    },
    {
      name: 'Classic Women’s Top',
      slug: 'classic-womens-top',
      sku: 'WOM-TOP-015',
      shortDescription: 'Chic woven round-neck blouse with subtle puffed sleeves.',
      description: 'Lightweight poly-crepe top featuring subtle shoulder pleats, keyhole button closure at back, and a relaxed flattering drape.',
      categorySlug: 'womens-tops',
      brandSlug: 'urban-thread',
      basePrice: 799,
      mrp: 1299,
      discountPercent: 38,
      fabric: 'Premium Poly-Crepe',
      careInstructions: 'Machine wash delicate, hang dry.',
      specifications: 'Neck: Round Keyhole | Sleeve: 3/4 Puffed',
      tags: 'top, blouse, workwear, casual, women',
      isFeatured: false,
      isNewArrival: false,
      isBestseller: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1564257631407-4deb129f0e47?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
      ],
      variants: [
        { sku: 'WOM-TOP-015-WHT-S', color: 'Ivory White', colorHex: '#fffff0', size: 'S', stock: 10, price: 799, mrp: 1299 },
        { sku: 'WOM-TOP-015-WHT-M', color: 'Ivory White', colorHex: '#fffff0', size: 'M', stock: 16, price: 799, mrp: 1299 },
        { sku: 'WOM-TOP-015-OLV-M', color: 'Olive Green', colorHex: '#65a30d', size: 'M', stock: 12, price: 799, mrp: 1299 },
      ],
    },
    {
      name: 'Ethnic Printed Kurta Set',
      slug: 'ethnic-printed-kurta-set',
      sku: 'WOM-ETH-016',
      shortDescription: '3-Piece festive suit set including straight kurta, pants, and dupatta.',
      description: 'An all-in-one celebration ensemble. Pure cotton slub printed kurta with zari border, matching straight cropped trousers, and full-length chiffon dupatta.',
      categorySlug: 'womens-ethnic-wear',
      brandSlug: 'royal-loom',
      basePrice: 2499,
      mrp: 3999,
      discountPercent: 38,
      fabric: 'Cotton Slub with Chiffon Dupatta',
      careInstructions: 'Cold hand wash with mild detergent.',
      specifications: 'Includes: Kurta, Pant, Dupatta | Pant: Elasticated Waist',
      tags: 'kurta set, ethnic, festive, suit, women',
      isFeatured: true,
      isNewArrival: false,
      isBestseller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
      ],
      variants: [
        { sku: 'WOM-ETH-016-BLU-S', color: 'Indigo Blue', colorHex: '#1e3a8a', size: 'S', stock: 8, price: 2499, mrp: 3999 },
        { sku: 'WOM-ETH-016-BLU-M', color: 'Indigo Blue', colorHex: '#1e3a8a', size: 'M', stock: 15, price: 2499, mrp: 3999 },
        { sku: 'WOM-ETH-016-BLU-L', color: 'Indigo Blue', colorHex: '#1e3a8a', size: 'L', stock: 14, price: 2499, mrp: 3999 },
      ],
    },

    // ----------------- KIDS (17 to 24) -----------------
    {
      name: 'Boys Cotton T-Shirt',
      slug: 'boys-cotton-t-shirt',
      sku: 'KID-TSH-017',
      shortDescription: '100% hypoallergenic organic cotton t-shirt with fun adventure print.',
      description: 'Specially crafted for active kids. Breathable, non-toxic dyes, and flatlock anti-chafing seams that withstand playground play and daily wash cycles.',
      categorySlug: 'kids-tshirts',
      brandSlug: 'urban-thread',
      basePrice: 499,
      mrp: 799,
      discountPercent: 38,
      fabric: '100% Organic Super-Combed Cotton',
      careInstructions: 'Machine wash warm, tumble dry gentle.',
      specifications: 'Age Group: 3 to 10 Years | Fit: Regular Kids Fit',
      tags: 'kids, boys, tshirt, cotton, casual',
      isFeatured: false,
      isNewArrival: true,
      isBestseller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
      ],
      variants: [
        { sku: 'KID-TSH-017-RED-4Y', color: 'Bright Red', colorHex: '#dc2626', size: '4-5Y', stock: 12, price: 499, mrp: 799 },
        { sku: 'KID-TSH-017-RED-6Y', color: 'Bright Red', colorHex: '#dc2626', size: '6-7Y', stock: 15, price: 499, mrp: 799 },
        { sku: 'KID-TSH-017-YEL-6Y', color: 'Sunshine Yellow', colorHex: '#facc15', size: '6-7Y', stock: 14, price: 499, mrp: 799 },
      ],
    },
    {
      name: 'Boys Denim Jeans',
      slug: 'boys-denim-jeans',
      sku: 'KID-JNS-018',
      shortDescription: 'Soft stretchable denim with adjustable inner elastic waistband.',
      description: 'Durable enough for tree-climbing, stylish enough for family celebrations. Built with an internal buttonhole elastic waistband for growing kids.',
      categorySlug: 'kids-boys-wear',
      brandSlug: 'urban-thread',
      basePrice: 899,
      mrp: 1399,
      discountPercent: 36,
      fabric: '80% Cotton, 18% Poly, 2% Spandex',
      careInstructions: 'Machine wash cold.',
      specifications: 'Waist: Adjustable Elastic | Pockets: 5 Pocket',
      tags: 'kids, boys, jeans, denim, pants',
      isFeatured: false,
      isNewArrival: false,
      isBestseller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
      ],
      variants: [
        { sku: 'KID-JNS-018-BLU-4Y', color: 'Medium Wash Blue', colorHex: '#2563eb', size: '4-5Y', stock: 10, price: 899, mrp: 1399 },
        { sku: 'KID-JNS-018-BLU-6Y', color: 'Medium Wash Blue', colorHex: '#2563eb', size: '6-7Y', stock: 12, price: 899, mrp: 1399 },
        { sku: 'KID-JNS-018-BLU-8Y', color: 'Medium Wash Blue', colorHex: '#2563eb', size: '8-9Y', stock: 10, price: 899, mrp: 1399 },
      ],
    },
    {
      name: 'Boys Casual Shirt',
      slug: 'boys-casual-shirt',
      sku: 'KID-SHT-019',
      shortDescription: 'Smart plaid button-up shirt in skin-soft breathable cotton.',
      description: 'Lively check pattern shirt with soft roll-up sleeves and wooden buttons. Pairs effortlessly with chinos and denim.',
      categorySlug: 'kids-boys-wear',
      brandSlug: 'sahasra-couture',
      basePrice: 699,
      mrp: 1099,
      discountPercent: 36,
      fabric: '100% Breathable Cotton',
      careInstructions: 'Machine wash gentle, medium iron.',
      specifications: 'Collar: Shirt Collar | Sleeve: Convertible Roll-up',
      tags: 'kids, boys, shirt, plaid, casual',
      isFeatured: true,
      isNewArrival: true,
      isBestseller: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
      ],
      variants: [
        { sku: 'KID-SHT-019-CHK-4Y', color: 'Navy Check', colorHex: '#1e3a8a', size: '4-5Y', stock: 10, price: 699, mrp: 1099 },
        { sku: 'KID-SHT-019-CHK-6Y', color: 'Navy Check', colorHex: '#1e3a8a', size: '6-7Y', stock: 14, price: 699, mrp: 1099 },
      ],
    },
    {
      name: 'Girls Floral Dress',
      slug: 'girls-floral-dress',
      sku: 'KID-DRS-020',
      shortDescription: 'Pastel botanical floral flared dress with bow waist.',
      description: 'Adorably styled knee-length summer frock with cap sleeves, cotton lining, and back sash tie for a snug, photogenic fit.',
      categorySlug: 'kids-dresses',
      brandSlug: 'sahasra-couture',
      basePrice: 899,
      mrp: 1399,
      discountPercent: 36,
      fabric: 'Fine Cotton with Soft Muslin Lining',
      careInstructions: 'Hand wash or delicate machine wash.',
      specifications: 'Closure: Back Concealed Zip | Length: Knee Length',
      tags: 'kids, girls, dress, floral, frock',
      isFeatured: true,
      isNewArrival: true,
      isBestseller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
      ],
      variants: [
        { sku: 'KID-DRS-020-PNK-3Y', color: 'Blush Pink', colorHex: '#f472b6', size: '2-3Y', stock: 8, price: 899, mrp: 1399 },
        { sku: 'KID-DRS-020-PNK-5Y', color: 'Blush Pink', colorHex: '#f472b6', size: '4-5Y', stock: 15, price: 899, mrp: 1399 },
        { sku: 'KID-DRS-020-PNK-7Y', color: 'Blush Pink', colorHex: '#f472b6', size: '6-7Y', stock: 12, price: 899, mrp: 1399 },
      ],
    },
    {
      name: 'Girls Cotton Frock',
      slug: 'girls-cotton-frock',
      sku: 'KID-FRK-021',
      shortDescription: 'Breezy printed daily-wear cotton frock with scalloped collar.',
      description: 'Pure comfortable cotton dress designed for playtime comfort. Decorated with sweet vintage polka dots and a rounded peter-pan collar.',
      categorySlug: 'kids-dresses',
      brandSlug: 'urban-thread',
      basePrice: 649,
      mrp: 999,
      discountPercent: 35,
      fabric: '100% Breathable Cotton',
      careInstructions: 'Machine wash warm.',
      specifications: 'Fit: Regular Flare | Neck: Peter Pan Collar',
      tags: 'kids, girls, frock, cotton, dailywear',
      isFeatured: false,
      isNewArrival: false,
      isBestseller: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
      ],
      variants: [
        { sku: 'KID-FRK-021-YEL-3Y', color: 'Sunny Yellow', colorHex: '#facc15', size: '2-3Y', stock: 10, price: 649, mrp: 999 },
        { sku: 'KID-FRK-021-YEL-5Y', color: 'Sunny Yellow', colorHex: '#facc15', size: '4-5Y', stock: 14, price: 649, mrp: 999 },
      ],
    },
    {
      name: 'Kids Printed T-Shirt',
      slug: 'kids-printed-t-shirt',
      sku: 'KID-TSH-022',
      shortDescription: 'Cheerful animal motif crewneck tee for girls and boys.',
      description: 'Super soft round-neck tee made with skin-friendly certified organic dyes. Breathable and stretchable for unlimited play.',
      categorySlug: 'kids-tshirts',
      brandSlug: 'urban-thread',
      basePrice: 449,
      mrp: 699,
      discountPercent: 36,
      fabric: '100% Pure Combed Cotton (160 GSM)',
      careInstructions: 'Machine wash cold.',
      specifications: 'Unisex Kids Fit | Neck: Ribbed Crewneck',
      tags: 'kids, tshirt, graphic, unisex, casual',
      isFeatured: false,
      isNewArrival: false,
      isBestseller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
      ],
      variants: [
        { sku: 'KID-TSH-022-WHT-4Y', color: 'Cloud White', colorHex: '#fafaf9', size: '4-5Y', stock: 12, price: 449, mrp: 699 },
        { sku: 'KID-TSH-022-WHT-6Y', color: 'Cloud White', colorHex: '#fafaf9', size: '6-7Y', stock: 16, price: 449, mrp: 699 },
      ],
    },
    {
      name: 'Kids Ethnic Kurta Set',
      slug: 'kids-ethnic-kurta-set',
      sku: 'KID-ETH-023',
      shortDescription: 'Festive silk-cotton kurta with matching pajama for boys.',
      description: 'Traditional styling without sacrificing comfort. Lightweight jacquard kurta lined with cotton, paired with a soft drawcord pajama.',
      categorySlug: 'kids-boys-wear',
      brandSlug: 'royal-loom',
      basePrice: 1199,
      mrp: 1899,
      discountPercent: 37,
      fabric: 'Silk Cotton with 100% Cotton Lining',
      careInstructions: 'Gentle hand wash with mild soap.',
      specifications: 'Set includes: Kurta and Pajama | Neck: Mandarin Collar',
      tags: 'kids, boys, ethnic, kurta, festive',
      isFeatured: true,
      isNewArrival: true,
      isBestseller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
      ],
      variants: [
        { sku: 'KID-ETH-023-MRN-4Y', color: 'Maroon Gold', colorHex: '#881337', size: '4-5Y', stock: 10, price: 1199, mrp: 1899 },
        { sku: 'KID-ETH-023-MRN-6Y', color: 'Maroon Gold', colorHex: '#881337', size: '6-7Y', stock: 14, price: 1199, mrp: 1899 },
        { sku: 'KID-ETH-023-MRN-8Y', color: 'Maroon Gold', colorHex: '#881337', size: '8-9Y', stock: 12, price: 1199, mrp: 1899 },
      ],
    },
    {
      name: 'Kids Party Wear Dress',
      slug: 'kids-party-wear-dress',
      sku: 'KID-DRS-024',
      shortDescription: 'Sequined bodice shimmer party dress with voluminous net skirt.',
      description: 'A magical princess dress crafted with gentle micro-sequins, layered soft tulle net skirt, and soft cotton lining to protect delicate skin.',
      categorySlug: 'kids-girls-wear',
      brandSlug: 'silk-heritage',
      basePrice: 1499,
      mrp: 2299,
      discountPercent: 35,
      fabric: 'Soft Tulle Net with 100% Cotton Lining',
      careInstructions: 'Dry clean recommended.',
      specifications: 'Length: Knee Length | Layers: 3 Tier Soft Tulle',
      tags: 'kids, girls, partywear, princess, dress',
      isFeatured: true,
      isNewArrival: true,
      isBestseller: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
      ],
      variants: [
        { sku: 'KID-DRS-024-GLD-4Y', color: 'Rose Gold', colorHex: '#fb7185', size: '4-5Y', stock: 8, price: 1499, mrp: 2299 },
        { sku: 'KID-DRS-024-GLD-6Y', color: 'Rose Gold', colorHex: '#fb7185', size: '6-7Y', stock: 12, price: 1499, mrp: 2299 },
        { sku: 'KID-DRS-024-GLD-8Y', color: 'Rose Gold', colorHex: '#fb7185', size: '8-9Y', stock: 10, price: 1499, mrp: 2299 },
      ],
    },
  ];

  console.log(`Starting upsert of ${productsData.length} realistic garment products...`);

  for (const p of productsData) {
    const categoryId = categoryMap[p.categorySlug] || categoryMap['men'];
    const brandId = brandMap[p.brandSlug] || null;

    const product = await prisma.product.upsert({
      where: { storeId_slug: { storeId: store.id, slug: p.slug } },
      update: {
        name: p.name,
        sku: p.sku,
        shortDescription: p.shortDescription,
        description: p.description,
        categoryId,
        brandId,
        basePrice: p.basePrice,
        mrp: p.mrp,
        discountPercent: p.discountPercent,
        taxPercent: 5.0,
        fabric: p.fabric,
        careInstructions: p.careInstructions,
        specifications: p.specifications,
        tags: p.tags,
        isPublished: true,
        isFeatured: p.isFeatured,
        isNewArrival: p.isNewArrival,
        isBestseller: p.isBestseller,
      },
      create: {
        storeId: store.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        shortDescription: p.shortDescription,
        description: p.description,
        categoryId,
        brandId,
        basePrice: p.basePrice,
        mrp: p.mrp,
        discountPercent: p.discountPercent,
        taxPercent: 5.0,
        fabric: p.fabric,
        careInstructions: p.careInstructions,
        specifications: p.specifications,
        tags: p.tags,
        isPublished: true,
        isFeatured: p.isFeatured,
        isNewArrival: p.isNewArrival,
        isBestseller: p.isBestseller,
      },
    });

    // Images
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: p.images.map((img, idx) => ({
        productId: product.id,
        url: img.url,
        isPrimary: img.isPrimary,
        displayOrder: idx,
      })),
    });

    // Variants and Inventory
    for (const v of p.variants) {
      const variant = await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          productId: product.id,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex || null,
          stock: v.stock,
          price: v.price || product.basePrice,
          mrp: v.mrp || product.mrp,
          isActive: true,
        },
        create: {
          productId: product.id,
          sku: v.sku,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex || null,
          stock: v.stock,
          price: v.price || product.basePrice,
          mrp: v.mrp || product.mrp,
          isActive: true,
        },
      });

      await prisma.inventory.upsert({
        where: { variantId: variant.id },
        update: {
          currentStock: v.stock,
          lowStockThreshold: 5,
        },
        create: {
          variantId: variant.id,
          currentStock: v.stock,
          lowStockThreshold: 5,
        },
      });
    }
  }

  console.log(`✓ 24 Demo Products with full Garment Variants & Inventory seeded.`);

  // 7. Coupons
  const couponsData = [
    {
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderValue: 999,
      maxDiscount: 500,
      usageLimit: 500,
    },
    {
      code: 'NEWUSER',
      discountType: 'FIXED',
      discountValue: 100,
      minOrderValue: 499,
      maxDiscount: null,
      usageLimit: 1000,
    },
  ];

  for (const c of couponsData) {
    await prisma.coupon.upsert({
      where: { storeId_code: { storeId: store.id, code: c.code } },
      update: {
        discountType: c.discountType,
        discountValue: c.discountValue,
        minOrderValue: c.minOrderValue,
        maxDiscount: c.maxDiscount || null,
        usageLimit: c.usageLimit,
        isActive: true,
      },
      create: {
        storeId: store.id,
        code: c.code,
        discountType: c.discountType,
        discountValue: c.discountValue,
        minOrderValue: c.minOrderValue,
        maxDiscount: c.maxDiscount || null,
        usageLimit: c.usageLimit,
        isActive: true,
      },
    });
  }

  console.log(`✓ Demo Coupons (WELCOME10 & NEWUSER) configured.`);

  // 8. Demo Banners
  await prisma.banner.deleteMany({ where: { storeId: store.id } });
  await prisma.banner.createMany({
    data: [
      {
        storeId: store.id,
        title: 'New Season Collection',
        subtitle: 'Hand-woven heritage sarees, bespoke suits & designer festive couture.',
        imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=85',
        ctaText: 'Explore New Collection',
        ctaUrl: '/category/new-arrivals',
        position: 'HERO',
        displayOrder: 1,
        isActive: true,
      },
      {
        storeId: store.id,
        title: "Men's Premium Collection",
        subtitle: 'Tailored Linen Shirts, Selvedge Denim, & Contemporary Trousers',
        imageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1800&q=85',
        ctaText: "Shop Men's Collection",
        ctaUrl: '/category/men',
        position: 'PROMO_1',
        displayOrder: 2,
        isActive: true,
      },
      {
        storeId: store.id,
        title: "Women's Festive Collection",
        subtitle: 'Pure Banarasi Silks, Embroidered Anarkalis & Designer Gowns',
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1800&q=85',
        ctaText: "Shop Women's Festive",
        ctaUrl: '/category/women',
        position: 'PROMO_2',
        displayOrder: 3,
        isActive: true,
      },
      {
        storeId: store.id,
        title: 'Kids Celebration Wear',
        subtitle: 'Comfortable, Skin-Friendly Daily & Party Outfits for Boys & Girls',
        imageUrl: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=1800&q=85',
        ctaText: 'Explore Kids Wear',
        ctaUrl: '/category/kids',
        position: 'PROMO_3',
        displayOrder: 4,
        isActive: true,
      },
    ],
  });

  console.log(`✓ 4 Homepage Banners configured.`);

  // 9. Demo Order (Idempotent)
  const existingOrder = await prisma.order.findFirst({ where: { storeId: store.id } });
  if (!existingOrder) {
    const sampleProduct = await prisma.product.findFirst({
      where: { storeId: store.id, slug: 'premium-cotton-casual-shirt' },
      include: { variants: true },
    });

    if (sampleProduct && sampleProduct.variants.length > 0) {
      const v = sampleProduct.variants[0];
      const createdOrder = await prisma.order.create({
        data: {
          storeId: store.id,
          orderNumber: 'SG-2026-1001',
          userId: customerUser.id,
          customerId: customerProfile.id,
          customerName: 'Ananya Sharma',
          customerEmail: 'customer@demo.com',
          customerPhone: '+91 91234 56789',
          shippingAddress: {
            name: 'Ananya Sharma',
            phone: '+91 91234 56789',
            addressLine1: 'Flat 402, Lotus Residency',
            addressLine2: 'Banjara Hills, Road 12',
            area: 'Banjara Hills',
            city: 'Hyderabad',
            state: 'Telangana',
            pincode: '500034',
          },
          subtotal: v.price || sampleProduct.basePrice,
          discountAmount: 100,
          couponCode: 'NEWUSER',
          shippingFee: 0,
          taxAmount: Math.round(((v.price || sampleProduct.basePrice) - 100) * 0.05),
          grandTotal: Math.round(((v.price || sampleProduct.basePrice) - 100) * 1.05),
          status: 'PROCESSING',
          paymentStatus: 'PAID',
          paymentMethod: 'ONLINE',
          items: {
            create: [
              {
                productId: sampleProduct.id,
                variantId: v.id,
                productName: sampleProduct.name,
                variantTitle: `Color: ${v.color}, Size: ${v.size}`,
                sku: v.sku,
                unitPrice: v.price || sampleProduct.basePrice,
                quantity: 1,
                totalPrice: v.price || sampleProduct.basePrice,
                taxAmount: Math.round((v.price || sampleProduct.basePrice) * 0.05),
              },
            ],
          },
          payments: {
            create: [
              {
                amount: Math.round(((v.price || sampleProduct.basePrice) - 100) * 1.05),
                method: 'ONLINE',
                status: 'PAID',
                transactionRef: 'PAY-DEMO-2026-X8192',
              },
            ],
          },
        },
      });
      console.log(`✓ Sample Order created: ${createdOrder.orderNumber}`);
    }
  }

  console.log('--- Database Seed Finished Successfully! ---');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
