import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { discoveryService, REGIONAL_STATES } from '@/lib/services/discovery-service';
import { Container } from '@/components/common/Container';
import { DestinationCard } from '@/components/destination/DestinationCard';
import { EmptyState } from '@/components/common/EmptyState';

interface StatePageProps {
  params: { state: string };
  searchParams: { category?: string; page?: string };
}

export const revalidate = 3600;

export async function generateMetadata({ params }: StatePageProps): Promise<Metadata> {
  const stateMeta = REGIONAL_STATES[params.state.toLowerCase().trim()];
  if (!stateMeta) {
    return {
      title: 'State Portal Not Found | Hidden India',
      robots: { index: false, follow: false },
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hiddenindia.pages.dev';
  const title = `Hidden & Forgotten Places in ${stateMeta.name} — Hidden India`;
  const description = stateMeta.shortDesc;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/states/${stateMeta.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/states/${stateMeta.slug}`,
      siteName: 'Hidden India',
      locale: 'en_IN',
      type: 'website',
    },
  };
}

export default async function StatePortalPage({ params, searchParams }: StatePageProps) {
  const stateSlug = params.state.toLowerCase().trim();
  const stateMeta = REGIONAL_STATES[stateSlug];

  if (!stateMeta) {
    notFound();
  }

  const categorySlug = searchParams.category?.trim();
  const currentPage = parseInt(searchParams.page || '1', 10) || 1;

  const [searchResult, allCategories] = await Promise.all([
    discoveryService.searchDestinations({
      state: stateMeta.name,
      categorySlug,
      page: currentPage,
      pageSize: 12,
    }),
    discoveryService.getAllCategories(),
  ]);

  const { items, totalCount } = searchResult;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hiddenindia.pages.dev';
  const jsonLd = {
    '@context': 'https://schema.org',
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
        name: 'States & Regions',
        item: `${siteUrl}/explore`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: stateMeta.name,
        item: `${siteUrl}/states/${stateMeta.slug}`,
      },
    ],
  };

  return (
    <div className="state-portal-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="page-header section-subtle">
        <Container>
          <div className="destination-breadcrumbs">
            <Link href="/" className="breadcrumb-link">
              Home
            </Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">States</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{stateMeta.name}</span>
          </div>

          <p className="text-eyebrow">Regional Portal</p>
          <h1 className="text-h1">{stateMeta.name}</h1>
          <p className="text-lead" style={{ maxWidth: '680px', marginTop: '0.5rem' }}>
            {stateMeta.shortDesc}
          </p>

          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span className="badge badge-default">
              {totalCount} {totalCount === 1 ? 'Verified Discovery' : 'Verified Discoveries'}
            </span>
            <Link href={`/map?state=${encodeURIComponent(stateMeta.name)}`} className="btn btn-ghost btn-sm">
              View {stateMeta.name} on Map &rarr;
            </Link>
          </div>
        </Container>
      </header>

      {/* Category filter pills for this state */}
      <section className="state-filters-bar section-subtle" style={{ padding: '0.75rem 0' }}>
        <Container>
          <div className="flex items-center gap-2" style={{ overflowX: 'auto', paddingBottom: '0.25rem' }}>
            <span className="text-label" style={{ marginRight: '0.5rem', whiteSpace: 'nowrap' }}>
              Filter by:
            </span>
            <Link
              href={`/states/${stateMeta.slug}`}
              className={`btn btn-sm ${!categorySlug ? 'btn-primary' : 'btn-secondary'}`}
            >
              All {stateMeta.name}
            </Link>
            {allCategories.slice(0, 8).map((cat) => {
              const isSelected = categorySlug === cat.slug;
              return (
                <Link
                  key={cat.id}
                  href={`/states/${stateMeta.slug}?category=${cat.slug}`}
                  className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <main style={{ padding: 'var(--space-12) 0' }}>
        <Container>
          {items.length === 0 ? (
            <EmptyState
              title={`No Published Discoveries for ${stateMeta.name} in this Filter`}
              description={`We do not fabricate travel listings. Historical and archaeological sites in ${stateMeta.name} are actively undergoing bibliographic verification.`}
              action={
                <Link href={`/states/${stateMeta.slug}`} className="btn btn-secondary">
                  View All {stateMeta.name} Discoveries &rarr;
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 grid-cols-2-sm grid-cols-3 gap-6">
              {items.map(({ destination, categories, primaryImage }) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  categories={categories}
                  primaryImage={primaryImage}
                />
              ))}
            </div>
          )}
        </Container>
      </main>
    </div>
  );
}
