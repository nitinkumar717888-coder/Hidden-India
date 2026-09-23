import React from 'react';
import type { Metadata } from 'next';
import { discoveryService } from '@/lib/services/discovery-service';
import { MapContainer } from '@/components/map/MapContainer';

interface MapPageProps {
  searchParams: { state?: string };
}

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hidden-india-lime.vercel.app';

export const metadata: Metadata = {
  title: 'Interactive Discovery Map — Hidden India',
  description:
    'Explore verified hidden forts, ancient ruins, rock-cut shrines, and unusual geological landmarks across India.',
  alternates: {
    canonical: `${siteUrl}/map`,
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
