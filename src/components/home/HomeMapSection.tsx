'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Container } from '@/components/common/Container';
import type { MapDestinationMarker } from '@/lib/services/discovery-service';

const HomeMapClient = dynamic(() => import('./HomeMapClient'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: '480px',
        height: '100%',
        background: 'var(--color-bg-dark-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-text-inverse-muted)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--font-size-small)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      Loading cartographic discovery map...
    </div>
  ),
});

interface HomeMapSectionProps {
  markers: MapDestinationMarker[];
}

export const HomeMapSection: React.FC<HomeMapSectionProps> = ({ markers }) => {
  return (
    <section id="discovery-map" className="home-map-section" aria-label="Interactive Cartography Section">
      <Container size="normal">
        <div style={{ maxWidth: '780px' }}>
          <span className="text-eyebrow" style={{ color: 'var(--color-ochre)' }}>
            Regional Cartography
          </span>
          <h2 className="text-h1" style={{ color: '#FAF7F2', marginTop: '0.25rem' }}>
            There&apos;s a lot more out there.
          </h2>
          <p
            className="text-lead"
            style={{ color: 'rgba(250, 247, 242, 0.85)', marginTop: '0.5rem', marginBottom: '0.5rem' }}
          >
            Explore verified destinations across Chandigarh, Punjab, Haryana, Himachal Pradesh, and Delhi.
            Select any waypoint on the map to inspect its documented history and coordinates.
          </p>
        </div>

        <HomeMapClient markers={markers} />

        <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span className="text-caption" style={{ color: 'var(--color-text-inverse-muted)' }}>
            Map coordinates verified with archaeological surveys and GIS checkpoints.
          </span>
          <Link href="/map" style={{ color: 'var(--color-ochre)', fontWeight: 600, fontSize: 'var(--font-size-small)' }}>
            Open Fullscreen Interactive Map &rarr;
          </Link>
        </div>
      </Container>
    </section>
  );
};
