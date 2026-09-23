import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { collectionService } from '@/lib/services/collection-service';
import { Container } from '@/components/common/Container';
import { FactBadge } from '@/components/common/FactBadge';
import CollectionMap from '@/components/collections/CollectionMap';
import { AddToTripButton } from '@/components/collections/AddToTripButton';
import { EditorialStatus } from '@/lib/types/enums';

interface CollectionPageProps {
  params: { slug: string };
  searchParams: { preview?: string };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
  searchParams,
}: CollectionPageProps): Promise<Metadata> {
  const allowDraftPreview = searchParams.preview === 'true';
  const data = await collectionService.getBySlug(params.slug, allowDraftPreview);

  if (!data) {
    return {
      title: 'Collection Not Found | Hidden India',
    };
  }

  const { collection } = data;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hidden-india-lime.vercel.app';
  const canonicalUrl = `${baseUrl}/collections/${collection.slug}`;

  const isPublished = collection.editorialStatus === EditorialStatus.PUBLISHED;

  return {
    title: `${collection.title} — Curated Trail | Hidden India`,
    description: collection.shortDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: isPublished
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title: `${collection.title} | Hidden India`,
      description: collection.shortDescription,
      url: canonicalUrl,
      type: 'article',
      images: collection.coverImageUrl ? [{ url: collection.coverImageUrl }] : [],
    },
  };
}

