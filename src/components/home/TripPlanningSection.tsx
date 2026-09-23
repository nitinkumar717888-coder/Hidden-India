'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/common/Container';

interface RoutePreset {
  id: string;
  origin: string;
  destination: string;
  destinationSlug: string;
  distanceKm: number;
  durationText: string;
  tollEstimate: number;
}

const PRESET_ROUTES: RoutePreset[] = [
  {
    id: 'kalesar',
    origin: 'Chandigarh',
    destination: 'Kalesar Colonial Red Iron Bridge',
    destinationSlug: 'kalesar-iron-suspension-bridge',
    distanceKm: 122,
    durationText: '2 hrs 45 mins',
    tollEstimate: 140,
  },
  {
    id: 'bathinda',
    origin: 'Chandigarh',
    destination: 'Qila Mubarak (Bathinda Fort)',
    destinationSlug: 'qila-mubarak-bathinda',
    distanceKm: 215,
    durationText: '3 hrs 50 mins',
    tollEstimate: 210,
  },
  {
    id: 'masrur',
    origin: 'Chandigarh',
    destination: 'Masrur Rock-Cut Temples (Kangra)',
    destinationSlug: 'masrur-rock-cut-temples-kangra',
    distanceKm: 238,
    durationText: '5 hrs 15 mins',
    tollEstimate: 180,
  },
  {
    id: 'narnaul',
    origin: 'New Delhi',
    destination: 'Jal Mahal & Chor Gumbad (Narnaul)',
    destinationSlug: 'jal-mahal-narnaul',
    distanceKm: 148,
    durationText: '3 hrs 10 mins',
    tollEstimate: 165,
  },
];

