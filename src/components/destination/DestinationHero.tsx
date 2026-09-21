import React from 'react';
import Image from 'next/image';
import { Destination, DestinationImage } from '@/lib/db/schema';
import { FactBadge } from '../common/FactBadge';
import { Container } from '../common/Container';
import { SaveDestinationButton } from './SaveDestinationButton';

interface DestinationHeroProps {
  destination: Destination;
  primaryImage?: DestinationImage | null;
  categories: { id: string; name: string; slug: string }[];
}

export const DestinationHero: React.FC<DestinationHeroProps> = ({
  destination,
  primaryImage,
  categories,
}) => {
  const locationString = [destination.locality, destination.district, destination.state]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="destination-hero">
      <Container size="wide">
        {/* Breadcrumb & Category Bar */}
        <div className="destination-breadcrumbs">
          <a href="/destinations" className="breadcrumb-link">
            Destinations
          </a>
          <span className="breadcrumb-separator">/</span>
          <a href={`/states/${destination.state.toLowerCase()}`} className="breadcrumb-link">
            {destination.state}
          </a>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{destination.name}</span>
        </div>

        <div className="destination-hero-grid">
          {/* Text Identity Column */}
          <div className="destination-hero-content">
            <div className="destination-badge-row">
              <FactBadge
                label={destination.evidenceClassification.replace('_', ' ')}
                variant="evidence"
                evidenceType={destination.evidenceClassification}
              />
              {categories.map((cat) => (
                <FactBadge key={cat.id} label={cat.name} variant="default" />
              ))}
            </div>

            <h1 className="destination-title text-display">{destination.name}</h1>
            <p className="destination-location">
              <svg
                className="location-pin-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{locationString}</span>
            </p>

            <p className="destination-short-desc text-lead">{destination.shortDescription}</p>

            <div className="destination-hero-actions">
              <SaveDestinationButton
                destinationId={destination.id}
                destinationName={destination.name}
              />

              <a href="#plan-visit" className="btn btn-primary">
                Plan Your Route
              </a>
            </div>
          </div>

          {/* Primary Visual Column */}
          <div className="destination-hero-media">
            {primaryImage ? (
              <div className="primary-image-wrapper">
                <Image
                  src={primaryImage.imageUrl}
                  alt={primaryImage.altText}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  className="primary-image"
                />
                {(primaryImage.credit || primaryImage.license) && (
                  <div className="image-attribution-overlay">
                    {primaryImage.credit && <span>Photo: {primaryImage.credit}</span>}
                    {primaryImage.license && <span> &bull; License: {primaryImage.license}</span>}
                  </div>
                )}
              </div>
            ) : (
              <div className="media-placeholder-state" role="img" aria-label="No verified archival photograph available yet">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p className="placeholder-note">
                  No verified archival photograph published yet.
                </p>
                <span className="placeholder-subnote">
                  Hidden India only publishes verified public-domain or attributed imagery.
                </span>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};
