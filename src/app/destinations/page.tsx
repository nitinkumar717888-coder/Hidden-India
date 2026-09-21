import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { destinationService } from '@/lib/services/destination-service';
import { Container } from '@/components/common/Container';
import { Section } from '@/components/common/Section';
import { FactBadge } from '@/components/common/FactBadge';
import { EmptyState } from '@/components/common/EmptyState';

export const metadata: Metadata = {
  title: 'All Discoveries — Hidden India',
  description:
    'Searchable directory of verified historical forts, ancient ruins, and unusual geological landmarks across India.',
  alternates: {
    canonical: 'https://hiddenindia.org/destinations',
  },
};

export const revalidate = 3600;

export default async function DestinationsIndexPage() {
  const publishedList = await destinationService.getPublished(50);

  return (
    <div className="destinations-index-page">
      <header className="page-header section-subtle">
        <Container>
          <p className="text-eyebrow">Verified Catalog</p>
          <h1 className="text-h1">All Discoveries</h1>
          <p className="text-lead" style={{ maxWidth: '680px', marginTop: '0.75rem' }}>
            Every destination in this catalog has been reviewed against archaeological surveys,
            institutional gazetteers, or historical documents.
          </p>
        </Container>
      </header>

      <Section>
        <Container>
          {publishedList.length === 0 ? (
            <EmptyState
              title="Editorial Verification in Progress"
              description="No destinations are currently published in the public catalog. Real records covering Punjab, Haryana, Himachal Pradesh, Chandigarh, and Delhi are being verified against official institutional archives."
              action={
                <Link href="/" className="btn btn-secondary">
                  &larr; Return to Homepage
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 grid-cols-2-sm grid-cols-3 gap-6">
              {publishedList.map((dest) => (
                <article key={dest.id} className="card destination-catalog-card">
                  <div className="card-body">
                    <div className="card-meta">
                      <span className="location-pill">
                        {dest.district}, {dest.state}
                      </span>
                      <FactBadge
                        label={dest.evidenceClassification.replace('_', ' ')}
                        variant="evidence"
                        evidenceType={dest.evidenceClassification}
                      />
                    </div>
                    <h2 className="card-title text-h3">
                      <Link href={`/destinations/${dest.slug}`} className="hover-link">
                        {dest.name}
                      </Link>
                    </h2>
                    <p className="card-desc text-small">{dest.shortDescription}</p>
                    <div className="card-footer">
                      <span className="visit-duration text-caption">
                        Duration: {dest.estimatedVisitDuration}
                      </span>
                      <Link href={`/destinations/${dest.slug}`} className="btn btn-ghost btn-sm">
                        Explore &rarr;
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
}
