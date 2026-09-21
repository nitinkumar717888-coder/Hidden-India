import React from 'react';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Container } from '@/components/common/Container';
import { getCurrentUser } from '@/lib/supabase/server';
import { tripService } from '@/lib/services/trip-service';
import { db } from '@/lib/db';
import { destinations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { EditorialStatus } from '@/lib/types/enums';
import { TripDetailClient, WaypointData } from '@/components/trips/TripDetailClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export const metadata: Metadata = {
  title: 'Trip Itinerary & Road Calculation — Hidden India',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TripDetailPage({ params }: PageProps) {
  const authUser = await getCurrentUser();

  if (!authUser) {
    redirect(`/login?next=/trips/${params.id}`);
  }

  const enrichedTrip = await tripService.getTripById(authUser.id, params.id);

  if (!enrichedTrip) {
    notFound();
  }

  // Fetch available published destinations for adding waypoints
  const publishedDestinations = db
    ? await db
        .select({
          id: destinations.id,
          name: destinations.name,
          state: destinations.state,
          district: destinations.district,
        })
        .from(destinations)
        .where(eq(destinations.editorialStatus, EditorialStatus.PUBLISHED))
        .orderBy(destinations.name)
    : [];

  const initialWaypoints: WaypointData[] = enrichedTrip.waypoints.map((w) => ({
    id: w.id,
    sequence: w.sequence,
    notes: w.notes,
    destination: w.destination,
    visitInfo: w.visitInfo,
    primaryImage: w.primaryImage,
  }));

  return (
    <main className="trip-detail-page-main">
      <Container size="wide">
        <TripDetailClient
          initialTrip={enrichedTrip.trip}
          initialWaypoints={initialWaypoints}
          availableDestinations={publishedDestinations}
        />
      </Container>
    </main>
  );
}
