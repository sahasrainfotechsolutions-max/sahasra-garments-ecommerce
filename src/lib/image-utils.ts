/**
 * Image Utilities and Security Validation for Sahasra Garments Master Template
 */

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export const MAX_IMAGE_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const FALLBACK_IMAGE_URL = '/placeholder-garment.svg';

/**
 * Validates an online image URL string.
 * Enforces HTTPS, rejects local file paths, javascript:, data:, file:, etc.
 */
export function validateImageUrl(urlStr: string): { valid: boolean; error?: string } {
  if (!urlStr || typeof urlStr !== 'string') {
    return { valid: false, error: 'Image URL is required' };
  }

  const trimmed = urlStr.trim();

  // Check if user mistakenly passed a Windows or Unix local filesystem path
  if (
    /^[a-zA-Z]:[\\/]/.test(trimmed) ||
    trimmed.startsWith('\\\\') ||
    trimmed.startsWith('file:') ||
    (trimmed.includes('\\') && !trimmed.startsWith('http'))
  ) {
    return {
      valid: false,
      error:
        "Local computer file paths (e.g. 'D:\\...') cannot be used directly as online URLs. Please use 'Upload from Computer' instead.",
    };
  }

  // Reject dangerous pseudo-protocols
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('blob:')
  ) {
    return {
      valid: false,
      error: 'Invalid URL scheme. Only secure https:// online image URLs are allowed.',
    };
  }

  // Allow root-relative uploaded paths like /uploads/products/...
  if (trimmed.startsWith('/uploads/')) {
    return { valid: true };
  }

  // Parse as URL
  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return {
        valid: false,
        error: 'Only secure HTTPS image URLs are supported (e.g. https://example.com/shirt.jpg)',
      };
    }

    if (parsed.protocol === 'http:' && parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
      return {
        valid: false,
        error: 'Only secure HTTPS image URLs are allowed for external hosts.',
      };
    }

    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      if (parsed.hostname !== 'localhost') {
        return { valid: false, error: 'Invalid domain hostname in image URL.' };
      }
    }

    return { valid: true };
  } catch (e) {
    return {
      valid: false,
      error: 'Please enter a valid, well-formed HTTPS image URL (e.g. https://example.com/product.jpg).',
    };
  }
}

/**
 * Validates a client File object before upload.
 */
export function validateImageFile(file: { name: string; size: number; type: string }): {
  valid: boolean;
  error?: string;
} {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // Check file size
  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the maximum allowed 10MB limit.`,
    };
  }

  // Check extension
  const ext = getFileExtension(file.name).toLowerCase();
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported file format (${ext || 'unknown'}). Only JPG, JPEG, PNG, and WEBP images are allowed.`,
    };
  }

  // Check MIME type if provided
  if (file.type && !ALLOWED_IMAGE_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported file MIME type (${file.type}). Only JPG, PNG, and WEBP images are supported.`,
    };
  }

  return { valid: true };
}

/**
 * Extracts normalized file extension with dot (e.g. '.jpg')
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.slice(lastDot).toLowerCase();
}

/**
 * Verifies magic bytes/buffer header for JPEG, PNG, WEBP.
 */
export function verifyImageBufferMagicBytes(buffer: Buffer): { valid: boolean; format?: string } {
  if (!buffer || buffer.length < 12) {
    return { valid: false };
  }

  // JPEG magic bytes: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, format: 'jpeg' };
  }

  // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, format: 'png' };
  }

  // WebP magic bytes: RIFF .... WEBP
  // bytes 0-3: 52 49 46 46 (RIFF)
  // bytes 8-11: 57 45 42 50 (WEBP)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { valid: true, format: 'webp' };
  }

  return { valid: false };
}
