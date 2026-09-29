'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ProductImageItem } from '@/types';

interface ProductGalleryProps {
  images: ProductImageItem[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState<string>(
    images.find((i) => i.isPrimary)?.url || images[0]?.url || ''
  );
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const mainImageSrc = failedImages[selectedImage] ? '/placeholder-garment.svg' : selectedImage;

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[600px] scrollbar-none pb-2 md:pb-0">
          {images.map((img, idx) => {
            const thumbSrc = failedImages[img.url] ? '/placeholder-garment.svg' : img.url;
            return (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setSelectedImage(img.url)}
                className={`relative w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImage === img.url
                    ? 'border-amber-700 shadow-sm'
                    : 'border-transparent hover:border-neutral-300 opacity-75 hover:opacity-100'
                }`}
              >
                <Image
                  src={thumbSrc}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  unoptimized
                  onError={() => setFailedImages((prev) => ({ ...prev, [img.url]: true }))}
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Main High-Res Image Display */}
      <div className="relative aspect-[3/4] w-full flex-1 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-150 shadow-sm">
        {selectedImage ? (
          <Image
            src={mainImageSrc}
            alt={productName}
            fill
            priority
            unoptimized
            onError={() => setFailedImages((prev) => ({ ...prev, [selectedImage]: true }))}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-neutral-400">
            No image available
          </div>
        )}
      </div>
    </div>
  );
};
