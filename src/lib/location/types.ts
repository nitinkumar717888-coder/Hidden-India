/**
 * Location permission status.
 */
export type LocationPermissionState = 'prompt' | 'granted' | 'denied' | 'unavailable';

/**
 * Ephemeral user coordinates obtained with explicit consent.
 */
export interface UserCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  timestamp: number;
}

/**
 * Starting location representation (GPS coordinates or manually entered Indian city/area/PIN).
 */
export interface StartingLocation {
  type: 'coordinates' | 'named_place';
  label: string; // e.g. "Chandigarh, Sector 17" or "Current Location"
  latitude?: number;
  longitude?: number;
  state?: string;
  district?: string;
}

/**
 * Standard privacy disclaimer for location usage.
 */
export const LOCATION_PRIVACY_DISCLOSURE =
  'We use your location only in your browser to estimate travel distance, route time, and trip costs. Your precise coordinates are never stored on our servers without your explicit permission.';
