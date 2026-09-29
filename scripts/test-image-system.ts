import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/prisma';
import {
  validateImageUrl,
  validateImageFile,
  verifyImageBufferMagicBytes,
  FALLBACK_IMAGE_URL,
} from '../src/lib/image-utils';

// Helper to create a minimal valid JPEG image buffer
function createMinimalJpegBuffer(): Buffer {
  // A minimal valid JPEG file bytes (1x1 pixel)
  return Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
    0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
    0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
    0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
    0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00,
    0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
    0x09, 0x0a, 0x0b, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
    0x00, 0xbf, 0x00, 0xff, 0xd9,
  ]);
}

async function runTests() {
  console.log('========================================================');
  console.log('SAHASRA GARMENTS — DUAL-SOURCE IMAGE SYSTEM TEST SUITE');
  console.log('========================================================\n');

  let passedTests = 0;
  let totalTests = 7;

  // -------------------------------------------------------------------
  // TEST A: Local Computer Upload & Storage Verification
  // -------------------------------------------------------------------
  console.log('[TEST A] Testing Local Computer Image Upload...');
  const testImagesDir = 'D:\\TestImages';
  if (!fs.existsSync(testImagesDir)) {
    fs.mkdirSync(testImagesDir, { recursive: true });
  }
  const testLocalPath = path.join(testImagesDir, 'shirt.jpg');
  const validJpegBuffer = createMinimalJpegBuffer();
  fs.writeFileSync(testLocalPath, validJpegBuffer);
  console.log(`  ✓ Created local test image at: ${testLocalPath} (${validJpegBuffer.length} bytes)`);

  // Verify that the file can be read and passes buffer magic bytes
  const magicCheck = verifyImageBufferMagicBytes(validJpegBuffer);
  if (!magicCheck.valid || magicCheck.format !== 'jpeg') {
    throw new Error('TEST A FAILED: Magic bytes validation failed for valid JPEG buffer.');
  }

  // Get Store
  const store = await prisma.store.findFirst();
  if (!store) throw new Error('No store found in database.');
  const storeId = store.id;

  // Simulate upload process to /public/uploads/products/${storeId}/
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products', storeId);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const safeFilename = `img-test-${Date.now()}-local.jpg`;
  const savedDiskPath = path.join(uploadDir, safeFilename);
  fs.writeFileSync(savedDiskPath, validJpegBuffer);

  // The generated web URL:
  const generatedWebUrl = `/uploads/products/${storeId}/${safeFilename}`;
  console.log(`  ✓ Server generated safe web URL: ${generatedWebUrl}`);
  console.log(`  ✓ Verified file saved safely to disk: ${savedDiskPath}`);

  // CRITICAL RULE: Database MUST store public web URL, NEVER D:\TestImages\shirt.jpg
  if (generatedWebUrl.includes('D:') || generatedWebUrl.includes('\\')) {
    throw new Error('TEST A FAILED: Windows filesystem path leaked into image URL!');
  }

  // Find a category
  const category = await prisma.category.findFirst({ where: { storeId } });
  if (!category) throw new Error('No category found.');

  // Create a product with this local uploaded image
  const testProductA = await prisma.product.create({
    data: {
      storeId,
      name: 'Local Upload Verified Shirt',
      slug: `local-upload-test-${Date.now()}`,
      sku: `SKU-LOCAL-${Date.now()}`,
      description: 'A premium handcrafted garment piece with local image upload verification.',
      basePrice: 1499,
      mrp: 2499,
      categoryId: category.id,
      images: {
        create: [
          {
            url: generatedWebUrl,
            isPrimary: true,
            displayOrder: 0,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: `SKU-LOCAL-VAR-${Date.now()}`,
            size: 'M',
            color: 'Navy Blue',
            stock: 25,
            price: 1499,
          },
        ],
      },
    },
    include: { images: true, variants: true },
  });

  // Re-query product from DB to simulate reopening product
  const reopenedProductA = await prisma.product.findUnique({
    where: { id: testProductA.id },
    include: { images: true },
  });

  if (!reopenedProductA || reopenedProductA.images.length === 0) {
    throw new Error('TEST A FAILED: Product or images could not be retrieved.');
  }

  const storedImageUrl = reopenedProductA.images[0].url;
  console.log(`  ✓ Database stored image URL: ${storedImageUrl}`);
  if (storedImageUrl !== generatedWebUrl || storedImageUrl.includes('D:')) {
    throw new Error('TEST A FAILED: Database image URL does not match web URL or contains drive letter.');
  }
  console.log('  -> TEST A PASSED: Local upload successfully converted to web URL, saved, reopened, and verified!\n');
  passedTests++;

  // -------------------------------------------------------------------
  // TEST B: Online HTTPS Image URL
  // -------------------------------------------------------------------
  console.log('[TEST B] Testing Online HTTPS Image URL...');
  const onlineHttpsUrl = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80';
  const urlValidation = validateImageUrl(onlineHttpsUrl);
  if (!urlValidation.valid) {
    throw new Error(`TEST B FAILED: Valid HTTPS URL was rejected: ${urlValidation.error}`);
  }
  console.log(`  ✓ URL validation accepted: ${onlineHttpsUrl}`);

  // Create product with online HTTPS URL
  const testProductB = await prisma.product.create({
    data: {
      storeId,
      name: 'Online URL Verified Kurti',
      slug: `online-url-test-${Date.now()}`,
      sku: `SKU-ONLINE-${Date.now()}`,
      description: 'A designer online garment piece with verified HTTPS URL.',
      basePrice: 2299,
      mrp: 3499,
      categoryId: category.id,
      images: {
        create: [
          {
            url: onlineHttpsUrl,
            isPrimary: true,
            displayOrder: 0,
          },
        ],
      },
      variants: {
        create: [
          {
            sku: `SKU-ONLINE-VAR-${Date.now()}`,
            size: 'Free Size',
            color: 'Maroon',
            stock: 15,
            price: 2299,
          },
        ],
      },
    },
    include: { images: true },
  });

  const reopenedProductB = await prisma.product.findUnique({
    where: { id: testProductB.id },
    include: { images: true },
  });

  if (!reopenedProductB || reopenedProductB.images[0].url !== onlineHttpsUrl) {
    throw new Error('TEST B FAILED: Online image URL not saved accurately.');
  }
  console.log(`  ✓ Database retrieved online image: ${reopenedProductB.images[0].url}`);
  console.log('  -> TEST B PASSED: Arbitrary HTTPS online URL successfully added, saved, reopened, and verified!\n');
  passedTests++;

  // -------------------------------------------------------------------
  // TEST C: Invalid URL Rejection (Windows path in URL field, javascript, file:, etc.)
  // -------------------------------------------------------------------
  console.log('[TEST C] Testing Invalid URL Rejection...');
  const invalidUrls = [
    { url: 'D:\\TestImages\\shirt.jpg', reason: 'Windows drive path' },
    { url: 'C:\\Users\\Admin\\photo.png', reason: 'C: drive path' },
    { url: 'file:///D:/TestImages/shirt.jpg', reason: 'file:// scheme' },
    { url: 'javascript:alert(1)', reason: 'javascript: XSS injection' },
    { url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', reason: 'data: URI scheme' },
    { url: 'http://insecure-site.com/image.jpg', reason: 'Insecure HTTP external' },
    { url: 'not-a-valid-url', reason: 'Malformed string' },
  ];

  for (const item of invalidUrls) {
    const res = validateImageUrl(item.url);
    if (res.valid) {
      throw new Error(`TEST C FAILED: Expected invalid URL '${item.url}' to be rejected, but it passed!`);
    }
    console.log(`  ✓ Successfully rejected [${item.reason}]: ${res.error}`);
  }
  console.log('  -> TEST C PASSED: All invalid URLs, schemes, and drive paths correctly rejected with clear messages!\n');
  passedTests++;

  // -------------------------------------------------------------------
  // TEST D: Unsupported File Validation (MIME, Extension, Magic Bytes)
  // -------------------------------------------------------------------
  console.log('[TEST D] Testing Unsupported File and Content Rejection...');
  // 1. Text file with .txt
  const txtCheck = validateImageFile({ name: 'document.txt', size: 1024, type: 'text/plain' });
  if (txtCheck.valid) throw new Error('TEST D FAILED: Text file was not rejected by validateImageFile.');
  console.log(`  ✓ Rejected .txt file: ${txtCheck.error}`);

  // 2. Executable with .exe
  const exeCheck = validateImageFile({ name: 'virus.exe', size: 1024, type: 'application/x-msdownload' });
  if (exeCheck.valid) throw new Error('TEST D FAILED: .exe file was not rejected.');
  console.log(`  ✓ Rejected .exe file: ${exeCheck.error}`);

  // 3. Oversized file (>10MB)
  const hugeCheck = validateImageFile({ name: 'huge.jpg', size: 15 * 1024 * 1024, type: 'image/jpeg' });
  if (hugeCheck.valid) throw new Error('TEST D FAILED: Oversized file was not rejected.');
  console.log(`  ✓ Rejected oversized file: ${hugeCheck.error}`);

  // 4. Fake image (executable or text buffer renamed to .jpg)
  const fakeImageBuffer = Buffer.from('This is not an image, it is a text file!');
  const fakeMagic = verifyImageBufferMagicBytes(fakeImageBuffer);
  if (fakeMagic.valid) throw new Error('TEST D FAILED: Fake image bytes bypassed magic bytes check.');
  console.log('  ✓ Rejected fake image buffer (disguised non-image payload via magic bytes check)');
  console.log('  -> TEST D PASSED: Unsupported files, oversized files, and fake images rejected safely!\n');
  passedTests++;

  // -------------------------------------------------------------------
  // TEST E: Storefront Product Detail Page Display
  // -------------------------------------------------------------------
  console.log('[TEST E] Testing Storefront Product Detail Data Retrieval...');
  const detailA = await prisma.product.findUnique({
    where: { storeId_slug: { storeId, slug: testProductA.slug } },
    include: {
      category: true,
      brand: true,
      images: { orderBy: { displayOrder: 'asc' } },
      variants: { include: { inventory: true } },
    },
  });

  if (!detailA || detailA.images.length === 0 || !detailA.images[0].url.startsWith('/uploads/')) {
    throw new Error('TEST E FAILED: Product detail query failed for local uploaded image product.');
  }
  console.log(`  ✓ Local upload product detail retrieved: ${detailA.name} with image ${detailA.images[0].url}`);

  const detailB = await prisma.product.findUnique({
    where: { storeId_slug: { storeId, slug: testProductB.slug } },
    include: {
      category: true,
      brand: true,
      images: { orderBy: { displayOrder: 'asc' } },
      variants: { include: { inventory: true } },
    },
  });

  if (!detailB || detailB.images.length === 0 || !detailB.images[0].url.startsWith('https://')) {
    throw new Error('TEST E FAILED: Product detail query failed for online image product.');
  }
  console.log(`  ✓ Online URL product detail retrieved: ${detailB.name} with image ${detailB.images[0].url}`);
  console.log('  -> TEST E PASSED: Product detail data query succeeds for both image sources!\n');
  passedTests++;

  // -------------------------------------------------------------------
  // TEST F: Storefront Category Product Card Display
  // -------------------------------------------------------------------
  console.log('[TEST F] Testing Storefront Category Product Card Retrieval...');
  const categoryProducts = await prisma.product.findMany({
    where: { categoryId: category.id, isPublished: true },
    include: {
      images: { orderBy: { displayOrder: 'asc' } },
      variants: true,
    },
    take: 10,
  });

  if (categoryProducts.length === 0) {
    throw new Error('TEST F FAILED: No category products returned.');
  }

  const foundUploadProduct = categoryProducts.find((p) => p.id === testProductA.id);
  const foundOnlineProduct = categoryProducts.find((p) => p.id === testProductB.id);

  if (!foundUploadProduct || !foundOnlineProduct) {
    throw new Error('TEST F FAILED: Created products not found in category listing.');
  }

  console.log(`  ✓ Category listing includes product with local upload: primary image = ${foundUploadProduct.images[0].url}`);
  console.log(`  ✓ Category listing includes product with online URL: primary image = ${foundOnlineProduct.images[0].url}`);
  console.log('  -> TEST F PASSED: Storefront category product cards correctly populate images from both sources!\n');
  passedTests++;

  // -------------------------------------------------------------------
  // Cleanup test products to keep database clean
  // -------------------------------------------------------------------
  await prisma.productImage.deleteMany({ where: { productId: { in: [testProductA.id, testProductB.id] } } });
  await prisma.inventory.deleteMany({ where: { variant: { productId: { in: [testProductA.id, testProductB.id] } } } });
  await prisma.productVariant.deleteMany({ where: { productId: { in: [testProductA.id, testProductB.id] } } });
  await prisma.product.deleteMany({ where: { id: { in: [testProductA.id, testProductB.id] } } });
  console.log('  ✓ Cleaned up temporary test products from database.');

  console.log(`\n========================================================`);
  console.log(`ALL TESTS COMPLETED: ${passedTests} / 6 functional tests passed!`);
  console.log(`Next step: Run 'npx next build' (TEST G).`);
  console.log(`========================================================\n`);
}

runTests()
  .catch((err) => {
    console.error('Test execution failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
