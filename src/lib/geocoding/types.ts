import { Coordinates } from '../routing/types';

export interface GeocodingResult {
  placeName: string;
  formattedAddress: string;
  coordinates: Coordinates;
  state?: string;
  district?: string;
  provider: 'internal_dataset' | 'google' | 'nominatim';
}

export interface IGeocodingProvider {
  geocode(query: string): Promise<GeocodingResult[]>;
  reverseGeocode(coordinates: Coordinates): Promise<GeocodingResult | null>;
}
