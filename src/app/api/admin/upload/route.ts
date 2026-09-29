import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getStoreId } from '@/lib/store-config';
import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_FILE_SIZE_BYTES,
  getFileExtension,
  verifyImageBufferMagicBytes,
} from '@/lib/image-utils';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const storeId = await getStoreId(session.storeId);

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No image file provided. Please choose a valid image file.' },
        { status: 400 }
      );
    }

    // 1. File Size Validation
    if (file.size <= 0) {
      return NextResponse.json({ error: 'The uploaded file is empty.' }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        { error: `File size (${sizeMb}MB) exceeds the maximum allowed 10MB limit.` },
        { status: 400 }
      );
    }

    // 2. Extension & MIME Validation
    const originalExt = getFileExtension(file.name).toLowerCase();
    if (!ALLOWED_IMAGE_EXTENSIONS.includes(originalExt)) {
      return NextResponse.json(
        {
          error: `Unsupported file format '${originalExt || 'unknown'}'. Only JPG, JPEG, PNG, and WEBP images are supported.`,
        },
        { status: 400 }
      );
    }

    const mime = (file.type || '').toLowerCase();
    if (mime && !ALLOWED_IMAGE_MIME_TYPES.includes(mime)) {
      return NextResponse.json(
        {
          error: `Unsupported file type '${mime}'. Only JPG, PNG, and WEBP images are allowed.`,
        },
        { status: 400 }
      );
    }

    // 3. Read Buffer & Verify Magic Bytes / File Signatures
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const magicCheck = verifyImageBufferMagicBytes(buffer);
    if (!magicCheck.valid) {
      return NextResponse.json(
        {
          error:
            'Invalid or corrupted image file content. The file does not match a valid JPG, PNG, or WEBP image format.',
        },
        { status: 400 }
      );
    }

    // Normalize extension (.jpeg -> .jpg)
    const normalizedExt = originalExt === '.jpeg' ? '.jpg' : originalExt;

    // 4. Generate Safe Unique Filename (preventing path traversal and avoiding exposure of local paths)
    const randomHex = crypto.randomBytes(8).toString('hex');
    const safeFilename = `img-${Date.now()}-${randomHex}${normalizedExt}`;

    // Target upload directory scoped to storeId
    const baseUploadDir = path.join(process.cwd(), 'public', 'uploads', 'products', storeId);

    // Verify path safety
    const resolvedTargetPath = path.join(baseUploadDir, safeFilename);
    const normalizedBase = path.normalize(baseUploadDir);
    const normalizedTarget = path.normalize(resolvedTargetPath);

    if (!normalizedTarget.startsWith(normalizedBase)) {
      return NextResponse.json({ error: 'Illegal path traversal detected.' }, { status: 400 });
    }

    // Ensure directory exists
    await fs.mkdir(baseUploadDir, { recursive: true });

    // Write file to disk
    await fs.writeFile(resolvedTargetPath, buffer);

    // 5. Construct Web-Accessible URL
    // Public web path served by Next.js /uploads
    const publicUrl = `/uploads/products/${storeId}/${safeFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: safeFilename,
      size: file.size,
      format: magicCheck.format,
    });
  } catch (error: any) {
    console.error('Error handling admin image upload:', error);
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized to upload images.' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to process and store image upload.' },
      { status: 500 }
    );
  }
}
