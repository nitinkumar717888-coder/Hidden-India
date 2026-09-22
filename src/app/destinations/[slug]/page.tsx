import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { destinationService } from '@/lib/services/destination-service';
import { DestinationHero } from '@/components/destination/DestinationHero';
import { QuickFacts } from '@/components/destination/QuickFacts';
import { EvidenceSection } from '@/components/destination/EvidenceSection';
import { VisitInfoCard } from '@/components/destination/VisitInfoCard';
import { TripCalculator } from '@/components/calculator/TripCalculator';
import { SourcesList } from '@/components/destination/SourcesList';
import { ImageGallery } from '@/components/destination/ImageGallery';
import { Container } from '@/components/common/Container';
import { EditorialStatus } from '@/lib/types/enums';

interface PageProps {
  params: { slug: string };
  searchParams: { preview?: string; token?: string };
}

// Revalidate published destination pages every 24 hours (ISR)
export const revalidate = 86400;

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const isPreview = searchParams.preview === 'true';
  const record = await destinationService.getBySlug(params.slug, isPreview);

  if (!record) {
    return {
      title: 'Destination Not Found | Hidden India',
      robots: { index: false, follow: false },
    };
  }

  const { destination, images } = record;
  const primaryImg = images.find((i) => i.isPrimary) || images[0];
  const isPublic = destination.editorialStatus === EditorialStatus.PUBLISHED;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hiddenindia.pages.dev';
  const title = `${destination.name}, ${destination.state} — Hidden India`;
  const description = destination.shortDescription;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/destinations/${destination.slug}`,
    },
    robots: {
      index: isPublic,
      follow: isPublic,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/destinations/${destination.slug}`,
      siteName: 'Hidden India',
      locale: 'en_IN',
      type: 'article',
      images: primaryImg
        ? [
            {
              url: primaryImg.imageUrl,
              alt: primaryImg.altText,
              width: 1200,
              height: 675,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: primaryImg ? [primaryImg.imageUrl] : [],
    },
  };
}

export default async function DestinationPage({ params, searchParams }: PageProps) {
  const isPreview = searchParams.preview === 'true';
  const record = await destinationService.getBySlug(params.slug, isPreview);

  // If no record found or if draft without preview authorization, return 404
  if (!record) {
    notFound();
  }

  const { destination, categories, visitInfo, sources, evidenceItems, images } = record;
  const primaryImage = images.find((i) => i.isPrimary) || images[0] || null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hiddenindia.pages.dev';

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Destinations',
            item: `${siteUrl}/destinations`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: destination.state,
            item: `${siteUrl}/states/${destination.state.toLowerCase()}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: destination.name,
            item: `${siteUrl}/destinations/${destination.slug}`,
          },
        ],
      },
      {
        '@type': 'TouristAttraction',
        name: destination.name,
        description: destination.shortDescription,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: destination.latitude,
          longitude: destination.longitude,
        },
        publicAccess: true,
        isAccessibleForFree: visitInfo?.feeType === 'free',
        ...(primaryImage ? { image: primaryImage.imageUrl } : {}),
      },
    ],
  };

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Non-published Draft Notice Bar (for editorial preview mode) */}
      {destination.editorialStatus !== EditorialStatus.PUBLISHED && (
        <div className="admin-preview-notice-bar" role="alert">
          <Container size="wide">
            <span>
              <strong>EDITORIAL PREVIEW MODE:</strong> This destination is currently in{' '}
              <strong style={{ textTransform: 'uppercase' }}>{destination.editorialStatus}</strong>{' '}
              status. It is not publicly indexed.
            </span>
          </Container>
        </div>
      )}

      {/* 1. Hero Identity & Visuals */}
      <DestinationHero
        destination={destination}
        primaryImage={primaryImage}
        categories={categories}
      />

      {/* Main Content Body */}
      <div className="destination-body-layout">
        <Container size="normal">
          {/* 2. Verified Quick Facts */}
          <QuickFacts destination={destination} visitInfo={visitInfo} />

          {/* 3. The Story & Evidence (What We Know vs Local Tradition) */}
          <EvidenceSection
            longDescription={destination.longDescription}
            evidenceItems={evidenceItems}
          />

          {/* 4. Practical Visit & Access Information */}
          <VisitInfoCard visitInfo={visitInfo} />

          {/* 4b. Practical Trip & Fuel Calculation Engine */}
          <TripCalculator
            destinationName={destination.name}
            destinationCoordinates={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            destinationState={destination.state}
            visitInfo={visitInfo}
          />

          {/* 5. Photographic Gallery (Attributed only) */}
          <ImageGallery images={images} />

          {/* 6. Strict Bibliographic Sources */}
          <SourcesList sources={sources} />
        </Container>
      </div>
    </>
  );
}
