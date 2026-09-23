import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/common/Container';

export const HomeHero: React.FC = () => {
  return (
    <section className="home-hero" aria-label="Introduction to Hidden India">
      {/* Background Cinematic Image with Atmospheric Scrim */}
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

      {/* Hero Content */}
      <Container size="normal" className="home-hero-content">
        {/* Cartographic Coordinates Badge */}
        <div className="home-hero-meta-badge" role="doc-subtitle">
          <span>29.9611° N • 76.8333° E</span>
          <span className="location-sep">/</span>
          <span>KURUKSHETRA, HARYANA</span>
        </div>

        {/* Large Editorial Headline */}
        <h1 className="home-hero-title">
          Discover the India you weren&apos;t told about.
        </h1>

        {/* Narrative Subtitle */}
        <p className="home-hero-subtitle">
          Forgotten forts, rock-cut monoliths, ancient ruins and lost stories — researched with academic
          citations and mapped for real journeys across Northern India.
        </p>

        {/* Primary Search Form connected to /search */}
        <form action="/search" method="GET" className="home-hero-search" role="search">
          <div className="search-bar">
            <input
              type="search"
              name="q"
              placeholder="Search for a fort, baoli, dynasty, or district..."
              aria-label="Search hidden places, forts, ruins, and stepwells"
              autoComplete="off"
            />
            <button type="submit" className="btn btn-primary" aria-label="Submit search">
              Search
            </button>
          </div>
        </form>

        {/* Dual Primary Actions */}
        <div className="home-hero-actions">
          <Link href="#storytelling" className="btn btn-hero-primary">
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
  );
};
