import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Container } from '@/components/common/Container';
import { getCurrentUser } from '@/lib/supabase/server';
import { tripService } from '@/lib/services/trip-service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Trips — Hidden India',
  description: 'Plan, sequence, and calculate multi-stop road trip itineraries across India.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TripsDashboardPage() {
  const authUser = await getCurrentUser();

  if (!authUser) {
    redirect('/login?next=/trips');
  }

  const userTrips = await tripService.getUserTrips(authUser.id);

  return (
    <main className="trips-page-main">
      <Container size="normal">
        <div className="trips-header-row">
          <div>
            <span className="text-eyebrow">Itinerary Planning</span>
            <h1 className="text-h1">My Road Trips</h1>
            <p className="text-lead" style={{ marginTop: '0.25rem' }}>
              Multi-stop driving itineraries with transparent fuel and cost engineering.
            </p>
          </div>

          <Link href="/trips/new" className="btn btn-primary">
            <span>+ Create New Trip</span>
          </Link>
        </div>

        {userTrips.length === 0 ? (
          <div className="trips-empty-box">
            <span className="empty-icon">🗺️</span>
            <h2 className="text-h3">You haven&apos;t created any trips yet.</h2>
            <p className="text-muted" style={{ maxWidth: '480px', margin: '0.5rem 0 1.5rem' }}>
              Create an ordered itinerary to calculate segment driving distances, fuel consumption,
              highway tolls, and verified entrance fees for multiple destinations.
            </p>
            <Link href="/trips/new" className="btn btn-primary">
              Create Your First Trip
            </Link>
          </div>
        ) : (
          <div className="trips-grid">
            {userTrips.map(({ trip, destinationCount }) => (
              <div key={trip.id} className="trip-card">
                <div className="trip-card-header">
                  <span className="trip-vehicle-tag">{trip.vehicleType.replace('_', ' ')}</span>
                  {trip.isShared && <span className="trip-shared-tag">🔗 Shared</span>}
                </div>

                <h2 className="trip-card-title">
                  <Link href={`/trips/${trip.id}`}>{trip.name}</Link>
                </h2>

                <div className="trip-card-meta">
                  <span>📍 Start: {trip.startLocationLabel || trip.startLocation || 'Chandigarh'}</span>
                  <span>🏛️ {destinationCount} {destinationCount === 1 ? 'Destination' : 'Destinations'}</span>
                  {trip.tripStartDate && (
                    <span>📅 {trip.tripStartDate} {trip.tripEndDate ? `to ${trip.tripEndDate}` : ''}</span>
                  )}
                </div>

                {trip.notes && (
                  <p className="trip-card-snippet">
                    {trip.notes.length > 120 ? `${trip.notes.slice(0, 120)}...` : trip.notes}
                  </p>
                )}

                <div className="trip-card-actions">
                  <Link href={`/trips/${trip.id}`} className="btn btn-sm btn-primary">
                    Open Itinerary & Calculator
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
