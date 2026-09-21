import { LocationPermissionState, UserCoordinates } from './types';

/**
 * Service to request browser geolocation ONLY upon explicit user interaction.
 * NEVER invokes navigator.geolocation silently or automatically on page load.
 */
export class LocationService {
  /**
   * Checks current permission status without prompting the user.
   */
  async checkPermissionStatus(): Promise<LocationPermissionState> {
    if (typeof window === 'undefined' || !navigator.permissions) {
      return 'unavailable';
    }

    try {
      const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      return status.state as LocationPermissionState;
    } catch {
      return 'prompt';
    }
  }

  /**
   * Explicitly requests the current coordinates with a high-accuracy fallback.
   * Must be called directly from a user click handler.
   */
  async requestCurrentLocation(): Promise<UserCoordinates> {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      throw new Error(
        'Geolocation is not supported by your browser. Please enter your city or PIN code manually.'
      );
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracyMeters: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          let message = 'Unable to determine your location.';
          if (error.code === error.PERMISSION_DENIED) {
            message =
              "We couldn't access your location because permission was denied. Enter your starting city or PIN code manually to calculate your route.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = 'Location information is currently unavailable from your device.';
          } else if (error.code === error.TIMEOUT) {
            message = 'The location request timed out. Please enter your city manually.';
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: false, // Low power, faster resolution
          timeout: 10000,
          maximumAge: 300000, // 5 minutes cache
        }
      );
    });
  }
}

export const locationService = new LocationService();
