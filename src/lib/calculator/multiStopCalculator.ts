/**
 * HIDDEN INDIA — MULTI-STOP ITINERARY CALCULATOR
 * Ordered multi-segment route routing and cost aggregation.
 * DIRECT REUSE: Reuses Phase 4's calculateTripCost and RoutingService.
 * STRICT: Enforces "Unknown != 0" honest accounting.
 */

import { Coordinates, RouteEstimate } from '../routing/types';
import { routingService } from '../routing/routing-provider';
import { calculateTripCost } from './tripEngine';
import {
  CostComponentInput,
  TripCalculationResult,
  VEHICLE_PROFILES,
  VehicleCategory,
} from './types';
import { DestinationVisitInfo } from '../db/schema';
import { parseDestinationVisitCosts } from './visitParser';

export interface ItineraryWaypointInput {
  destinationId: string;
  name: string;
  coordinates: Coordinates;
  visitInfo: DestinationVisitInfo | null;
}

export interface RouteSegment {
  fromName: string;
  toName: string;
  fromCoords: Coordinates;
  toCoords: Coordinates;
  distanceKm: number;
  durationMinutes: number;
  provider: string;
  precisionLabel: string;
  tollEstimateINR: number | null;
}

export interface MultiStopItineraryInput {
  startLocation: Coordinates;
  startLocationLabel: string;
  waypoints: ItineraryWaypointInput[];
  vehicleType: VehicleCategory;
  isRoundTrip?: boolean;
  customEfficiency?: number | null;
  fuelPricePerUnit?: number | null;
}

export interface MultiStopItineraryResult {
  segments: RouteSegment[];
  totalDistanceKm: number;
  totalDurationMinutes: number;
  costCalculation: TripCalculationResult;
  googleMapsUrl: string;
}

export const MAX_ITINERARY_WAYPOINTS = 10;

/**
 * Calculates an ordered multi-stop trip itinerary.
 */
