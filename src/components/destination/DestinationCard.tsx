import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Destination, Category, DestinationImage } from '@/lib/db/schema';
import { FactBadge } from '../common/FactBadge';

export interface DestinationCardProps {
  destination: Destination;
  categories?: Category[];
  primaryImage?: DestinationImage | null;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  categories = [],
  primaryImage,
}) => {
  const locationString = [destination.locality, destination.district, destination.state]
    .filter(Boolean)
    .join(', ');

  return (
    <article className="card destination-discovery-card" aria-label={destination.name}>
      {/* Media Aspect */}
      <Link href={`/destinations/${destination.slug}`} className="discovery-card-media-link" tabIndex={-1}>
        {primaryImage ? (
          <div className="discovery-card-image-box">
            <Image
              src={primaryImage.imageUrl}
              alt={primaryImage.altText || destination.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="discovery-card-img"
            />
          </div>
        ) : (
          <div className="discovery-card-placeholder-box">
            <span className="placeholder-icon">🏛️</span>
            <span className="placeholder-tag">Archival Record</span>
          </div>
        )}
      </Link>

      {/* Card Content Body */}
      <div className="card-body discovery-card-body">
        <div className="card-meta discovery-card-meta">
          <span className="location-tag">{locationString}</span>
          <FactBadge
            label={destination.evidenceClassification.replace('_', ' ')}
            variant="evidence"
            evidenceType={destination.evidenceClassification}
          />
        </div>

        <h3 className="card-title text-h4">
          <Link href={`/destinations/${destination.slug}`} className="hover-link">
            {destination.name}
          </Link>
        </h3>

        <p className="card-desc text-small">{destination.shortDescription}</p>

        {/* Categories Bar */}
        {categories.length > 0 && (
          <div className="discovery-card-categories">
            {categories.slice(0, 3).map((cat) => (
              <span key={cat.id} className="category-mini-pill">
                {cat.name}
              </span>
            ))}
          </div>
        )}

        <div className="card-footer discovery-card-footer">
          <span className="duration-tag text-caption">
            {destination.estimatedVisitDuration} &bull; {destination.difficulty}
          </span>
          <Link href={`/destinations/${destination.slug}`} className="btn btn-ghost btn-sm">
            Explore &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
};
