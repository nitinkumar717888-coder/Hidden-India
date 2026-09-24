'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface HeroDestination {
  id: string;
  number: string;
  name: string;
  shortName: string;
  slug: string;
  location: string;
  state: string;
  era: string;
  classification: 'DOCUMENTED' | 'LOCAL_TRADITION' | 'DISPUTED';
  shortDescription: string;
  imageUrl: string;
  imageAlt: string;
}

export const HERO_DESTINATIONS: HeroDestination[] = [
  {
    id: 'qila-mubarak',
    number: '01',
    name: 'Qila Mubarak',
    shortName: 'QILA MUBARAK',
    slug: 'qila-mubarak-bathinda',
    location: 'Bathinda, Punjab',
    state: 'Punjab',
    era: '1st–3rd CE & 1240 CE',
    classification: 'DOCUMENTED',
    shortDescription:
      'India’s oldest surviving brick fortress, dating back to the Kushan era, and the 1240 CE prison of Delhi’s first female monarch, Razia Sultana.',
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=2000&q=85',
    imageAlt: 'Monumental ancient burnt brick ramparts and bastions of Qila Mubarak in Bathinda, Punjab',
  },
  {
    id: 'masrur-temples',
    number: '02',
    name: 'Masrur Rock-Cut Temples',
    shortName: 'MASRUR',
    slug: 'masrur-rock-cut-temples-kangra',
    location: 'Kangra, Himachal Pradesh',
    state: 'Himachal Pradesh',
    era: '8th Century CE',
    classification: 'DOCUMENTED',
    shortDescription:
      'Fifteen monolithic rock-cut shrines carved directly from a living sandstone ridge overlooking the snow-capped Dhauladhars.',
    imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=2000&q=85',
    imageAlt: '8th-century monolithic rock-cut shrines reflected in the sacred water tank at Masrur, Himachal Pradesh',
  },
  {
    id: 'dagshai-jail',
    number: '03',
    name: 'Dagshai Heritage Jail',
    shortName: 'DAGSHAI',
    slug: 'dagshai-heritage-jail-catacombs',
    location: 'Solan, Himachal Pradesh',
    state: 'Himachal Pradesh',
    era: '1847–1920 CE',
    classification: 'DOCUMENTED',
    shortDescription:
      'An 1847 British colonial military prison with 54 windowless disciplinary cells and subterranean solitary catacombs.',
    imageUrl: 'https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?auto=format&fit=crop&w=2000&q=85',
    imageAlt: 'Colonial stone cellular jail block and arched passageway at Dagshai, Himachal Pradesh',
  },
  {
    id: 'gondhla-fort',
    number: '04',
    name: 'Gondhla Tower Fort',
    shortName: 'GONDHLA',
    slug: 'gondhla-tower-fort-lahaul',
    location: 'Lahaul, Himachal Pradesh',
    state: 'Himachal Pradesh',
    era: 'c. 1700 CE',
    classification: 'DOCUMENTED',
    shortDescription:
      'An extraordinary eight-storey timber-laced tower fortress built by the local Thakurs of Lahaul along the Chandra river.',
    imageUrl: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=2000&q=85',
    imageAlt: 'Historic eight-storey timber and stone fortified tower in Lahaul mountain valley',
  },
  {
    id: 'bhima-devi',
    number: '05',
    name: 'Bhima Devi Temple Complex',
    shortName: 'BHIMA DEVI',
    slug: 'bhima-devi-temple-pinjore',
    location: 'Pinjore, Haryana',
    state: 'Haryana',
    era: '8th–11th Century CE',
    classification: 'DOCUMENTED',
    shortDescription:
      'The ‘Khajuraho of North India’—an 8th–11th century Gurjara-Pratihara temple complex ruins and open-air sculpture museum.',
    imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=2000&q=85',
    imageAlt: 'Medieval carved sandstone temple ruins and sculpture museum at Bhima Devi, Haryana',
  },
];

const AUTOPLAY_DURATION = 7000; // 7 seconds per destination

