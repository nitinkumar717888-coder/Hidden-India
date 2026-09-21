/**
 * HIDDEN INDIA — ROUTING SYSTEM TYPES
 * Strict contracts for route calculation and navigational deep linking.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type RoutingProviderType = 'GOOGLE_ROUTES' | 'FALLBACK' | 'USER_PROVIDED';

export type RoutePrecision = 'ACTUAL_DRIVE' | 'APPROXIMATE_GEO';

export interface RouteRequest {
  origin: Coordinates | string; // Can be geographic coordinates or place query
  destination: Coordinates;
  originCoordinates?: Coordinates;
  travelMode?: 'DRIVING' | 'TWO_WHEELER';
}

export interface RouteEstimate {
  distanceMeters: number;
  distanceKm: number;
  durationSeconds: number;
  durationMinutes: number;
  provider: RoutingProviderType;
  precision: RoutePrecision;
  precisionLabel: string; // e.g. "Driving distance" vs "Approx. straight-line distance"
  isEstimated: boolean;
  tollEstimateINR?: number | null;
  hasTollInfo: boolean;
  disclaimer: string;
}

export interface IRoutingProvider {
  calculateRoute(request: RouteRequest): Promise<RouteEstimate>;
}
