/**
 * HIDDEN INDIA — GOOGLE ROUTES API ADAPTER
 * Server-side implementation for Google Maps Platform Routes API (v2).
 * Uses server-side API key ONLY (never leaked to browser bundle).
 * Fallbacks gracefully if key is missing or quota is exhausted.
 */

import { Coordinates, IRoutingProvider, RouteEstimate, RouteRequest } from './types';

export class GoogleRoutesProvider implements IRoutingProvider {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_SERVER_KEY;
  }

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  async calculateRoute(request: RouteRequest): Promise<RouteEstimate> {
    if (!this.isAvailable()) {
      throw new Error('Google Routes API key is unconfigured.');
    }

    // Resolve origin coordinates
    let originCoords: Coordinates | null = null;
    if (typeof request.origin === 'object' && 'latitude' in request.origin) {
      originCoords = request.origin;
    } else if (request.originCoordinates) {
      originCoords = request.originCoordinates;
    }

    if (!originCoords) {
      throw new Error('Origin coordinates are required for Google Routes API calculation.');
    }

    const endpoint = 'https://routes.googleapis.com/directions/v2:computeRoutes';

    const body = {
      origin: {
        location: {
          latLng: {
            latitude: originCoords.latitude,
            longitude: originCoords.longitude,
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: request.destination.latitude,
            longitude: request.destination.longitude,
          },
        },
      },
      travelMode: request.travelMode === 'TWO_WHEELER' ? 'TWO_WHEELER' : 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE',
      computeAlternativeRoutes: false,
      extraComputations: ['TOLLS'],
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.apiKey!,
        'X-Goog-FieldMask':
          'routes.distanceMeters,routes.duration,routes.travelAdvisory.tollInfo',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Routes API returned status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const route = data.routes?.[0];

    if (!route) {
      throw new Error('Google Routes API returned no route.');
    }

    const distanceMeters = route.distanceMeters || 0;
    const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;

    // duration format is a string like "1234s"
    const durationSeconds = parseInt((route.duration || '0s').replace('s', ''), 10) || 0;
    const durationMinutes = Math.round(durationSeconds / 60);

    // Toll calculation
    let tollEstimateINR: number | null = null;
    let hasTollInfo = false;
    const tollInfo = route.travelAdvisory?.tollInfo;
    if (tollInfo && tollInfo.estimatedPrice) {
      const inrPrice = tollInfo.estimatedPrice.find(
        (p: { currencyCode: string; units: string }) => p.currencyCode === 'INR'
      );
      if (inrPrice) {
        tollEstimateINR = parseInt(inrPrice.units || '0', 10);
        hasTollInfo = true;
      }
    }

    return {
      distanceMeters,
      distanceKm,
      durationSeconds,
      durationMinutes,
      provider: 'GOOGLE_ROUTES',
      precision: 'ACTUAL_DRIVE',
      precisionLabel: `${distanceKm} km driving distance`,
      isEstimated: false,
      tollEstimateINR,
      hasTollInfo,
      disclaimer:
        'Calculated via Google Routes API based on current road networks. Tolls and live travel times reflect approximate highway conditions.',
    };
  }
}

export const googleRoutesProvider = new GoogleRoutesProvider();