export const CinematicHero: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeDest = HERO_DESTINATIONS[activeIndex];
  const totalCount = HERO_DESTINATIONS.length;

  const goToDestination = useCallback(
    (index: number) => {
      if (index === activeIndex || isTransitioning) return;
      setPrevIndex(activeIndex);
      setActiveIndex(index);
      setIsTransitioning(true);

      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
        setPrevIndex(null);
      }, 700);
    },
    [activeIndex, isTransitioning]
  );

  const handleNext = useCallback(() => {
    goToDestination((activeIndex + 1) % totalCount);
  }, [activeIndex, totalCount, goToDestination]);

  const handlePrev = useCallback(() => {
    goToDestination((activeIndex - 1 + totalCount) % totalCount);
  }, [activeIndex, totalCount, goToDestination]);

  // Autoplay timer
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, AUTOPLAY_DURATION);

    return () => clearInterval(timer);
  }, [isPaused, handleNext]);

  // Pause autoplay when browser tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    }
  };

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const diffY = touchStartYRef.current - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const progressPercent = ((activeIndex + 1) / totalCount) * 100;

  return (
    <section
      className="hero-cinematic-stage"
      aria-label="Documented Indian Heritage Discovery Hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      role="region"
    >
      {/* Screen reader live announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Showing documented destination {activeDest.number} of {totalCount}: {activeDest.name}, {activeDest.location}
      </div>

      {/* Top Context & Search Trigger Bar */}
      <div className="hero-top-bar">
        <div className="hero-brand-context">
          <span className="hero-badge-live">DOCUMENTED FIELD ARCHIVE</span>
          <span className="hero-top-divider">•</span>
          <span className="hero-top-counter">{activeDest.number} OF {String(totalCount).padStart(2, '0')}</span>
        </div>

        <Link
          href="/search"
          className="hero-search-control"
          aria-label="Search all researched destinations"
        >
          <span>SEARCH PLACES</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      {/* Background Image Canvas with 600-750ms Spatial Crossfade */}
      <div className="hero-stage-bg" aria-hidden="true">
        {/* Active Hero Image */}
        <div
          key={activeDest.id}
          className={`hero-bg-layer ${isTransitioning ? 'hero-bg-layer-enter' : 'hero-bg-layer-active'}`}
        >
          <Image
            src={activeDest.imageUrl}
            alt={activeDest.imageAlt}
            fill
            priority={activeIndex === 0}
            sizes="(max-width: 768px) 100vw, (max-width: 1400px) 100vw, 1400px"
            className="hero-image-media"
          />
        </div>

        {/* Previous Image fading out during transition */}
        {prevIndex !== null && HERO_DESTINATIONS[prevIndex] && (
          <div className="hero-bg-layer hero-bg-layer-exit">
            <Image
              src={HERO_DESTINATIONS[prevIndex].imageUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1400px) 100vw, 1400px"
              className="hero-image-media"
            />
          </div>
        )}

        {/* Subtle Natural Scrim — preserves photograph while guaranteeing WCAG AA text contrast */}
        <div className="hero-atmospheric-scrim" />
      </div>

      {/* Main Hero Content Composition */}
      <div className="hero-content-grid">
        {/* Destination Information Panel */}
        <div className="hero-editorial-panel">
          <div className="hero-meta-row">
            <span className="hero-pill-evidence">
              <span className="hero-pill-dot" />
              {activeDest.classification}
            </span>
            <span className="hero-meta-separator">•</span>
            <span className="hero-meta-era">{activeDest.era}</span>
          </div>

          <h1 className="hero-dest-name">
            {activeDest.name}
          </h1>

          <p className="hero-dest-location">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{activeDest.location}</span>
          </p>

          <p className="hero-dest-description">
            {activeDest.shortDescription}
          </p>

          {/* ONE Primary Action: EXPLORE PLACE → */}
          <div className="hero-cta-wrap">
            <Link
              href={`/destinations/${activeDest.slug}`}
              className="hero-primary-cta"
              aria-label={`Explore ${activeDest.name} in detail`}
            >
              <span>EXPLORE PLACE</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Destination Switcher & Sequence Counter */}
        <div className="hero-switcher-panel">
          {/* Small Destination Switcher (Visual Previews) */}
          <div
            className="hero-switcher-row"
            role="tablist"
            aria-label="Destination sequence preview switcher"
          >
            {HERO_DESTINATIONS.map((dest, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={dest.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Switch to destination ${dest.number}: ${dest.name}`}
                  onClick={() => goToDestination(idx)}
                  className={`hero-switcher-pill ${isActive ? 'hero-switcher-pill-active' : ''}`}
                >
                  <span className="hero-switcher-pill-thumb">
                    <Image
                      src={dest.imageUrl}
                      alt=""
                      fill
                      sizes="32px"
                      className="hero-switcher-thumb-img"
                    />
                  </span>
                  <span className="hero-switcher-num">{dest.number}</span>
                  <span className="hero-switcher-name">{dest.shortName}</span>
                </button>
              );
            })}
          </div>

          {/* Sequence Counter & Navigation Controls */}
          <div className="hero-controls-bar">
            {/* Numeric Counter */}
            <div className="hero-counter-display">
              <span className="hero-counter-current">{activeDest.number}</span>
              <span className="hero-counter-divider">/</span>
              <span className="hero-counter-total">{String(totalCount).padStart(2, '0')}</span>
            </div>

            {/* Subtle Progress Line */}
            <div className="hero-progress-track" aria-hidden="true">
              <div
                className="hero-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Arrow Navigation */}
            <div className="hero-arrow-nav">
              <button
                type="button"
                onClick={handlePrev}
                className="hero-arrow-btn"
                aria-label="Previous destination"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="hero-arrow-btn"
                aria-label="Next destination"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
