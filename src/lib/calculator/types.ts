/**
 * HIDDEN INDIA — TRIP & FUEL CALCULATION ENGINE TYPES
 * Pure, deterministic contracts for trip cost estimation.
 */

export type VehicleCategory =
  | 'PETROL_CAR'
  | 'DIESEL_CAR'
  | 'CNG_CAR'
  | 'MOTORCYCLE'
  | 'EV';

export type FuelCategory = 'PETROL' | 'DIESEL' | 'CNG' | 'ELECTRICITY';

export type TripType = 'ONE_WAY' | 'ROUND_TRIP';

export type CostCertainty = 'KNOWN_AMOUNT' | 'FREE' | 'UNKNOWN' | 'USER_PROVIDED';

export type PrecisionLevel =
  | 'VERIFIED'
  | 'ESTIMATED'
  | 'USER_PROVIDED'
  | 'UNAVAILABLE'
  | 'CITY'
  | 'DISTRICT'
  | 'STATE';

export interface VehicleProfile {
  type: VehicleCategory;
  label: string;
  fuelType: FuelCategory;
  defaultEfficiency: number;
  efficiencyUnit: 'km/l' | 'km/kg' | 'kWh/100km';
  efficiencyLabel: string;
  defaultFuelPriceEstimate: number; // Regional baseline
  notes: string;
}

export const VEHICLE_PROFILES: Record<VehicleCategory, VehicleProfile> = {
  PETROL_CAR: {
    type: 'PETROL_CAR',
    label: 'Petrol Car',
    fuelType: 'PETROL',
    defaultEfficiency: 14.5,
    efficiencyUnit: 'km/l',
    efficiencyLabel: 'km / litre',
    defaultFuelPriceEstimate: 94.5,
    notes: 'Estimated default for average petrol hatchback/compact sedan in mixed driving.',
  },
  DIESEL_CAR: {
    type: 'DIESEL_CAR',
    label: 'Diesel Car',
    fuelType: 'DIESEL',
    defaultEfficiency: 18.0,
    efficiencyUnit: 'km/l',
    efficiencyLabel: 'km / litre',
    defaultFuelPriceEstimate: 87.5,
    notes: 'Estimated default for modern diesel sedan/SUV under standard highway conditions.',
  },
  CNG_CAR: {
    type: 'CNG_CAR',
    label: 'CNG Car',
    fuelType: 'CNG',
    defaultEfficiency: 22.0,
    efficiencyUnit: 'km/kg',
    efficiencyLabel: 'km / kg',
    defaultFuelPriceEstimate: 76.0,
    notes: 'Estimated default for factory-fitted CNG passenger vehicles.',
  },
  MOTORCYCLE: {
    type: 'MOTORCYCLE',
    label: 'Motorcycle',
    fuelType: 'PETROL',
    defaultEfficiency: 42.0,
    efficiencyUnit: 'km/l',
    efficiencyLabel: 'km / litre',
    defaultFuelPriceEstimate: 94.5,
    notes: 'Estimated default for 150cc-250cc commuter and touring motorcycles.',
  },
  EV: {
    type: 'EV',
    label: 'Electric Vehicle (EV)',
    fuelType: 'ELECTRICITY',
    defaultEfficiency: 15.5, // kWh per 100 km
    efficiencyUnit: 'kWh/100km',
    efficiencyLabel: 'kWh / 100 km',
    defaultFuelPriceEstimate: 9.5, // Estimated electricity cost INR per kWh
    notes: 'Estimated default: 15.5 kWh/100km at ₹9.50/kWh average public/home charging blend.',
  },
};

export interface CostComponentInput {
  status: CostCertainty;
  amount?: number | null;
  label?: string;
  verificationSource?: string;
  verifiedAt?: string;
}

export interface TripCalculationInput {
  oneWayDistanceKm: number;
  tripType: TripType;
  vehicleType: VehicleCategory;
  customEfficiency?: number | null;
  fuelPricePerUnit?: number | null;
  fuelPriceSource?: string;
  fuelPriceVerifiedAt?: string;
  fuelPricePrecision?: PrecisionLevel;
  tolls?: CostComponentInput;
  parking?: CostComponentInput;
  entryFee?: CostComponentInput;
}

export interface CostBreakdownItem {
  id: 'fuel_or_charging' | 'tolls' | 'parking' | 'entry_fee';
  title: string;
  status: CostCertainty;
  precision: PrecisionLevel;
  amount: number | null; // null if unknown
  formattedAmount: string; // e.g. "₹1,420", "Free", "Unavailable"
  details: string;
}

export interface TripCalculationResult {
  oneWayDistanceKm: number;
  totalDistanceKm: number;
  tripType: TripType;
  vehicleType: VehicleCategory;
  fuelType: FuelCategory;
  efficiencyUsed: number;
  efficiencyUnit: string;
  isCustomEfficiency: boolean;
  efficiencyLabel: string;
  energyRequired: number; // Litres, kg, or kWh
  energyUnit: 'litres' | 'kg' | 'kWh';
  fuelPricePerUnit: number | null;
  fuelPricePrecision: PrecisionLevel;
  fuelPriceSource?: string;
  fuelPriceVerifiedAt?: string;
  breakdown: CostBreakdownItem[];
  knownSubtotal: number;
  hasUnknownComponents: boolean;
  totalDisplay: string; // e.g. "₹1,870" or "₹1,420+"
  uncertaintyNotes: string[];
}
