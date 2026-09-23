import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/common/Container';
import type { EnrichedCollectionCard } from '@/lib/services/collection-service';

interface ExpeditionsSectionProps {
  collections: EnrichedCollectionCard[];
}

export const ExpeditionsSection: React.FC<ExpeditionsSectionProps> = ({ collections }) => {
  return (
    <section id="expeditions" className="expeditions-section" aria-label="Curated Travel Expeditions">
      <Container size="normal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="text-eyebrow">Thematic Itineraries</span>
            <h2 className="text-h1">Follow the Field Trails</h2>
            <p className="text-lead" style={{ marginTop: '0.5rem', maxWidth: '640px' }}>
              Connected regional circuits linking ancient fortress ramparts, medieval stepwells, and Himalayan monoliths into coherent multi-day expeditions.
            </p>
          </div>
          <Link
            href="/collections"
            className="text-small"
            style={{ color: 'var(--color-terracotta)', fontWeight: 600 }}
          >
            View all 5 curated trails &rarr;
          </Link>
        </div>

        <div className="expeditions-grid">
          {collections.map((item, index) => {
            const trailNumber = String(index + 1).padStart(2, '0');
            const { collection, destinationCount, destinationPreviews } = item;

            return (
              <article key={collection.id} className="expedition-card" aria-label={`Trail ${trailNumber}: ${collection.title}`}>
                {/* Visual Imagery with Badges */}
                <div className="expedition-img-wrap">
                  {collection.coverImageUrl ? (
                    <Image
                      src={collection.coverImageUrl}
                      alt={collection.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw"
                      loading="lazy"
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'var(--color-bg-dark)' }} />
                  )}
                  <span className="expedition-trail-badge">
                    TRAIL {trailNumber}
                  </span>
                  <span className="expedition-stops-badge">
                    {destinationCount} Waypoints
                  </span>
                </div>

                {/* Trail Content */}
                <div className="expedition-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span className="text-caption" style={{ color: 'var(--color-ochre)', fontWeight: 600, textTransform: 'uppercase' }}>
                      {collection.region || 'Northern India'}
                    </span>
                    <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
                      {collection.theme}
                    </span>
                  </div>

                  <h3 className="text-h3" style={{ fontSize: '1.25rem', marginBottom: '0.5rem', lineHeight: 1.25 }}>
                    <Link href={`/collections/${collection.slug}`} className="hover-link">
                      {collection.title}
                    </Link>
                  </h3>

                  <p className="text-small" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.55, marginBottom: '0.75rem' }}>
                    {collection.shortDescription}
                  </p>

                  {/* Waypoint Sequence List */}
                  {destinationPreviews.length > 0 && (
                    <ul className="expedition-waypoints-list">
                      {destinationPreviews.map((wp, wpIdx) => (
                        <li key={wpIdx} className="expedition-waypoint-item">
                          <span className="expedition-waypoint-bullet" />
                          <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                            {wp.name}
                          </span>
                          <span style={{ color: 'var(--color-text-muted)', marginLeft: 'auto', fontSize: '0.7rem' }}>
                            {wp.locality || wp.state}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                    <Link
                      href={`/collections/${collection.slug}`}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', justifyContent: 'space-between' }}
                    >
                      <span>Follow the Trail</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