export const TripPlanningSection: React.FC = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('kalesar');
  const [vehicleType, setVehicleType] = useState<'petrol' | 'diesel' | 'ev'>('petrol');
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(true);

  const activeRoute = PRESET_ROUTES.find((r) => r.id === selectedRouteId) || PRESET_ROUTES[0];
  const multiplier = isRoundTrip ? 2 : 1;
  const effectiveDistance = activeRoute.distanceKm * multiplier;

  // Rate models (consistent with lib/calculator/pricingEngine.ts)
  // Petrol: ₹96.5/L, 15 km/L. Diesel: ₹88.5/L, 18 km/L. EV: ₹9.5/kWh, 7 km/kWh
  let fuelCost = 0;
  let fuelQuantity = '';
  if (vehicleType === 'petrol') {
    const litres = effectiveDistance / 15;
    fuelCost = Math.round(litres * 96.5);
    fuelQuantity = `${litres.toFixed(1)} Litres`;
  } else if (vehicleType === 'diesel') {
    const litres = effectiveDistance / 18;
    fuelCost = Math.round(litres * 88.5);
    fuelQuantity = `${litres.toFixed(1)} Litres`;
  } else {
    const kwh = effectiveDistance / 7;
    fuelCost = Math.round(kwh * 9.5);
    fuelQuantity = `${kwh.toFixed(1)} kWh`;
  }

  const tollCost = activeRoute.tollEstimate * multiplier;
  const estimatedTotal = fuelCost + tollCost;

  return (
    <section id="trip-planner" className="trip-planner-section" aria-label="Practical Road Trip Planning Engine">
      <Container size="normal">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto var(--space-8)' }}>
          <span className="text-eyebrow">Practical Road Trip Engine</span>
          <h2 className="text-h1">Found a place? Add it to your journey.</h2>
          <p className="text-lead" style={{ marginTop: '0.5rem' }}>
            Curiosity is only half the journey. Hidden India turns archaeological discoveries into
            practical, turn-by-turn road expeditions with verified fuel tariffs, toll estimates, and offline waypoints.
          </p>
        </div>

        {/* Visual Flowchart Pills */}
        <div className="trip-planner-flow-steps" aria-hidden="true">
          <span className="trip-flow-pill">START</span>
          <span className="trip-flow-sep">&rarr;</span>
          <span className="trip-flow-pill">DESTINATION</span>
          <span className="trip-flow-sep">&rarr;</span>
          <span className="trip-flow-pill">DISTANCE</span>
          <span className="trip-flow-sep">&rarr;</span>
          <span className="trip-flow-pill">ESTIMATED COST</span>
          <span className="trip-flow-sep">&rarr;</span>
          <span className="trip-flow-pill">NAVIGATE</span>
          <span className="trip-flow-sep">&rarr;</span>
          <span className="trip-flow-pill">SAVE</span>
        </div>

        {/* Interactive Trip Calculator Box */}
        <div className="trip-interactive-box">
          <div className="grid grid-cols-1 grid-cols-2-sm gap-8 items-center">
            {/* Left: Input Selection */}
            <div>
              <label
                htmlFor="preset-route-select"
                style={{
                  display: 'block',
                  fontSize: 'var(--font-size-small)',
                  fontWeight: 600,
                  marginBottom: 'var(--space-2)',
                  color: 'var(--color-text-primary)',
                }}
              >
                Select a Verified Discovery Route:
              </label>
              <select
                id="preset-route-select"
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: 'var(--font-size-small)',
                  border: '1px solid var(--color-border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-bg-canvas)',
                  marginBottom: 'var(--space-5)',
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {PRESET_ROUTES.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.origin} &rarr; {route.destination}
                  </option>
                ))}
              </select>

              {/* Vehicle Type Toggle */}
              <div style={{ marginBottom: 'var(--space-5)' }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-caption)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                    marginBottom: 'var(--space-2)',
                    letterSpacing: '0.06em',
                  }}
                >
                  Vehicle Powertrain:
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setVehicleType('petrol')}
                    className={`btn btn-sm ${vehicleType === 'petrol' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Petrol Car (15 km/L)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleType('diesel')}
                    className={`btn btn-sm ${vehicleType === 'diesel' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Diesel Car (18 km/L)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleType('ev')}
                    className={`btn btn-sm ${vehicleType === 'ev' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    EV (7 km/kWh)
                  </button>
                </div>
              </div>

              {/* Trip Direction Toggle */}
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: 'var(--font-size-small)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isRoundTrip}
                    onChange={(e) => setIsRoundTrip(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-terracotta)' }}
                  />
                  <span>Calculate as <strong>Round-Trip Return</strong> (Includes return distance & tolls)</span>
                </label>
              </div>
            </div>

            {/* Right: Live Calculated Preview */}
            <div className="calculator-preview-box" style={{ margin: 0 }}>
              <div className="preview-header">
                <span className="text-label">Verified Estimate Engine</span>
                <span className="badge badge-default">Live Calculation</span>
              </div>

              <div className="preview-row">
                <span>Selected Destination</span>
                <strong>{activeRoute.destination}</strong>
              </div>

              <div className="preview-row">
                <span>Calculated Road Distance</span>
                <span>~{effectiveDistance} km ({isRoundTrip ? 'Round-trip' : 'One-way'})</span>
              </div>

              <div className="preview-row">
                <span>Driving Duration</span>
                <span>~{isRoundTrip ? `${parseInt(activeRoute.durationText) * 2} hrs (driving total)` : activeRoute.durationText}</span>
              </div>

              <div className="preview-row">
                <span>Energy / Fuel Consumption</span>
                <span>~{fuelQuantity}</span>
              </div>

              <div className="preview-row">
                <span>State Toll Estimates</span>
                <span>~₹{tollCost}</span>
              </div>

              <div className="preview-divider" />

              <div className="preview-row total-row">
                <span>Estimated Travel Expense</span>
                <strong style={{ color: 'var(--color-terracotta)', fontSize: '1.4rem' }}>
                  ₹{estimatedTotal.toLocaleString('en-IN')}*
                </strong>
              </div>

              <p className="preview-disclaimer">
                *Estimated total based on verified regional fuel rates (Petrol ₹96.5/L, Diesel ₹88.5/L) and state highway toll averages. Actual consumption varies by driving conditions.
              </p>

              <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Link
                  href={`/destinations/${activeRoute.destinationSlug}`}
                  className="btn btn-secondary btn-sm"
                  style={{ flexGrow: 1 }}
                >
                  Inspect Place Details &rarr;
                </Link>
                <Link
                  href="/trips"
                  className="btn btn-primary btn-sm"
                  style={{ flexGrow: 1 }}
                >
                  Open Custom Trip Planner &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
