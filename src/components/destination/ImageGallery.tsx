import React from 'react';
import Image from 'next/image';
import { DestinationImage } from '@/lib/db/schema';

interface ImageGalleryProps {
  images: DestinationImage[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  // Only show secondary/gallery images here (primary image is featured in the hero)
  const galleryItems = images.filter((img) => !img.isPrimary);

  if (galleryItems.length === 0) return null;

  return (
    <section className="destination-gallery-section" aria-label="Archival and Field Photographs">
      <h2 className="text-h3" style={{ marginBottom: '1.5rem' }}>
        Archival & Field Photographs
      </h2>

      <div className="gallery-grid">
        {galleryItems.map((img) => (
          <figure key={img.id} className="gallery-card">
            <div className="gallery-image-wrapper">
              <Image
                src={img.imageUrl}
                alt={img.altText}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="gallery-img"
              />
            </div>
            {(img.caption || img.credit || img.license) && (
              <figcaption className="gallery-caption text-caption">
                {img.caption && <p className="caption-text">{img.caption}</p>}
                <div className="caption-credit">
                  {img.credit && <span>Credit: {img.credit}</span>}
                  {img.license && <span> &bull; License: {img.license}</span>}
                </div>
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
};
