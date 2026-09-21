import React from 'react';
import type { Metadata } from 'next';
import { discoveryService } from '@/lib/services/discovery-service';
import { MapContainer } from '@/components/map/MapContainer';

interface MapPageProps {
  searchParams: { state?: string };
}

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Interactive Discovery Map — Hidden India',
  description:
    'Explore verified hidden forts, ancient ruins, rock-cut shrines, and unusual geological landmarks across India.',
  alternates: {
    canonical: 'https://hiddenindia.org/map',
  },
};

export default async function MapPage({ searchParams }: MapPageProps) {
  const [markers, categories] = await Promise.all([
    discoveryService.getMapDestinations(),
    discoveryService.getAllCategories(),
  ]);

  return (
    <div className="fullscreen-map-page">
      <MapContainer
        initialMarkers={markers}
        categories={categories}
        initialStateFilter={searchParams.state || ''}
      />
    </div>
  );
}
