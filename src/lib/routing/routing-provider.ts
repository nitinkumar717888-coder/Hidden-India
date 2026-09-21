/**
 * HIDDEN INDIA — ROUTING SERVICE & PROVIDERS
 * Manages route estimations, Google Routes API integration, and honest fallback calculations.
 */

import {
  Coordinates,
  IRoutingProvider,
  RouteEstimate,
  RouteRequest,
} from './types';
import { googleRoutesProvider } from './google-routes-provider';

/**
 * Calculates straight-line (great-circle) distance in kilometers between two coordinates.
 */
export function haversineDistanceKm(c1: Coordinates, c2: Coordinates): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((c2.latitude - c1.latitude) * Math.PI) / 180;
  const dLon = ((c2.longitude - c1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.latitude * Math.PI) / 180) *
      Math.cos((c2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Fallback routing provider using geographic distance + regional road curvature factor.
 * STRICT: Clearly labeled as approximate straight-line estimate, NEVER as driving distance.
 */
export class FallbackRoutingProvider implements IRoutingProvider {
  async calculateRoute(request: RouteRequest): Promise<RouteEstimate> {
    let originCoords: Coordinates;

    if (typeof request.origin === 'object' && 'latitude' in request.origin) {
      originCoords = request.origin;
    } else if (request.originCoordinates) {
      originCoords = request.originCoordinates;
    } else {
      throw new Error('Origin coordinates required for route estimation.');
    }

    const straightLineKm = Math.round(haversineDistanceKm(originCoords, request.destination) * 10) / 10;
    // Regional road curvature factor for North Indian plains and Shivalik approaches (typically 1.30x)
    const roadFactor = 1.3;
    const distanceKm = Math.round(straightLineKm * roadFactor * 10) / 10;
    const distanceMeters = Math.round(distanceKm * 1000);

    // Realistic mixed road speed: 45 km/h
    const averageSpeedKmH = 45;
    const durationMinutes = Math.round((distanceKm / averageSpeedKmH) * 60);
    const durationSeconds = durationMinutes * 60;

    return {
      distanceMeters,
      distanceKm,
      durationSeconds,
      durationMinutes,
      provider: 'FALLBACK',
      precision: 'APPROXIMATE_GEO',
      precisionLabel: `Approx. ${distanceKm} km (geographic estimate — actual road distance may differ)`,
      isEstimated: true,
      tollEstimateINR: null, // Honest: fallback does not know tolls
      hasTollInfo: false,
      disclaimer:
        'Approximate geographic estimate based on straight-line distance with regional terrain factor. Actual driving road distance, highway routes, tolls, and travel times may differ.',
    };
  }
}

interface CacheEntry {
  estimate: RouteEstimate;
  expiresAt: number;
}

/**
 * Routing Service manager using the adapter pattern with a 15-minute route calculation cache.
 * Prioritizes official Google Routes API when server key is configured,
 * and gracefully falls back to FallbackRoutingProvider on any error or missing key.
 */
export class RoutingService implements IRoutingProvider {
  private fallbackProvider = new FallbackRoutingProvider();
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 15 * 60 * 1000; // 15-minute short-lived cache

  private getCacheKey(request: RouteRequest): string | null {
    let origLat: number | null = null;
    let origLng: number | null = null;

    if (typeof request.origin === 'object' && 'latitude' in request.origin) {
      origLat = request.origin.latitude;
      origLng = request.origin.longitude;
    } else if (request.originCoordinates) {
      origLat = request.originCoordinates.latitude;
      origLng = request.originCoordinates.longitude;
    } else if (typeof request.origin === 'string') {
      return `query:${request.origin.trim().toLowerCase()}->${request.destination.latitude.toFixed(4)},${request.destination.longitude.toFixed(4)}:${request.travelMode || 'DRIVING'}`;
    }

    if (origLat !== null && origLng !== null) {
      return `coords:${origLat.toFixed(4)},${origLng.toFixed(4)}->${request.destination.latitude.toFixed(4)},${request.destination.longitude.toFixed(4)}:${request.travelMode || 'DRIVING'}`;
    }

    return null;
  }

  async calculateRoute(request: RouteRequest): Promise<RouteEstimate> {
    const cacheKey = this.getCacheKey(request);
    const now = Date.now();

    if (cacheKey) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiresAt > now) {
        return cached.estimate;
      }
    }

    let estimate: RouteEstimate;

    if (googleRoutesProvider.isAvailable()) {
      try {
        estimate = await googleRoutesProvider.calculateRoute(request);
      } catch (err) {
        console.warn(
          'Google Routes API calculation failed, falling back to geographic estimate:',
          err instanceof Error ? err.message : err
        );
        estimate = await this.fallbackProvider.calculateRoute(request);
      }
    } else {
      estimate = await this.fallbackProvider.calculateRoute(request);
    }

    if (cacheKey) {
      // Store in short-lived cache
      this.cache.set(cacheKey, {
        estimate,
        expiresAt: now + this.CACHE_TTL_MS,
      });

      // Periodic garbage collection if cache grows beyond 200 entries
      if (this.cache.size > 200) {
        for (const [key, entry] of this.cache.entries()) {
          if (entry.expiresAt <= now) {
            this.cache.delete(key);
          }
        }
      }
    }

    return estimate;
  }

  /**
   * Clears the routing cache (useful for tests).
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const routingService = new RoutingService();

/**
 * Generates an official Google Maps navigation deep link.
 * Does not build in-app navigation; Google Maps handles turn-by-turn navigation.
 */
export function generateGoogleMapsNavigationUrl(
  origin: Coordinates | string,
  destination: Coordinates,
  destinationName?: string
): string {
  const destParam = destinationName
    ? `${destination.latitude},${destination.longitude} (${encodeURIComponent(destinationName)})`
    : `${destination.latitude},${destination.longitude}`;

  let originParam = '';
  if (typeof origin === 'string') {
    originParam = encodeURIComponent(origin.trim());
  } else {
    originParam = `${origin.latitude},${origin.longitude}`;
  }

  return `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${encodeURIComponent(destParam)}&travelmode=driving`;
}
