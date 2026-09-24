'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FactBadge } from '@/components/common/FactBadge';

export interface HeroDestination {
  id: string;
  number: string;
  name: string;
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
    slug: 'qila-mubarak-bathinda',
    location: 'Bathinda, Punjab',
    state: 'Punjab',
    era: '1st–3rd CE & 1240 CE',
    classification: 'DOCUMENTED',
    shortDescription:
      'India’s oldest surviving brick fortress, dating back to the Kushan era, and the 1240 CE prison of Delhi’s sovereign Razia Sultana.',
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=2000&q=85',
    imageAlt: 'Monumental brick bastions and high walls of Qila Mubarak in Bathinda',
  },
  {
    id: 'masrur-temples',
    number: '02',
    name: 'Masrur Rock-Cut Temples',
    slug: 'masrur-rock-cut-temples-kangra',
    location: 'Kangra, Himachal Pradesh',
    state: 'Himachal Pradesh',
    era: '8th Century CE',
    classification: 'DOCUMENTED',
    shortDescription:
      'Fifteen monolithic rock-cut shrines carved directly from a living sandstone ridge overlooking the snow-capped Dhauladhars.',
    imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=2000&q=85',
    imageAlt: 'Rock-cut stone spires reflecting into calm water reservoir with mountain view',
  },
  {
    id: 'dagshai-jail',
    number: '03',
    name: 'Dagshai Heritage Jail',
    slug: 'dagshai-heritage-jail-catacombs',
    location: 'Solan, Himachal Pradesh',
    state: 'Himachal Pradesh',
    era: '1847–1920 CE',
    classification: 'DOCUMENTED',
    shortDescription:
      'An 1847 British colonial military prison with 54 windowless disciplinary cells and subterranean solitary catacombs.',
    imageUrl: 'https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?auto=format&fit=crop&w=2000&q=85',
    imageAlt: 'Stone arched corridor of colonial military prison with iron cell doors',
  },
  {
    id: 'gondhla-fort',
    number: '04',
    name: 'Gondhla Tower Fort',
    slug: 'gondhla-tower-fort-lahaul',
    location: 'Lahaul, Himachal Pradesh',
    state: 'Himachal Pradesh',
    era: 'c. 1700 CE',
    classification: 'DOCUMENTED',
    shortDescription:
      'An extraordinary eight-storey timber-laced tower fortress built by the local Thakurs of Lahaul along the Chandra river.',
    imageUrl: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=2000&q=85',
    imageAlt: 'Tall timber and stone multi-storey fort tower in mountain valley',
  },
  {
    id: 'bhima-devi',
    number: '05',
    name: 'Bhima Devi Temple Complex',
    slug: 'bhima-devi-temple-pinjore',
    location: 'Pinjore, Haryana',
    state: 'Haryana',
    era: '8th–11th Century CE',
    classification: 'DOCUMENTED',
    shortDescription:
      'The ‘Khajuraho of North India’—an 8th–11th century Gurjara-Pratihara temple complex ruins and open-air sculpture museum.',
    imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=2000&q=85',
    imageAlt: 'Intricately carved medieval stone sculptures and friezes on display in garden',
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
      }, 850);
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

  // Pause autoplay when tab is inactive
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

    // Horizontal swipe threshold
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

  // Calculate destination thumbnails (other available destinations)
  const thumbnailList = HERO_DESTINATIONS.map((dest, idx) => ({
    dest,
    index: idx,
    isActive: idx === activeIndex,
  }));

  const progressPercent = ((activeIndex + 1) / totalCount) * 100;

  return (
    <section
      className="cinematic-hero-section"
      aria-label="Cinematic Destination Discovery Hero"
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
        Showing destination {activeDest.number} of {totalCount}: {activeDest.name}, {activeDest.location}
      </div>

      {/* Background Image Stage with Cinematic Transition Layers */}
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
            sizes="(max-width: 1440px) 100vw, 1400px"
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
              sizes="(max-width: 1440px) 100vw, 1400px"
              className="hero-image-media"
            />
          </div>
        )}

        {/* Atmospheric Scrim — darker at bottom-left for text contrast, clear elsewhere */}
        <div className="hero-atmospheric-scrim" />
      </div>

      {/* Main Hero Content Composition */}
      <div className="hero-content-grid">
        {/* Left / Lower-Left: Destination Editorial Info */}
        <div className="hero-editorial-panel">
          <div className="hero-meta-row">
            <FactBadge
              label={activeDest.classification}
              variant="evidence"
              evidenceType={activeDest.classification}
            />
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

          {/* CTA & Search Trigger Row */}
          <div className="hero-cta-group">
            <Link
              href={`/destinations/${activeDest.slug}`}
              className="hi-btn hi-btn-primary"
              aria-label={`Explore ${activeDest.name} in detail`}
            >
              <span>EXPLORE THIS PLACE</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>

            <Link
              href="/search"
              className="hero-search-link"
              aria-label="Search all destinations"
            >
              <span>SEARCH PLACES</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Right / Lower-Right: Destination Portals & Counter (Reference 2) */}
        <div className="hero-portals-panel">
          {/* Thumbnails Strip */}
          <div className="hero-thumbnails-row" role="tablist" aria-label="Destination Portals">
            {thumbnailList.map(({ dest, index, isActive }) => (
              <button
                key={dest.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Show ${dest.name}, ${dest.location}`}
                onClick={() => goToDestination(index)}
                className={`hero-thumb-btn ${isActive ? 'hero-thumb-active' : ''}`}
              >
                <div className="hero-thumb-image-wrap">
                  <Image
                    src={dest.imageUrl}
                    alt=""
                    fill
                    sizes="120px"
                    className="hero-thumb-img"
                  />
                  <div className="hero-thumb-scrim" />
                </div>
                <div className="hero-thumb-info">
                  <span className="hero-thumb-num">{dest.number}</span>
                  <strong className="hero-thumb-name">{dest.name}</strong>
                </div>
              </button>
            ))}
          </div>

          {/* Counter, Progress & Arrow Navigation Controls */}
          <div className="hero-controls-bar">
            {/* Numeric Counter */}
            <div className="hero-counter-display">
              <span className="hero-counter-current">{activeDest.number}</span>
              <span className="hero-counter-divider">/</span>
              <span className="hero-counter-total">{String(totalCount).padStart(2, '0')}</span>
            </div>

            {/* Progress Bar Line */}
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="hero-arrow-btn"
                aria-label="Next destination"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
