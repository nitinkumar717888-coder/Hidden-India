import { Coordinates } from '../routing/types';
import { GeocodingResult, IGeocodingProvider } from './types';

/**
 * Built-in coordinate dataset for primary northern hubs and key junctions.
 * Provides instant, zero-cost, offline geocoding without external API quotas.
 */
const REGIONAL_HUBS: Record<string, { lat: number; lng: number; state: string; district: string }> = {
  chandigarh: { lat: 30.7333, lng: 76.7794, state: 'Chandigarh', district: 'Chandigarh' },
  delhi: { lat: 28.6139, lng: 77.209, state: 'Delhi', district: 'New Delhi' },
  'new delhi': { lat: 28.6139, lng: 77.209, state: 'Delhi', district: 'New Delhi' },
  amritsar: { lat: 31.634, lng: 74.8723, state: 'Punjab', district: 'Amritsar' },
  jalandhar: { lat: 31.326, lng: 75.5762, state: 'Punjab', district: 'Jalandhar' },
  ludhiana: { lat: 30.901, lng: 75.8573, state: 'Punjab', district: 'Ludhiana' },
  patiala: { lat: 30.3398, lng: 76.3869, state: 'Punjab', district: 'Patiala' },
  bathinda: { lat: 30.211, lng: 74.9455, state: 'Punjab', district: 'Bathinda' },
  mohali: { lat: 30.7046, lng: 76.7179, state: 'Punjab', district: 'SAS Nagar' },
  shimla: { lat: 31.1048, lng: 77.1734, state: 'Himachal Pradesh', district: 'Shimla' },
  dharamshala: { lat: 32.219, lng: 76.3234, state: 'Himachal Pradesh', district: 'Kangra' },
  manali: { lat: 32.2432, lng: 77.1892, state: 'Himachal Pradesh', district: 'Kullu' },
  kullu: { lat: 31.9579, lng: 77.1095, state: 'Himachal Pradesh', district: 'Kullu' },
  solan: { lat: 30.9045, lng: 77.0967, state: 'Himachal Pradesh', district: 'Solan' },
  mandi: { lat: 31.7087, lng: 76.932, state: 'Himachal Pradesh', district: 'Mandi' },
  bilaspur: { lat: 31.3444, lng: 76.757, state: 'Himachal Pradesh', district: 'Bilaspur' },
  panchkula: { lat: 30.6942, lng: 76.8606, state: 'Haryana', district: 'Panchkula' },
  kurukshetra: { lat: 29.9695, lng: 76.8783, state: 'Haryana', district: 'Kurukshetra' },
  ambala: { lat: 30.3782, lng: 76.7767, state: 'Haryana', district: 'Ambala' },
  karnal: { lat: 29.6857, lng: 76.9905, state: 'Haryana', district: 'Karnal' },
  panipat: { lat: 29.3909, lng: 76.9635, state: 'Haryana', district: 'Panipat' },
  gurugram: { lat: 28.4595, lng: 77.0266, state: 'Haryana', district: 'Gurugram' },
  faridabad: { lat: 28.4089, lng: 77.3178, state: 'Haryana', district: 'Faridabad' },
  rohtak: { lat: 28.8955, lng: 76.6066, state: 'Haryana', district: 'Rohtak' },
  hisar: { lat: 29.1492, lng: 75.7217, state: 'Haryana', district: 'Hisar' },
  noida: { lat: 28.5355, lng: 77.391, state: 'Uttar Pradesh', district: 'Gautam Buddha Nagar' },
};

export class GeocodingProvider implements IGeocodingProvider {
  async geocode(query: string): Promise<GeocodingResult[]> {
    const normalized = query.toLowerCase().trim();
    const results: GeocodingResult[] = [];

    for (const [key, hub] of Object.entries(REGIONAL_HUBS)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        results.push({
          placeName: key.charAt(0).toUpperCase() + key.slice(1),
          formattedAddress: `${key.charAt(0).toUpperCase() + key.slice(1)}, ${hub.state}, India`,
          coordinates: { latitude: hub.lat, longitude: hub.lng },
          state: hub.state,
          district: hub.district,
          provider: 'internal_dataset',
        });
      }
    }

    return results;
  }

  async reverseGeocode(coords: Coordinates): Promise<GeocodingResult | null> {
    // Basic approximate reverse lookup against known regional hubs
    for (const [key, hub] of Object.entries(REGIONAL_HUBS)) {
      const dLat = Math.abs(coords.latitude - hub.lat);
      const dLng = Math.abs(coords.longitude - hub.lng);
      if (dLat < 0.15 && dLng < 0.15) {
        return {
          placeName: key.charAt(0).toUpperCase() + key.slice(1),
          formattedAddress: `${key.charAt(0).toUpperCase() + key.slice(1)}, ${hub.state}, India`,
          coordinates: { latitude: hub.lat, longitude: hub.lng },
          state: hub.state,
          district: hub.district,
          provider: 'internal_dataset',
        };
      }
    }
    return null;
  }
}

export const geocodingProvider = new GeocodingProvider();
