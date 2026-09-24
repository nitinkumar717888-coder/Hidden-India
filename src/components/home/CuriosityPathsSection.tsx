'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/common/Container';

interface DiscoveryPath {
  id: string;
  number: string;
  title: string;
  tagline: string;
  featuredDestination: string;
  featuredSlug: string;
  location: string;
  coordinates: string;
  imageUrl: string;
  imageAlt: string;
  destinations: { name: string; slug: string }[];
}

const CURIOSITY_PATHS: DiscoveryPath[] = [
  {
    id: 'fortresses',
    number: '01',
    title: 'FORGOTTEN FORTRESSES',
    tagline: 'Walls that outlived the kingdoms that built them.',
    featuredDestination: 'Qila Mubarak',
    featuredSlug: 'qila-mubarak-bathinda',
    location: 'Bathinda, Punjab',
    coordinates: '30.2110° N • 74.9455° E',
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=85',
    imageAlt: 'Monumental brick bastions and high walls of Qila Mubarak in Bathinda',
    destinations: [
      { name: 'Qila Mubarak', slug: 'qila-mubarak-bathinda' },
      { name: 'Bhatner Fort', slug: 'bhatner-fort-hanumangarh' },
      { name: 'Kotla Fort', slug: 'kotla-fort-mosque-nuh-mewat' },
      { name: 'Chor Gumbad', slug: 'chor-gumbad-narnaul' },
    ],
  },
  {
    id: 'ruins',
    number: '02',
    title: 'ANCIENT RUINS',
    tagline: 'Places where the past is still visible.',
    featuredDestination: 'Bhima Devi Temple Complex',
    featuredSlug: 'bhima-devi-temple-pinjore',
    location: 'Pinjore, Panchkula, Haryana',
    coordinates: '30.7963° N • 76.9168° E',
    imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1600&q=85',
    imageAlt: 'Carved sculptural stone ruins of Bhima Devi temple complex',
    destinations: [
      { name: 'Bhima Devi Temple', slug: 'bhima-devi-temple-pinjore' },
      { name: 'Tosham Rock Inscription', slug: 'tosham-rock-inscription-bhiwani' },
      { name: 'Harsh Ka Tila', slug: 'sheikh-chehli-tomb-kurukshetra' },
      { name: 'Buria Rang Mahal', slug: 'buria-rang-mahal-yamunanagar' },
    ],
  },
  {
    id: 'sacred',
    number: '03',
    title: 'SACRED & MYSTERIOUS',
    tagline: 'Stories shaped by centuries of belief.',
    featuredDestination: 'Masrur Rock-Cut Temples',
    featuredSlug: 'masrur-rock-cut-temples-kangra',
    location: 'Kangra Valley, Himachal Pradesh',
    coordinates: '32.0628° N • 76.1558° E',
    imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1600&q=85',
    imageAlt: 'Monolithic rock-cut shrines reflecting across rectangular pool in Kangra',
    destinations: [
      { name: 'Masrur Temples', slug: 'masrur-rock-cut-temples-kangra' },
      { name: 'Sheikh Chehli’s Tomb', slug: 'sheikh-chehli-tomb-kurukshetra' },
      { name: 'Tabo Monastic Caves', slug: 'tabo-monastic-meditation-caves' },
      { name: 'Gondhla Tower Fort', slug: 'gondhla-tower-fort-lahaul' },
    ],
  },
  {
    id: 'lost-roads',
    number: '04',
    title: 'LOST ROADS & WAYSTOPS',
    tagline: 'Places travellers once stopped — and most now pass by.',
    featuredDestination: 'Jal Mahal, Narnaul',
    featuredSlug: 'jal-mahal-narnaul',
    location: 'Mahendragarh, Haryana',
    coordinates: '28.0439° N • 76.1075° E',
    imageUrl: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1600&q=85',
    imageAlt: 'Mughal water palace centered in Khan Sarovar reservoir',
    destinations: [
      { name: 'Jal Mahal', slug: 'jal-mahal-narnaul' },
      { name: 'Mughal Sarai Doraha', slug: 'mughal-sarai-doraha-ludhiana' },
      { name: 'Aam Khas Bagh', slug: 'aam-khas-bagh-sirhind' },
      { name: 'Bassi Baoli', slug: 'bassi-baoli-pinjore' },
    ],
  },
];

export const CuriosityPathsSection: React.FC = () => {
  const [activePathId, setActivePathId] = useState<string>('fortresses');

  const activePath = CURIOSITY_PATHS.find((p) => p.id === activePathId) || CURIOSITY_PATHS[0];

  return (
    <section id="curiosity" className="curiosity-section" aria-label="Choose Your Curiosity">
      <Container size="normal">
        {/* Section Heading */}
        <div className="curiosity-header">
          <span className="text-eyebrow">Interactive Discovery</span>
          <h2 className="text-h1">What are you curious about?</h2>
          <p className="curiosity-subtitle">
            There is more than one way to discover India.
          </p>
        </div>

        {/* Large Active Experience Panel */}
        <div className="curiosity-stage">
          <div className="curiosity-hero-card">
            {/* Background Photographic Image with Smooth Fade */}
            <div className="curiosity-image-wrap">
              <Image
                key={activePath.id}
                src={activePath.imageUrl}
                alt={activePath.imageAlt}
                fill
                sizes="(max-width: 900px) 100vw, 1200px"
                className="curiosity-bg-img"
                priority={false}
              />
              <div className="curiosity-scrim" />
            </div>

            {/* Overlaid Editorial Content */}
            <div className="curiosity-editorial-overlay">
              <div className="curiosity-top-meta">
                <span className="curiosity-num-tag">{activePath.number}</span>
                <span className="curiosity-coord-tag">{activePath.coordinates}</span>
                <span className="curiosity-loc-tag">{activePath.location}</span>
              </div>

              <div className="curiosity-main-info">
                <h3 className="curiosity-active-title">{activePath.title}</h3>
                <p className="curiosity-active-tagline">&ldquo;{activePath.tagline}&rdquo;</p>
              </div>

              {/* Waypoint Previews */}
              <div className="curiosity-destinations-bar">
                <span className="curiosity-dest-label">Documented Waypoints:</span>
                <div className="curiosity-dest-pills">
                  {activePath.destinations.map((d) => (
                    <Link
                      key={d.slug}
                      href={`/destinations/${d.slug}`}
                      className="curiosity-pill"
                    >
                      {d.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="curiosity-action-row">
                <Link
                  href={`/destinations/${activePath.featuredSlug}`}
                  className="btn btn-primary"
                >
                  Explore {activePath.featuredDestination} &rarr;
                </Link>
                <Link href="/search" className="btn btn-hero-secondary">
                  Browse All In Category
                </Link>
              </div>
            </div>
          </div>

          {/* 4 Interactive Selector Tabs */}
          <div className="curiosity-tabs" role="tablist" aria-label="Curiosity Discovery Paths">
            {CURIOSITY_PATHS.map((path) => {
              const isActive = path.id === activePath.id;
              return (
                <button
                  key={path.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActivePathId(path.id)}
                  className={`curiosity-tab-btn ${isActive ? 'curiosity-tab-active' : ''}`}
                >
                  <span className="tab-number">{path.number}</span>
                  <div className="tab-text-wrap">
                    <strong className="tab-title">{path.title}</strong>
                    <span className="tab-tagline">{path.tagline}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
};
