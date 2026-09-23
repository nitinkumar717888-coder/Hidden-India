import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { discoveryService } from '@/lib/services/discovery-service';
import { Container } from '@/components/common/Container';
import { DestinationCard } from '@/components/destination/DestinationCard';
import { EmptyState } from '@/components/common/EmptyState';

interface CategoryPageProps {
  params: { category: string };
  searchParams: { page?: string };
}

export const revalidate = 3600;

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await discoveryService.getCategoryBySlug(params.category);
  if (!category) {
    return {
      title: 'Category Not Found | Hidden India',
      robots: { index: false, follow: false },
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hidden-india-lime.vercel.app';
  const title = `${category.name} in India — Hidden & Forgotten Discoveries`;
  const description =
    category.description ||
    `Verified database of ${category.name.toLowerCase()} monuments, architectural remains, and sites across Northern India.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/categories/${category.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/categories/${category.slug}`,
      siteName: 'Hidden India',
      locale: 'en_IN',
      type: 'website',
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const categorySlug = params.category.toLowerCase().trim();
  const currentPage = parseInt(searchParams.page || '1', 10) || 1;

  const [category, searchResult, allCategories] = await Promise.all([
    discoveryService.getCategoryBySlug(categorySlug),
    discoveryService.getDestinationsByCategory(categorySlug, currentPage, 12),
    discoveryService.getAllCategories(),
  ]);

  if (!category) {
    notFound();
  }

  const { items, totalCount, totalPages } = searchResult;
  const relatedCategories = allCategories
    .filter((c) => c.slug !== category.slug)
    .slice(0, 6);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hidden-india-lime.vercel.app';
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
        name: 'Categories',
        item: `${siteUrl}/explore`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: `${siteUrl}/categories/${category.slug}`,
      },
    ],
  };

  return (
    <div className="category-portal-page">
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
            <span className="breadcrumb-current">Categories</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{category.name}</span>
          </div>

          <p className="text-eyebrow">Category Archive</p>
          <h1 className="text-h1">{category.name}</h1>
          {category.description && (
            <p className="text-lead" style={{ maxWidth: '680px', marginTop: '0.5rem' }}>
              {category.description}
            </p>
          )}

          <div style={{ marginTop: '1rem' }}>
            <span className="badge badge-default">
              {totalCount} {totalCount === 1 ? 'Published Record' : 'Published Records'}
            </span>
          </div>
        </Container>
      </header>

      <main className="category-main-content" style={{ padding: 'var(--space-12) 0' }}>
        <Container>
          {items.length === 0 ? (
            <EmptyState
              title={`No Published ${category.name} Sites Yet`}
              description={`We do not fabricate entries. Records in the ${category.name} category are currently undergoing archaeological and source verification.`}
              action={
                <Link href="/search" className="btn btn-secondary">
                  Browse All Discoveries &rarr;
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

          {/* Related Categories */}
          {relatedCategories.length > 0 && (
            <div className="related-categories-section" style={{ marginTop: '4rem' }}>
              <h2 className="text-h4" style={{ marginBottom: '1rem' }}>
                Related Categories
              </h2>
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {relatedCategories.map((rc) => (
                  <Link
                    key={rc.id}
                    href={`/categories/${rc.slug}`}
                    className="btn btn-secondary btn-sm"
                  >
                    {rc.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Container>
      </main>
    </div>
  );
}
