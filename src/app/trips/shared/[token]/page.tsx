import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { tripService } from '@/lib/services/trip-service';
import { calculateMultiStopItinerary } from '@/lib/calculator/multiStopCalculator';
import { VEHICLE_PROFILES, VehicleCategory } from '@/lib/calculator/types';

export const dynamic = 'force-dynamic';

interface SharedTripPageProps {
  params: { token: string };
}

export const metadata: Metadata = {
  title: 'Shared Road Trip Itinerary — Hidden India',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SharedTripPage({ params }: SharedTripPageProps) {
  const sharedTripData = await tripService.getSharedTrip(params.token);

  if (!sharedTripData) {
    notFound();
  }

  const { trip, waypoints } = sharedTripData;

  // Calculate itinerary if waypoints exist
  let calculationResult = null;
  if (waypoints.length > 0) {
    try {
      calculationResult = await calculateMultiStopItinerary({
        startLocation: {
          latitude: trip.startLatitude || 30.7333,
          longitude: trip.startLongitude || 76.7794,
        },
        startLocationLabel: trip.startLocationLabel || trip.startLocation || 'Chandigarh',
        waypoints: waypoints.map((w) => ({
          destinationId: w.destination.id,
          name: w.destination.name,
          coordinates: {
            latitude: w.destination.latitude,
            longitude: w.destination.longitude,
          },
          visitInfo: w.visitInfo,
        })),
        vehicleType: trip.vehicleType as VehicleCategory,
        isRoundTrip: true,
      });
    } catch {
      // Ignore calculation failure for shared view
    }
  }

  const vehicleProfile = VEHICLE_PROFILES[trip.vehicleType as VehicleCategory];

  return (
    <main className="shared-trip-page-main">
      <Container size="normal">
        <header className="shared-trip-header">
          <div className="shared-trip-badge">
            <span>🔗 Shared Road Trip</span>
          </div>
          <h1 className="text-h1" style={{ marginTop: '0.5rem' }}>
            {trip.name}
          </h1>

          <div className="shared-trip-meta">
            <span>📍 Start: {trip.startLocationLabel || trip.startLocation || 'Chandigarh'}</span>
            <span>🚗 Vehicle: {vehicleProfile?.label || trip.vehicleType}</span>
            <span>🏛️ {waypoints.length} Destinations</span>
            {trip.tripStartDate && <span>📅 Dates: {trip.tripStartDate}</span>}
          </div>
        </header>

        <div className="shared-trip-body">
          <h2 className="text-h3" style={{ marginBottom: '1rem' }}>Itinerary Waypoints</h2>
          <div className="waypoints-list">
            {waypoints.map((wp, idx) => (
              <div key={wp.id} className="waypoint-card">
                <div className="waypoint-sequence-badge">
                  <span>{idx + 1}</span>
                </div>
                <div className="waypoint-details">
                  <h3 className="waypoint-title">
                    <Link href={`/destinations/${wp.destination.slug}`}>
                      {wp.destination.name}
                    </Link>
                  </h3>
                  <span className="waypoint-location">
                    📍 {wp.destination.locality ? `${wp.destination.locality}, ` : ''}{wp.destination.district}, {wp.destination.state}
                  </span>
                  <p className="text-small" style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                    {wp.destination.shortDescription}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {calculationResult && (
            <div className="shared-calc-card" style={{ marginTop: '2rem' }}>
              <h2 className="text-h3" style={{ marginBottom: '1rem' }}>Estimated Trip Logistics</h2>
              <div className="metrics-grid">
                <div className="metric-box">
                  <span className="metric-label">Total Distance</span>
                  <span className="metric-value">{calculationResult.totalDistanceKm} km</span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">Estimated Time</span>
                  <span className="metric-value">
                    ~{Math.round((calculationResult.totalDurationMinutes / 60) * 10) / 10} hrs
                  </span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">Energy Required</span>
                  <span className="metric-value">
                    {calculationResult.costCalculation.energyRequired} {calculationResult.costCalculation.energyUnit}
                  </span>
                </div>
              </div>

              <div className="navigation-action-block" style={{ marginTop: '1.5rem' }}>
                <a
                  href={calculationResult.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-gmaps-navigate"
                >
                  <span>🗺️ Open Multi-Stop Route in Google Maps</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