export default async function CollectionDetailPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const allowDraftPreview = searchParams.preview === 'true';
  const data = await collectionService.getBySlug(params.slug, allowDraftPreview);

  if (!data) {
    notFound();
  }

  const { collection, waypoints } = data;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hidden-india-lime.vercel.app';

  // JSON-LD Structured Data
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${baseUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Collections',
        item: `${baseUrl}/collections`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: collection.title,
        item: `${baseUrl}/collections/${collection.slug}`,
      },
    ],
  };

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.title,
    description: collection.shortDescription,
    url: `${baseUrl}/collections/${collection.slug}`,
    hasPart: waypoints.map((w) => ({
      '@type': 'TouristAttraction',
      name: w.destination.name,
      url: `${baseUrl}/destinations/${w.destination.slug}`,
    })),
  };

  const mapWaypoints = waypoints.map((w) => ({
    sequence: w.sequence,
    destination: {
      name: w.destination.name,
      slug: w.destination.slug,
      latitude: w.destination.latitude,
      longitude: w.destination.longitude,
      locality: w.destination.locality,
      state: w.destination.state,
    },
  }));

  const tripDestinationOptions = waypoints.map((w) => ({
    id: w.destination.id,
    name: w.destination.name,
    sequence: w.sequence,
  }));

  return (
    <article className="collection-detail-page" style={{ paddingBottom: 'var(--space-16)' }}>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      {/* Draft Preview Warning Banner */}
      {collection.editorialStatus !== EditorialStatus.PUBLISHED && (
        <div
          className="banner banner-danger"
          style={{ textAlign: 'center', padding: 'var(--space-3)', fontWeight: 600 }}
        >
          [EDITORIAL PREVIEW] This collection is currently {collection.editorialStatus.toUpperCase()}.
          It is not visible to the public.
        </div>
      )}

      <Container size="normal">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb-nav" aria-label="Breadcrumb" style={{ marginBottom: 'var(--space-6)' }}>
          <ol className="breadcrumb-list text-small">
            <li className="breadcrumb-item">
              <Link href="/">Home</Link>
            </li>
            <li className="breadcrumb-separator">/</li>
            <li className="breadcrumb-item">
              <Link href="/collections">Collections</Link>
            </li>
            <li className="breadcrumb-separator">/</li>
            <li className="breadcrumb-item breadcrumb-current" aria-current="page">
              {collection.title}
            </li>
          </ol>
        </nav>

        {/* Collection Hero Header */}
        <header style={{ marginBottom: 'var(--space-8)' }}>
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-2)',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginBottom: 'var(--space-3)',
            }}
          >
            {collection.region && (
              <span className="badge badge-neutral text-caption">{collection.region}</span>
            )}
            {collection.theme && (
              <span className="badge badge-neutral text-caption" style={{ textTransform: 'capitalize' }}>
                {collection.theme}
              </span>
            )}
            <span className="badge badge-primary text-caption">
              {waypoints.length} stops
            </span>
          </div>

          <h1 className="text-h1" style={{ marginBottom: 'var(--space-4)', lineHeight: 1.2 }}>
            {collection.title}
          </h1>

          <p
            className="text-lead"
            style={{
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              marginBottom: 'var(--space-6)',
            }}
          >
            {collection.shortDescription}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-bg-subtle)',
              borderRadius: 'var(--radius-md)',
              gap: 'var(--space-4)',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <span className="text-caption" style={{ color: 'var(--color-text-muted)', display: 'block' }}>
                Curated Editorial Trail
              </span>
              <strong className="text-small">
                {waypoints.length} verified stops ready to add to your trip
              </strong>
            </div>

            <AddToTripButton
              collectionTitle={collection.title}
              collectionSlug={collection.slug}
              destinations={tripDestinationOptions}
            />
          </div>
        </header>

        {/* Editorial Narrative Section */}
        <section
          aria-labelledby="overview-heading"
          style={{
            marginBottom: 'var(--space-10)',
            paddingBottom: 'var(--space-8)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h2 id="overview-heading" className="text-h3" style={{ marginBottom: 'var(--space-3)' }}>
            About This Thematic Trail
          </h2>
          <div
            style={{
              fontSize: 'var(--font-size-body)',
              lineHeight: 1.7,
              color: 'var(--color-text-secondary)',
              whiteSpace: 'pre-line',
            }}
          >
            {collection.description}
          </div>
        </section>

        {/* Interactive Trail Map */}
        {mapWaypoints.length > 0 && (
          <section aria-labelledby="map-heading" style={{ marginBottom: 'var(--space-10)' }}>
            <h2 id="map-heading" className="text-h3" style={{ marginBottom: 'var(--space-3)' }}>
              Trail Overview Map
            </h2>
            <CollectionMap waypoints={mapWaypoints} />
          </section>
        )}

        {/* Ordered Trail Destinations */}
        <section aria-labelledby="stops-heading" style={{ marginBottom: 'var(--space-12)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 'var(--space-6)',
            }}
          >
            <h2 id="stops-heading" className="text-h2">
              Trail Stops in Sequence ({waypoints.length})
            </h2>
            <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
              Editorial ordering
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {waypoints.map((wp) => {
              const { destination, primaryImage, visitInfo, editorialNote, categories: cats } = wp;

              return (
                <div
                  key={destination.id}
                  className="card"
                  style={{
                    overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: primaryImage ? 'minmax(260px, 320px) 1fr' : '1fr',
                    gap: 0,
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  {/* Photo Column */}
                  {primaryImage && (
                    <div style={{ position: 'relative', minHeight: '220px', width: '100%' }}>
                      <Image
                        src={primaryImage.imageUrl}
                        alt={primaryImage.altText || destination.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 320px"
                        className="card-image"
                        style={{ objectFit: 'cover' }}
                        loading="lazy"
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: 'var(--space-3)',
                          left: 'var(--space-3)',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary, #b84c24)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '16px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
                          border: '2px solid #ffffff',
                        }}
                      >
                        {wp.sequence}
                      </div>
                    </div>
                  )}

                  {/* Content Column */}
                  <div
                    style={{
                      padding: 'var(--space-6)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: 'var(--space-2)',
                        }}
                      >
                        <span
                          className="text-caption"
                          style={{
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: 'var(--color-primary, #b84c24)',
                          }}
                        >
                          Stop {wp.sequence} • {destination.locality ? `${destination.locality}, ` : ''}
                          {destination.state}
                        </span>

                        <FactBadge
                          label={destination.evidenceClassification}
                          variant="evidence"
                          evidenceType={destination.evidenceClassification}
                        />
                      </div>

                      <h3 className="text-h3" style={{ marginBottom: 'var(--space-2)' }}>
                        <Link
                          href={`/destinations/${destination.slug}`}
                          style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          {destination.name}
                        </Link>
                      </h3>

                      <p
                        className="text-small"
                        style={{
                          color: 'var(--color-text-secondary)',
                          lineHeight: 1.5,
                          marginBottom: 'var(--space-4)',
                        }}
                      >
                        {destination.shortDescription}
                      </p>

                      {/* Contextual Editorial Note */}
                      {editorialNote && (
                        <div
                          style={{
                            backgroundColor: 'var(--color-bg-subtle)',
                            borderLeft: '3px solid var(--color-primary, #b84c24)',
                            padding: 'var(--space-3) var(--space-4)',
                            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                            marginBottom: 'var(--space-4)',
                          }}
                        >
                          <span
                            className="text-caption"
                            style={{
                              display: 'block',
                              fontWeight: 600,
                              color: 'var(--color-text-muted)',
                              marginBottom: '2px',
                            }}
                          >
                            Editorial Context:
                          </span>
                          <p
                            className="text-small"
                            style={{ fontStyle: 'italic', color: 'var(--color-text-primary)' }}
                          >
                            &ldquo;{editorialNote}&rdquo;
                          </p>
                        </div>
                      )}

                      {/* Practical Snapshot */}
                      {visitInfo && (
                        <div
                          className="text-caption"
                          style={{
                            color: 'var(--color-text-muted)',
                            display: 'flex',
                            gap: 'var(--space-4)',
                            flexWrap: 'wrap',
                            marginBottom: 'var(--space-4)',
                          }}
                        >
                          <span>
                            <strong>Entry:</strong> {visitInfo.entryFee}
                          </span>
                          <span>
                            <strong>Hours:</strong> {visitInfo.openingInformation}
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-2)' }}>
                      <Link
                        href={`/destinations/${destination.slug}`}
                        className="btn btn-small btn-secondary"
                      >
                        Explore Monument Details →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom Call-to-Action Bar */}
        <section
          style={{
            backgroundColor: 'var(--color-bg-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-8)',
            textAlign: 'center',
            marginBottom: 'var(--space-8)',
          }}
        >
          <h2 className="text-h3" style={{ marginBottom: 'var(--space-2)' }}>
            Ready to Travel this Route?
          </h2>
          <p
            className="text-muted"
            style={{ maxWidth: '600px', margin: '0 auto var(--space-6)', lineHeight: 1.6 }}
          >
            Add this entire curated sequence of {waypoints.length} destinations to your personal trip planner.
            You can customize waypoints, calculate driving fuel costs, and organize a day trip.
          </p>

          <AddToTripButton
            collectionTitle={collection.title}
            collectionSlug={collection.slug}
            destinations={tripDestinationOptions}
          />
        </section>
      </Container>
    </article>
  );
}
