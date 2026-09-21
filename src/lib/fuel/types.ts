/**
 * HIDDEN INDIA — FUEL & ENERGY PRICING TYPES
 * Strict models for geographic fuel tariffs and honest verification tracking.
 */

import { FuelCategory } from '../calculator/types';

export type FuelLocationPrecision = 'CITY' | 'DISTRICT' | 'STATE' | 'USER_PROVIDED';

export interface FuelPriceRecord {
  fuelType: FuelCategory;
  state: string;
  district?: string | null;
  city?: string | null;
  pricePerUnit: number;
  unit: 'litre' | 'kg' | 'kWh';
  currency: 'INR';
  source: string;
  verifiedAt: string; // ISO 8601 string
  precision: FuelLocationPrecision;
  isUserProvided?: boolean;
  isHistoricalBaseline?: boolean;
  provenanceNote?: string;
}

export interface FuelPriceQuery {
  fuelType: FuelCategory;
  state?: string | null;
  district?: string | null;
  city?: string | null;
}

export interface IFuelPriceProvider {
  getFuelPrice(query: FuelPriceQuery): Promise<FuelPriceRecord | null>;
}
