import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { EnrichedCollectionCard } from '@/lib/services/collection-service';

interface CollectionCardProps {
  card: EnrichedCollectionCard;
}

export function CollectionCard({ card }: CollectionCardProps) {
  const { collection, destinationCount, destinationPreviews } = card;

  return (
    <article className="destination-card card">
      <Link href={`/collections/${collection.slug}`} className="card-link" aria-label={collection.title}>
        <div className="card-image-wrapper">
          {collection.coverImageUrl ? (
            <Image
              src={collection.coverImageUrl}
              alt={collection.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="card-image"
              loading="lazy"
            />
          ) : (
            <div
              className="card-image-placeholder"
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'var(--color-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-muted)',
              }}
            >
              Curated Trail
            </div>
          )}
          <span className="duration-tag text-caption" style={{ top: 'var(--space-3)', right: 'var(--space-3)' }}>
            {destinationCount} stops
          </span>
        </div>

        <div className="card-content">
          <div className="card-meta">
            {collection.region && (
              <span className="card-location text-caption">{collection.region}</span>
            )}
            {collection.theme && (
              <span
                className="badge badge-neutral text-caption"
                style={{ marginLeft: 'auto', textTransform: 'capitalize' }}
              >
                {collection.theme}
              </span>
            )}
          </div>

          <h3 className="card-title text-h4">{collection.title}</h3>
          <p className="card-description text-small">{collection.shortDescription}</p>

          {destinationPreviews.length > 0 && (
            <div
              style={{
                marginTop: 'var(--space-3)',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <span
                className="text-caption"
                style={{
                  color: 'var(--color-text-muted)',
                  display: 'block',
                  marginBottom: 'var(--space-1)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Featured Stops:
              </span>
              <p
                className="text-caption"
                style={{
                  color: 'var(--color-text-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {destinationPreviews.map((d) => d.name).join(' • ')}
              </p>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