export async function calculateMultiStopItinerary(
  input: MultiStopItineraryInput
): Promise<MultiStopItineraryResult> {
  const {
    startLocation,
    startLocationLabel,
    waypoints,
    vehicleType,
    isRoundTrip = true,
    customEfficiency,
    fuelPricePerUnit,
  } = input;

  if (waypoints.length === 0) {
    throw new Error('At least one destination waypoint is required.');
  }

  if (waypoints.length > MAX_ITINERARY_WAYPOINTS) {
    throw new Error(
      `A trip itinerary can contain at most ${MAX_ITINERARY_WAYPOINTS} destination waypoints.`
    );
  }

  const segments: RouteSegment[] = [];
  let totalDistanceKm = 0;
  let totalDurationMinutes = 0;
  let totalKnownTolls = 0;
  let hasUnknownTolls = false;

  // Build sequential list of locations: [Start, W1, W2, ..., WN, (Start if round trip)]
  const points: { name: string; coords: Coordinates }[] = [
    { name: startLocationLabel, coords: startLocation },
    ...waypoints.map((w) => ({ name: w.name, coords: w.coordinates })),
  ];

  if (isRoundTrip) {
    points.push({ name: `${startLocationLabel} (Return)`, coords: startLocation });
  }

  // Calculate each segment independently
  for (let i = 0; i < points.length - 1; i++) {
    const from = points[i];
    const to = points[i + 1];

    let estimate: RouteEstimate;
    try {
      estimate = await routingService.calculateRoute({
        origin: from.coords,
        destination: to.coords,
      });
    } catch {
      // Fallback estimate if route service throws
      const rawDistance = Math.hypot(
        to.coords.latitude - from.coords.latitude,
        to.coords.longitude - from.coords.longitude
      ) * 111 * 1.3;
      estimate = {
        distanceMeters: Math.round(rawDistance * 1000),
        distanceKm: Math.round(rawDistance * 10) / 10,
        durationSeconds: Math.round((rawDistance / 45) * 3600),
        durationMinutes: Math.round((rawDistance / 45) * 60),
        provider: 'FALLBACK',
        precision: 'APPROXIMATE_GEO',
        precisionLabel: `Approx. ${Math.round(rawDistance)} km (geographic estimate — actual road distance may differ)`,
        isEstimated: true,
        tollEstimateINR: null,
        hasTollInfo: false,
        disclaimer: 'Geographic fallback estimate',
      };
    }

    segments.push({
      fromName: from.name,
      toName: to.name,
      fromCoords: from.coords,
      toCoords: to.coords,
      distanceKm: estimate.distanceKm,
      durationMinutes: estimate.durationMinutes,
      provider: estimate.provider,
      precisionLabel: estimate.precisionLabel,
      tollEstimateINR: estimate.tollEstimateINR ?? null,
    });

    totalDistanceKm += estimate.distanceKm;
    totalDurationMinutes += estimate.durationMinutes;

    if (estimate.hasTollInfo && estimate.tollEstimateINR !== null && estimate.tollEstimateINR !== undefined) {
      totalKnownTolls += estimate.tollEstimateINR;
    } else {
      hasUnknownTolls = true;
    }
  }

  totalDistanceKm = Math.round(totalDistanceKm * 10) / 10;

  // Aggregate destination visit costs (entry fees & parking)
  let totalKnownParking = 0;
  let hasUnknownParking = false;
  let totalKnownEntryFees = 0;
  let hasUnknownEntryFees = false;

  waypoints.forEach((w) => {
    const parsed = parseDestinationVisitCosts(w.visitInfo);

    if (parsed.parking.status === 'KNOWN_AMOUNT') {
      totalKnownParking += parsed.parking.amount || 0;
    } else if (parsed.parking.status === 'UNKNOWN') {
      hasUnknownParking = true;
    }

    if (parsed.entryFee.status === 'KNOWN_AMOUNT') {
      totalKnownEntryFees += parsed.entryFee.amount || 0;
    } else if (parsed.entryFee.status === 'UNKNOWN') {
      hasUnknownEntryFees = true;
    }
  });

  // Prepare structured cost inputs for pure calculation engine
  const tollsInput: CostComponentInput = hasUnknownTolls
    ? { status: 'UNKNOWN' }
    : { status: 'KNOWN_AMOUNT', amount: totalKnownTolls };

  const parkingInput: CostComponentInput = hasUnknownParking
    ? { status: 'UNKNOWN' }
    : { status: 'KNOWN_AMOUNT', amount: totalKnownParking };

  const entryFeeInput: CostComponentInput = hasUnknownEntryFees
    ? { status: 'UNKNOWN' }
    : { status: 'KNOWN_AMOUNT', amount: totalKnownEntryFees };

  // REUSE Phase 4 pure engine
  const costCalculation = calculateTripCost({
    oneWayDistanceKm: totalDistanceKm, // Total aggregated distance
    tripType: 'ONE_WAY', // Already encompasses full itinerary
    vehicleType,
    customEfficiency,
    fuelPricePerUnit: fuelPricePerUnit || VEHICLE_PROFILES[vehicleType].defaultFuelPriceEstimate,
    tolls: tollsInput,
    parking: parkingInput,
    entryFee: entryFeeInput,
  });

  // Official Google Maps multi-stop deep link
  const originStr = `${startLocation.latitude},${startLocation.longitude}`;
  const finalDest = points[points.length - 1].coords;
  const destStr = `${finalDest.latitude},${finalDest.longitude}`;

  // Waypoints between origin and final destination
  const intermediateWaypoints = points.slice(1, points.length - 1);
  const waypointsParam = intermediateWaypoints
    .map((p) => `${p.coords.latitude},${p.coords.longitude}`)
    .join('|');

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    originStr
  )}&destination=${encodeURIComponent(destStr)}${
    waypointsParam ? `&waypoints=${encodeURIComponent(waypointsParam)}` : ''
  }&travelmode=driving`;

  return {
    segments,
    totalDistanceKm,
    totalDurationMinutes,
    costCalculation,
    googleMapsUrl,
  };
}
