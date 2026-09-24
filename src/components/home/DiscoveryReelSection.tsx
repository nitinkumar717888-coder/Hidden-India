'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/common/Container';

interface ReelItem {
  id: string;
  name: string;
  slug: string;
  location: string;
  coordinates: string;
  era: string;
  tagline: string;
  imageUrl: string;
}

const REEL_ITEMS: ReelItem[] = [
  {
    id: 'qila-mubarak',
    name: 'Qila Mubarak',
    slug: 'qila-mubarak-bathinda',
    location: 'Bathinda, Punjab',
    coordinates: '30.2110° N • 74.9455° E',
    era: '1st–3rd CE & 1240 CE',
    tagline: 'India’s oldest surviving brick fortress and the high-security prison of Razia Sultana.',
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'bhima-devi',
    name: 'Bhima Devi Temple Complex',
    slug: 'bhima-devi-temple-pinjore',
    location: 'Pinjore, Haryana',
    coordinates: '30.7963° N • 76.9168° E',
    era: '8th–12th Century CE',
    tagline: 'Gurjara-Pratihara sculptural ruins known by archaeologists as the Khajuraho of North India.',
    imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'bassi-baoli',
    name: 'Bassi Baoli',
    slug: 'bassi-baoli-pinjore',
    location: 'Shiwalik Foothills, Haryana',
    coordinates: '30.8010° N • 76.9240° E',
    era: '16th Century CE',
    tagline: 'Secluded subterranean stepped aquifer spring well continuously flowing with mountain water.',
    imageUrl: 'https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'masrur',
    name: 'Masrur Rock-Cut Temples',
    slug: 'masrur-rock-cut-temples-kangra',
    location: 'Kangra Valley, Himachal Pradesh',
    coordinates: '32.0628° N • 76.1558° E',
    era: '8th Century CE',
    tagline: 'Fifteen monolithic sandstone shikharas carved from a natural ridge facing the Dhauladhars.',
    imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'gondhla',
    name: 'Gondhla Tower Fort',
    slug: 'gondhla-tower-fort-lahaul',
    location: 'Chandra Valley, Lahaul, HP',
    coordinates: '32.4858° N • 76.9850° E',
    era: 'c. 1700 CE',
    tagline: 'An eight-storey timber-laced indigenous castle built by the local Thakur at 10,300 feet.',
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1000&q=80',
  },
];

export const DiscoveryReelSection: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollByAmount = (offset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section id="discovery-reel" className="discovery-reel-section" aria-label="Discovery Reel Sequence">
      <Container size="normal">
        <div className="discovery-reel-header">
          <div>
            <span className="text-eyebrow">Continuous Discovery Sequence</span>
            <h2 className="text-h1">Discover more.</h2>
            <p className="discovery-reel-sub">
              There is always another layer. Follow the trail of northern India&apos;s documented heritage.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="discovery-reel-nav-buttons" aria-hidden="true">
            <button
              type="button"
              onClick={() => scrollByAmount(-360)}
              className="reel-nav-btn"
              aria-label="Previous destination"
            >
              &larr;
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount(360)}
              className="reel-nav-btn"
              aria-label="Next destination"
            >
              &rarr;
            </button>
          </div>
        </div>

        {/* Horizontal Reel Track */}
        <div ref={scrollContainerRef} className="discovery-reel-track" tabIndex={0} role="region" aria-label="Scrollable destination reel">
          {REEL_ITEMS.map((item, index) => {
            const stepNum = String(index + 1).padStart(2, '0');
            return (
              <article key={item.id} className="discovery-reel-card" aria-label={item.name}>
                <div className="reel-card-img-box">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="(max-width: 600px) 85vw, 420px"
                    className="reel-card-img"
                    loading="lazy"
                  />
                  <div className="reel-card-scrim" />
                  <span className="reel-card-step">STEP {stepNum}</span>
                </div>

                <div className="reel-card-body">
                  <div className="reel-card-meta-line">
                    <span className="reel-coords">{item.coordinates}</span>
                    <span className="reel-era">{item.era}</span>
                  </div>

                  <h3 className="reel-title">
                    <Link href={`/destinations/${item.slug}`} className="hover-link">
                      {item.name}
                    </Link>
                  </h3>

                  <p className="reel-location">{item.location}</p>

                  <p className="reel-tagline">{item.tagline}</p>

                  <div className="reel-card-footer">
                    <Link
                      href={`/destinations/${item.slug}`}
                      className="reel-cta-link"
                    >
                      <span>Explore</span>
                      <span className="reel-arrow">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
