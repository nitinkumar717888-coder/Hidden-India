'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FactBadge } from '../common/FactBadge';
import { EvidenceClassificationType } from '@/lib/types/enums';

export interface SavedItemData {
  savedAt: string;
  destination: {
    id: string;
    name: string;
    slug: string;
    state: string;
    district: string;
    locality: string | null;
    shortDescription: string;
    evidenceClassification: string;
    difficulty: string;
  };
  primaryImage: {
    imageUrl: string;
    altText: string;
  } | null;
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
}

interface SavedDestinationsClientProps {
  initialItems: SavedItemData[];
  isAuthenticated: boolean;
}

export const SavedDestinationsClient: React.FC<SavedDestinationsClientProps> = ({
  initialItems,
  isAuthenticated,
}) => {
  const [items, setItems] = useState<SavedItemData[]>(initialItems);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [migrationNotice, setMigrationNotice] = useState<string | null>(null);

  // If authenticated, migrate any anonymous bookmarks from local storage
  // If unauthenticated, fetch destination details for local storage IDs
  useEffect(() => {
    if (isAuthenticated) {
      try {
        const localIds: string[] = JSON.parse(
          localStorage.getItem('hidden_india_saved_destinations') || '[]'
        );
        if (localIds.length > 0) {
          fetch('/api/saved/local', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ destinationIds: localIds }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success && data.migratedCount > 0) {
                localStorage.removeItem('hidden_india_saved_destinations');
                setMigrationNotice(
                  `Successfully migrated ${data.migratedCount} saved discoveries to your account.`
                );
                window.location.reload();
              }
            })
            .catch(() => {});
        }
      } catch {
        // Ignore local storage parse errors
      }
    } else {
      const localIds: string[] = JSON.parse(
        localStorage.getItem('hidden_india_saved_destinations') || '[]'
      );
      if (localIds.length > 0 && items.length === 0) {
        fetch(`/api/saved/local?ids=${localIds.join(',')}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.items) {
              setItems(data.items);
            }
          })
          .catch(() => {});
      }
    }
  }, [isAuthenticated, items.length]);

  const handleRemove = async (destinationId: string) => {
    setIsRemoving(destinationId);

    if (isAuthenticated) {
      try {
        await fetch('/api/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destinationId, action: 'unsave' }),
        });
      } catch (err) {
        console.error('Failed to unsave:', err);
      }
    } else {
      // Remove from localStorage
      const localSaved: string[] = JSON.parse(
        localStorage.getItem('hidden_india_saved_destinations') || '[]'
      );
      const updated = localSaved.filter((id) => id !== destinationId);
      localStorage.setItem('hidden_india_saved_destinations', JSON.stringify(updated));
    }

    setItems((prev) => prev.filter((item) => item.destination.id !== destinationId));
    setIsRemoving(null);
  };

  if (items.length === 0) {
    return (
      <div className="saved-empty-box">
        <span className="empty-icon">🏛️</span>
        <h2 className="text-h3">You haven&apos;t saved any discoveries yet.</h2>
        <p className="text-muted" style={{ maxWidth: '480px', margin: '0.5rem 0 1.5rem' }}>
          Explore India&apos;s forgotten forts, ancient rock-cut caves, and sacred stepwells, and save them here for your next road trip.
        </p>
        <Link href="/destinations" className="btn btn-primary">
          Explore Hidden India
        </Link>
      </div>
    );
  }

  return (
    <div className="saved-destinations-layout">
      {migrationNotice && (
        <div
          className="saved-anon-banner"
          style={{ background: 'rgba(46, 125, 50, 0.1)', borderColor: 'var(--color-success)' }}
          role="status"
        >
          <span>✓ {migrationNotice}</span>
        </div>
      )}

      {!isAuthenticated && (
        <div className="saved-anon-banner" role="note">
          <span>
            🔒 <strong>Device Local Storage:</strong> You are viewing discoveries saved on this browser.
          </span>
          <Link href="/login" className="btn btn-sm btn-secondary">
            Sign In to Sync
          </Link>
        </div>
      )}

      <div className="saved-grid">
        {items.map(({ destination, primaryImage, categories, savedAt }) => {
          const location = [destination.locality, destination.district, destination.state]
            .filter(Boolean)
            .join(', ');

          return (
            <div key={destination.id} className="saved-card">
              <div className="saved-card-media">
                {primaryImage ? (
                  <Image
                    src={primaryImage.imageUrl}
                    alt={primaryImage.altText}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="saved-card-img"
                  />
                ) : (
                  <div className="saved-img-placeholder">
                    <span>🏛️</span>
                  </div>
                )}
                <div className="saved-date-tag">
                  Saved {new Date(savedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              <div className="saved-card-content">
                <div className="saved-card-badges">
                  <FactBadge
                    label={destination.evidenceClassification.replace('_', ' ')}
                    variant="evidence"
                    evidenceType={destination.evidenceClassification as EvidenceClassificationType}
                  />
                  {categories.slice(0, 2).map((cat) => (
                    <span key={cat.id} className="mini-cat-chip">
                      {cat.name}
                    </span>
                  ))}
                </div>

                <h3 className="saved-card-title">
                  <Link href={`/destinations/${destination.slug}`}>
                    {destination.name}
                  </Link>
                </h3>

                <p className="saved-card-location">
                  📍 {location}
                </p>

                <p className="saved-card-desc">
                  {destination.shortDescription}
                </p>

                <div className="saved-card-actions">
                  <Link
                    href={`/destinations/${destination.slug}`}
                    className="btn btn-sm btn-primary"
                  >
                    Open Place
                  </Link>

                  <button
                    type="button"
                    className="btn btn-sm btn-remove-saved"
                    onClick={() => handleRemove(destination.id)}
                    disabled={isRemoving === destination.id}
                  >
                    {isRemoving === destination.id ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
