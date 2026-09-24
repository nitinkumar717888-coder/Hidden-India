import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/common/Container';
import { discoveryService } from '@/lib/services/discovery-service';
import { collectionService } from '@/lib/services/collection-service';
import { CuriosityPathsSection } from '@/components/home/CuriosityPathsSection';
import { LookCloserSection } from '@/components/home/LookCloserSection';
import { DiscoveryReelSection } from '@/components/home/DiscoveryReelSection';
import { KnownUnknownSection } from '@/components/home/KnownUnknownSection';
import { ExpeditionsSection } from '@/components/home/ExpeditionsSection';
import { HomeMapSection } from '@/components/home/HomeMapSection';
import { StoriesFromIndiaSection } from '@/components/home/StoriesFromIndiaSection';
import { TripPlanningSection } from '@/components/home/TripPlanningSection';
import { FinalCtaSection } from '@/components/home/FinalCtaSection';
import { PageShell } from '@/components/common/PageShell';

export const revalidate = 1800; // ISR revalidation every 30 minutes

export default async function HomePage() {
  // Fetch real published destinations & collections
  const featuredDestinations = await discoveryService.getFeaturedDestinations(3);
  const featuredIds = featuredDestinations.map((f) => f.destination.id);

  const [mapMarkers, collections, latestDestinationsRaw] = await Promise.all([
    discoveryService.getMapDestinations(),
    collectionService.getPublishedCollections(),
    discoveryService.getLatestDestinations(6, featuredIds),
  ]);

  // Strict deduplication: ensure no featured destination appears in latest discoveries
  const latestDestinations = latestDestinationsRaw
    .filter((d) => !featuredIds.includes(d.destination.id))
    .slice(0, 3);

  return (
    <PageShell>
      {/* =====================================================================
          01. CINEMATIC OPENING HERO (Phase 2)
          ===================================================================== */}
      <section className="home-hero" aria-label="Introduction to Hidden India">
        <div className="home-hero-bg" aria-hidden="true">
          <Image
            src="https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?auto=format&fit=crop&w=2000&q=85"
            alt="Atmospheric view of historical Indian architecture at Kurukshetra"
            fill
            priority
            sizes="100vw"
            className="home-hero-bg-img"
          />
          <div className="home-hero-scrim" />
          <div className="home-hero-cartography-ticks" />
        </div>

        <Container size="normal" className="home-hero-content">
          <div className="home-hero-meta-badge" role="doc-subtitle">
            <span>29.9611° N • 76.8333° E</span>
            <span className="location-sep">/</span>
            <span>KURUKSHETRA, HARYANA</span>
          </div>

          <p className="text-eyebrow" style={{ color: 'var(--color-ochre)', letterSpacing: '0.12em', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
            Discover the India you weren&apos;t told about
          </p>

          <h1 className="home-hero-title">
            Discover India&apos;s Hidden Places
          </h1>

          <p className="home-hero-subtitle">
            Forgotten forts, ancient ruins, unusual places and lost stories — researched, mapped, and ready to explore.
          </p>

          {/* Primary Search Form connected to /search */}
          <form action="/search" method="GET" className="home-hero-search" role="search">
            <div className="search-bar">
              <input
                type="search"
                name="q"
                placeholder="Search for a place, story, state, category, or destination..."
                aria-label="Search hidden places, forts, ruins, and stepwells"
                autoComplete="off"
              />
              <button type="submit" className="btn btn-primary" aria-label="Submit search">
                Search
              </button>
            </div>
          </form>

          {/* Dual Exploration Actions */}
          <div className="home-hero-actions">
            <Link href="#curiosity" className="btn btn-hero-primary">
              Start Discovering &darr;
            </Link>
            <Link href="#discovery-map" className="btn btn-hero-secondary">
              Open Interactive Map
            </Link>
          </div>

          {/* Field Journal Scroll Prompt */}
          <div className="home-hero-footer-prompt" aria-hidden="true">
            <span>Field Journal • Scroll to Explore</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </Container>
      </section>

      {/* =====================================================================
          02. WHAT ARE YOU CURIOUS ABOUT? (Phase 4: Signature Discovery Paths)
          ===================================================================== */}
      <CuriosityPathsSection />

      {/* =====================================================================
          03. LOOK CLOSER (Phase 5: Cinematic Destination Reveal)
          ===================================================================== */}
      <LookCloserSection />

      {/* =====================================================================
          04. DISCOVERY REEL (Phase 6: Multi-Destination Sequence)
          ===================================================================== */}
      <DiscoveryReelSection />

      {/* =====================================================================
          05. YOU KNOW THE PLACE. NOW LOOK CLOSER. (Phase 7: Known → Unknown)
          ===================================================================== */}
      <KnownUnknownSection />

      {/* =====================================================================
          06. FOLLOW A STORY (Phase 8: Interactive Collections / Trails)
          ===================================================================== */}
      <ExpeditionsSection collections={collections} />

      {/* =====================================================================
          07. THERE'S A LOT MORE OUT THERE. (Phase 9: Interactive Map)
          ===================================================================== */}
      <HomeMapSection markers={mapMarkers} />

      {/* =====================================================================
          08. STORIES FROM INDIA (Phase 10: Editorial Field Dispatches)
          ===================================================================== */}
      <StoriesFromIndiaSection />

      {/* =====================================================================
          09. FOUND SOMEWHERE WORTH GOING? (Phase 11: Trip Planner Engine)
          ===================================================================== */}
      <section id="trip-engine" className="trip-planner-section" aria-label="Practical Road Trip Planning Engine">
        <Container size="normal">
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto var(--space-8)' }}>
            <span className="text-eyebrow">Practical Road Trip Engine</span>
            <h2 className="text-h1">Answer Every Question Before You Travel</h2>
            <p className="text-body" style={{ marginTop: '0.75rem', fontWeight: 600, color: 'var(--color-terracotta)', letterSpacing: '0.04em' }}>
              DISCOVER &rarr; PLAN &rarr; CALCULATE &rarr; NAVIGATE
            </p>
            <p className="text-lead" style={{ marginTop: '0.5rem' }}>
              Most travel websites end at inspiration. Hidden India takes you from curiosity to
              your destination with practical road trip engineering: verified road networks, real fuel calculations,
              and direct turn-by-turn navigation.
            </p>
          </div>

          {/* Interactive Calculator Component */}
          <TripPlanningSection />

          {/* Reference Illustrative Calculation Card (Preserving Exact Historical Benchmark) */}
          <div style={{ marginTop: 'var(--space-10)', display: 'none' }} aria-hidden="true">
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
              <div className="preview-row total-row">
                <span>Illustrative Total Estimate</span>
                <strong>₹1,950*</strong>
              </div>
              <p className="preview-disclaimer">
                *Illustrative example for demonstration only. Based on indicative distance (~244 km round-trip), estimated average economy (15 km/L), and typical tolls.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================================
          10. THE MAP IS BIGGER THAN YOU THINK. (Phase 13: Final Emotional CTA)
          ===================================================================== */}
      <FinalCtaSection />
    </PageShell>
  );
}
