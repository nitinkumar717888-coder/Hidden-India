import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { collectionService } from '@/lib/services/collection-service';
import { Container } from '@/components/common/Container';
import { CollectionCard } from '@/components/collections/CollectionCard';

export const metadata: Metadata = {
  title: 'Curated Collections & Editorial Trails | Hidden India',
  description:
    'Thematic historical journeys, forgotten frontier forts, hydraulic stepwells, and ancient mountain monoliths across Northern India.',
  openGraph: {
    title: 'Curated Collections & Editorial Trails | Hidden India',
    description:
      'Thematic explorations and historical routes connecting verified heritage sites across Northern India.',
    type: 'website',
  },
};

export const revalidate = 3600; // 1 hour revalidation

export default async function CollectionsPage() {
  const collections = await collectionService.getPublishedCollections();

  return (
    <div className="collections-index-page" style={{ padding: 'var(--space-8) 0 var(--space-16)' }}>
      <Container size="wide">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb-nav" aria-label="Breadcrumb" style={{ marginBottom: 'var(--space-6)' }}>
          <ol className="breadcrumb-list text-small">
            <li className="breadcrumb-item">
              <Link href="/">Home</Link>
            </li>
            <li className="breadcrumb-separator">/</li>
            <li className="breadcrumb-item breadcrumb-current" aria-current="page">
              Collections
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header style={{ marginBottom: 'var(--space-10)', maxWidth: '800px' }}>
          <span
            className="badge badge-neutral"
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 600,
              marginBottom: 'var(--space-3)',
            }}
          >
            Editorial Trails
          </span>
          <h1 className="text-h1" style={{ marginBottom: 'var(--space-4)' }}>
            Curated Collections
          </h1>
          <p className="text-lead" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Thematic historical journeys connecting verified heritage sites across Northern India. Each
            collection groups monuments by meaningful regional, architectural, or historical context—ready
            to explore and add directly to your personalized road trip.
          </p>
        </header>

        {/* Collections Grid */}
        {collections.length === 0 ? (
          <div
            className="card"
            style={{ textAlign: 'center', padding: 'var(--space-12)' }}
          >
            <h2 className="text-h3" style={{ marginBottom: 'var(--space-2)' }}>
              New Trails in Research
            </h2>
            <p className="text-muted" style={{ maxWidth: '500px', margin: '0 auto var(--space-6)' }}>
              Our editorial team is currently researching and verifying primary sources for new thematic
              heritage trails. Check back soon.
            </p>
            <Link href="/destinations" className="btn btn-primary">
              Explore All Destinations →
            </Link>
          </div>
        ) : (
          <div className="destinations-grid">
            {collections.map((card) => (
              <CollectionCard key={card.collection.id} card={card} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
