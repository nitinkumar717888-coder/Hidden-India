import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { Section } from '@/components/common/Section';
import { Button } from '@/components/common/Button';
import { Disclaimer } from '@/components/common/Disclaimer';
import { DestinationCard } from '@/components/destination/DestinationCard';
import { EmptyState } from '@/components/common/EmptyState';
import { discoveryService } from '@/lib/services/discovery-service';

export const revalidate = 1800; // ISR revalidation every 30 minutes

export default async function HomePage() {
  const featuredDestinations = await discoveryService.getFeaturedDestinations(3);
  const featuredIds = featuredDestinations.map((f) => f.destination.id);

  const [categories, latestDestinationsRaw] = await Promise.all([
    discoveryService.getAllCategories(),
    discoveryService.getLatestDestinations(6, featuredIds),
  ]);

  // Strict deduplication: ensure no featured destination appears in latest discoveries
  const latestDestinations = latestDestinationsRaw
    .filter((d) => !featuredIds.includes(d.destination.id))
    .slice(0, 3);

  return (
    <>
      {/* 1. HERO SECTION */}
      <header className="hero-section">
        <Container size="normal">
          <div className="hero-content">
            <p className="text-eyebrow">Discover the India you weren&apos;t told about</p>
            <h1 className="text-display hero-title">Discover India&apos;s Hidden Places</h1>
            <p className="text-lead hero-subtitle">
              Forgotten forts, ancient ruins, unusual places and lost stories — researched, mapped, and ready to explore.
            </p>

            {/* Primary Search Form connected to /search */}
            <form action="/search" method="GET" className="hero-search-wrapper" role="search">
              <div className="search-bar">
                <input
                  type="search"
                  name="q"
                  placeholder="Search for a place, story, state, category, or destination..."
                  aria-label="Search hidden places, forts, ruins, waterfalls"
                  autoComplete="off"
                />
                <button type="submit" className="btn btn-primary" aria-label="Submit search">
                  Search
                </button>
              </div>
            </form>

            {/* Primary CTAs */}
            <div className="hero-actions">
              <Button href="/search" variant="primary" size="lg">
                Explore Hidden India
              </Button>
              <Button href="/map" variant="secondary" size="lg">
                Explore Map
              </Button>
            </div>
          </div>
        </Container>
      </header>

      {/* 2. EXPLORE BY CATEGORY */}
      <Section variant="subtle" id="categories">
        <Container>
          <div className="section-header">
            <div>
              <h2 className="text-h2">Explore by Category</h2>
              <p className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
                Categorized by architectural heritage, historical era, and geological rarity.
              </p>
            </div>
            <Link href="/search" className="text-small" style={{ color: 'var(--color-terracotta)', fontWeight: 600 }}>
              All categories &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2-sm grid-cols-4 gap-4" style={{ marginTop: '2rem' }}>
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="category-card"
              >
                <h3 className="category-title">{cat.name}</h3>
                <span className="category-status">Explore &rarr;</span>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* 3. NEAR YOU & LOCATION DISCLOSURE */}
      <Section id="near-you">
        <Container size="narrow">
          <div className="location-feature-card">
            <div className="location-feature-content">
              <span className="text-eyebrow">Precision Exploration</span>
              <h2 className="text-h2">Discover Places Near You</h2>
              <p className="text-body" style={{ marginTop: '0.75rem' }}>
                Calculate straight-line distances and explore destinations relative to your current
                location across Chandigarh, Punjab, Haryana, Himachal Pradesh, and Delhi.
              </p>

              <Disclaimer>
                <strong>Privacy Notice:</strong> We use your location only in your browser to
                estimate your route and travel cost. We never silently collect or permanently store
                your precise coordinates.
              </Disclaimer>

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Button href="/map" variant="secondary">
                  Open Interactive Map
                </Button>
                <Button href="/search" variant="ghost">
                  Search by city manually &rarr;
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 4. FEATURED DISCOVERIES (Real Published Database Records) */}
      <Section variant="subtle" id="featured">
        <Container>
          <div className="section-header">
            <div>
              <h2 className="text-h2">Featured Discoveries</h2>
              <p className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
                Hand-curated monuments with comprehensive archaeological documentation.
              </p>
            </div>
            <Link href="/search" className="text-small" style={{ color: 'var(--color-terracotta)', fontWeight: 600 }}>
              View all &rarr;
            </Link>
          </div>

          {featuredDestinations.length > 0 ? (
            <div className="grid grid-cols-1 grid-cols-2-sm grid-cols-3 gap-6" style={{ marginTop: '2rem' }}>
              {featuredDestinations.map(({ destination, categories, primaryImage }) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  categories={categories}
                  primaryImage={primaryImage}
                />
              ))}
            </div>
          ) : (
            <div style={{ marginTop: '2rem' }}>
              <EmptyState
                title="Curated Discoveries in Verification"
                description="Hidden India strictly avoids synthetic or unverified travel content. Featured monuments in Punjab, Haryana, Himachal Pradesh, Chandigarh, and Delhi are undergoing source verification before publication."
                action={
                  <Link href="/search" className="btn btn-secondary">
                    Browse All Catalog Discoveries &rarr;
                  </Link>
                }
              />
            </div>
          )}
        </Container>
      </Section>

      {/* 5. LATEST DISCOVERIES */}
      <Section id="latest">
        <Container>
          <div className="section-header">
            <div>
              <h2 className="text-h2">Latest Discoveries</h2>
              <p className="text-small" style={{ color: 'var(--color-text-secondary)' }}>
                Recently verified and published destination records.
              </p>
            </div>
            <Link href="/search" className="text-small" style={{ color: 'var(--color-terracotta)', fontWeight: 600 }}>
              Search directory &rarr;
            </Link>
          </div>

          {latestDestinations.length > 0 ? (
            <div className="grid grid-cols-1 grid-cols-2-sm grid-cols-3 gap-6" style={{ marginTop: '2rem' }}>
              {latestDestinations.map(({ destination, categories, primaryImage }) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  categories={categories}
                  primaryImage={primaryImage}
                />
              ))}
            </div>
          ) : (
            <div style={{ marginTop: '2rem' }}>
              <EmptyState
                title="No Public Records Published Yet"
                description="Destination entries must pass bibliographic citation checks and fact vs. legend classification before being published."
                action={
                  <Link href="/map" className="btn btn-secondary">
                    Explore Interactive Map &rarr;
                  </Link>
                }
              />
            </div>
          )}
        </Container>
      </Section>

      {/* 6. PLAN YOUR VISIT / TRIP ENGINE EXPLANATION */}
      <Section variant="subtle" id="trip-engine">
        <Container>
          <div className="grid grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-eyebrow">Practical Road Trip Engine</span>
              <h2 className="text-h2">Answer Every Question Before You Travel</h2>
              <p className="text-body" style={{ marginTop: '0.75rem', fontWeight: 600, color: 'var(--color-terracotta)', letterSpacing: '0.04em' }}>
                DISCOVER &rarr; PLAN &rarr; CALCULATE &rarr; NAVIGATE
              </p>
              <p className="text-body" style={{ marginTop: '0.5rem' }}>
                Most travel websites end at inspiration. Hidden India takes you from curiosity to
                your destination with practical road trip engineering:
              </p>

              <ul className="engine-feature-list" style={{ marginTop: '1.5rem' }}>
                <li>
                  <strong>Transparent Route Estimation:</strong> Driving duration and distance estimates based on verified road networks and terrain curvature.
                </li>
                <li>
                  <strong>Real Fuel Calculations:</strong> Petrol, Diesel, CNG, and EV consumption with state-verified tariffs.
                </li>
                <li>
                  <strong>Tolls & Verified Entry Fees:</strong> Up-to-date estimations with explicit verification timestamps.
                </li>
                <li>
                  <strong>Seamless Navigation:</strong> Deep-link directly into Google Maps directions with one tap.
                </li>
              </ul>

              <div style={{ marginTop: '2rem' }}>
                <Button href="/search" variant="primary">
                  Start Exploring
                </Button>
              </div>
            </div>

            <div className="calculator-preview-box">
              <div className="preview-header">
                <span className="text-label">Illustrative Trip Calculation</span>
                <span className="badge badge-default">Illustrative Example</span>
              </div>
              <div className="preview-row">
                <span>Sample Route</span>
                <strong>Chandigarh &rarr; Kalesar Colonial Red Iron Bridge</strong>
              </div>
              <div className="preview-row">
                <span>Round-Trip Distance</span>
                <span>~244 km (illustrative example)</span>
              </div>
              <div className="preview-row">
                <span>Vehicle & Efficiency</span>
                <span>Petrol Car &bull; 15 km/L</span>
              </div>
              <div className="preview-row">
                <span>Estimated Fuel</span>
                <span>~16.3 Litres</span>
              </div>
              <div className="preview-divider" />
              <div className="preview-row total-row">
                <span>Illustrative Total Estimate</span>
                <strong style={{ color: 'var(--color-terracotta)', fontSize: '1.25rem' }}>
                  ₹1,950*
                </strong>
              </div>
              <p className="preview-disclaimer">
                *Illustrative example for demonstration only. Based on indicative distance (~244 km round-trip), estimated average economy (15 km/L), and typical tolls. Exact calculations use verified coordinates, vehicle specs, and current fuel pricing in the Trip Calculator.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
