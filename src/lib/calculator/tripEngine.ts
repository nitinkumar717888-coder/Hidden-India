/**
 * HIDDEN INDIA — PURE TRIP & FUEL CALCULATION ENGINE
 * Pure, deterministic mathematical engine for trip and energy calculations.
 * Completely decoupled from routing APIs, databases, or external services.
 */

import {
  CostBreakdownItem,
  CostComponentInput,
  TripCalculationInput,
  TripCalculationResult,
  VEHICLE_PROFILES,
  VehicleCategory,
} from './types';

export class TripEngineValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TripEngineValidationError';
  }
}

/**
 * Rounds a number to a fixed decimal precision avoiding floating-point drift.
 */
export function roundTo(num: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

/**
 * Formats Indian Rupee currency strings cleanly.
 */
export function formatCurrencyINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

/**
 * Validates calculation input parameters strictly.
 * Rejects negative numbers, zero distances, zero efficiencies, and NaNs.
 */
function validateInput(input: TripCalculationInput): void {
  if (!input) {
    throw new TripEngineValidationError('Calculation input is required.');
  }

  if (
    typeof input.oneWayDistanceKm !== 'number' ||
    isNaN(input.oneWayDistanceKm) ||
    !isFinite(input.oneWayDistanceKm) ||
    input.oneWayDistanceKm <= 0
  ) {
    throw new TripEngineValidationError(
      `Distance must be a positive number. Received: ${input.oneWayDistanceKm}`
    );
  }

  if (!['ONE_WAY', 'ROUND_TRIP'].includes(input.tripType)) {
    throw new TripEngineValidationError(`Invalid trip type: ${input.tripType}`);
  }

  if (!VEHICLE_PROFILES[input.vehicleType]) {
    throw new TripEngineValidationError(`Unsupported vehicle type: ${input.vehicleType}`);
  }

  if (input.customEfficiency !== undefined && input.customEfficiency !== null) {
    if (
      typeof input.customEfficiency !== 'number' ||
      isNaN(input.customEfficiency) ||
      !isFinite(input.customEfficiency) ||
      input.customEfficiency <= 0
    ) {
      throw new TripEngineValidationError(
        `Custom vehicle efficiency must be a positive number. Received: ${input.customEfficiency}`
      );
    }
  }

  if (input.fuelPricePerUnit !== undefined && input.fuelPricePerUnit !== null) {
    if (
      typeof input.fuelPricePerUnit !== 'number' ||
      isNaN(input.fuelPricePerUnit) ||
      !isFinite(input.fuelPricePerUnit) ||
      input.fuelPricePerUnit < 0
    ) {
      throw new TripEngineValidationError(
        `Fuel/energy price must be non-negative. Received: ${input.fuelPricePerUnit}`
      );
    }
  }

  // Validate optional cost components
  const validateCost = (component?: CostComponentInput, name: string = 'cost') => {
    if (!component) return;
    if (component.status === 'KNOWN_AMOUNT' || component.status === 'USER_PROVIDED') {
      if (
        typeof component.amount !== 'number' ||
        isNaN(component.amount) ||
        !isFinite(component.amount) ||
        component.amount < 0
      ) {
        throw new TripEngineValidationError(
          `${name} amount must be non-negative when status is ${component.status}. Received: ${component.amount}`
        );
      }
    }
  };

  validateCost(input.tolls, 'Tolls');
  validateCost(input.parking, 'Parking');
  validateCost(input.entryFee, 'Entry fee');
}

/**
 * Pure calculation function.
 * Accepts structured inputs, executes deterministic mathematics, and returns structured result.
 */
export function calculateTripCost(input: TripCalculationInput): TripCalculationResult {
  validateInput(input);

  const profile = VEHICLE_PROFILES[input.vehicleType];
  const isCustomEfficiency =
    input.customEfficiency !== undefined &&
    input.customEfficiency !== null &&
    input.customEfficiency > 0;

  const efficiencyUsed = isCustomEfficiency
    ? input.customEfficiency!
    : profile.defaultEfficiency;

  const isRoundTrip = input.tripType === 'ROUND_TRIP';
  const totalDistanceKm = roundTo(
    isRoundTrip ? input.oneWayDistanceKm * 2 : input.oneWayDistanceKm,
    2
  );

  let energyRequired: number;
  let energyUnit: 'litres' | 'kg' | 'kWh';

  if (input.vehicleType === 'EV') {
    // EV formula: (totalDistanceKm / 100) * kWhPer100Km
    energyRequired = roundTo((totalDistanceKm / 100) * efficiencyUsed, 2);
    energyUnit = 'kWh';
  } else {
    // Combustion formula: totalDistanceKm / efficiency
    energyRequired = roundTo(totalDistanceKm / efficiencyUsed, 2);
    energyUnit = input.vehicleType === 'CNG_CAR' ? 'kg' : 'litres';
  }

  // Fuel price determination
  const fuelPricePerUnit =
    input.fuelPricePerUnit !== undefined && input.fuelPricePerUnit !== null
      ? input.fuelPricePerUnit
      : profile.defaultFuelPriceEstimate;

  const fuelPricePrecision = input.fuelPricePrecision || (
    input.fuelPricePerUnit !== undefined && input.fuelPricePerUnit !== null
      ? 'USER_PROVIDED'
      : 'ESTIMATED'
  );

  // Fuel / Charging Cost
  const fuelCost = roundTo(energyRequired * fuelPricePerUnit, 2);

  // Prepare Breakdown Items
  const breakdown: CostBreakdownItem[] = [];
  const uncertaintyNotes: string[] = [];
  let knownSubtotal = 0;
  let hasUnknownComponents = false;

  // 1. Fuel / Energy
  knownSubtotal += fuelCost;
  breakdown.push({
    id: 'fuel_or_charging',
    title: input.vehicleType === 'EV' ? 'EV Charging' : `${profile.fuelType} Fuel`,
    status: fuelPricePrecision === 'USER_PROVIDED' ? 'USER_PROVIDED' : 'KNOWN_AMOUNT',
    precision: fuelPricePrecision,
    amount: fuelCost,
    formattedAmount: formatCurrencyINR(fuelCost),
    details: `${energyRequired} ${energyUnit} @ ₹${fuelPricePerUnit.toFixed(2)}/${profile.fuelType === 'ELECTRICITY' ? 'kWh' : input.vehicleType === 'CNG_CAR' ? 'kg' : 'L'} (${
      isCustomEfficiency ? 'Using your vehicle efficiency' : 'Estimated default efficiency'
    })`,
  });

  // 2. Tolls Handling
  // For round trips, tolls typically apply both ways unless specified
  const tollMultiplier = isRoundTrip ? 2 : 1;
  const tollsInput = input.tolls;
  if (!tollsInput || tollsInput.status === 'UNKNOWN') {
    hasUnknownComponents = true;
    breakdown.push({
      id: 'tolls',
      title: 'Highway Tolls',
      status: 'UNKNOWN',
      precision: 'UNAVAILABLE',
      amount: null,
      formattedAmount: 'Unavailable',
      details: 'Toll estimate unavailable along this route segment.',
    });
    uncertaintyNotes.push('Highway toll costs are currently unavailable for this route.');
  } else if (tollsInput.status === 'FREE') {
    breakdown.push({
      id: 'tolls',
      title: 'Highway Tolls',
      status: 'FREE',
      precision: 'VERIFIED',
      amount: 0,
      formattedAmount: 'Free / No tolls',
      details: 'No highway toll plazas on this specific route.',
    });
  } else {
    const tollAmount = roundTo((tollsInput.amount || 0) * tollMultiplier, 2);
    knownSubtotal += tollAmount;
    breakdown.push({
      id: 'tolls',
      title: 'Highway Tolls',
      status: tollsInput.status,
      precision: tollsInput.status === 'USER_PROVIDED' ? 'USER_PROVIDED' : 'ESTIMATED',
      amount: tollAmount,
      formattedAmount: formatCurrencyINR(tollAmount),
      details: isRoundTrip
        ? `₹${tollsInput.amount} per direction × 2 (round trip)`
        : 'Estimated highway toll tariff',
    });
  }

  // 3. Parking Handling
  const parkingInput = input.parking;
  if (!parkingInput || parkingInput.status === 'UNKNOWN') {
    hasUnknownComponents = true;
    breakdown.push({
      id: 'parking',
      title: 'Parking Fee',
      status: 'UNKNOWN',
      precision: 'UNAVAILABLE',
      amount: null,
      formattedAmount: 'Unavailable',
      details: 'Parking tariff unknown or not officially documented.',
    });
    uncertaintyNotes.push('Parking charge information is not officially verified.');
  } else if (parkingInput.status === 'FREE') {
    breakdown.push({
      id: 'parking',
      title: 'Parking Fee',
      status: 'FREE',
      precision: 'VERIFIED',
      amount: 0,
      formattedAmount: 'Free',
      details: 'Open or verified free parking at destination site.',
    });
  } else {
    const parkingAmount = roundTo(parkingInput.amount || 0, 2);
    knownSubtotal += parkingAmount;
    breakdown.push({
      id: 'parking',
      title: 'Parking Fee',
      status: parkingInput.status,
      precision: parkingInput.status === 'USER_PROVIDED' ? 'USER_PROVIDED' : 'VERIFIED',
      amount: parkingAmount,
      formattedAmount: formatCurrencyINR(parkingAmount),
      details: 'Destination parking tariff',
    });
  }

  // 4. Destination Entry Fee Handling
  const entryInput = input.entryFee;
  if (!entryInput || entryInput.status === 'UNKNOWN') {
    hasUnknownComponents = true;
    breakdown.push({
      id: 'entry_fee',
      title: 'Destination Entry',
      status: 'UNKNOWN',
      precision: 'UNAVAILABLE',
      amount: null,
      formattedAmount: 'Unavailable',
      details: 'Official entrance tariff not verified in database.',
    });
    uncertaintyNotes.push('Destination entry fee is unverified or unknown.');
  } else if (entryInput.status === 'FREE') {
    breakdown.push({
      id: 'entry_fee',
      title: 'Destination Entry',
      status: 'FREE',
      precision: 'VERIFIED',
      amount: 0,
      formattedAmount: 'Free entry',
      details: 'Public access destination with no ticket requirement.',
    });
  } else {
    const entryAmount = roundTo(entryInput.amount || 0, 2);
    knownSubtotal += entryAmount;
    breakdown.push({
      id: 'entry_fee',
      title: 'Destination Entry',
      status: entryInput.status,
      precision: entryInput.status === 'USER_PROVIDED' ? 'USER_PROVIDED' : 'VERIFIED',
      amount: entryAmount,
      formattedAmount: formatCurrencyINR(entryAmount),
      details: entryInput.verifiedAt
        ? `Verified entry tariff (last checked: ${new Date(entryInput.verifiedAt).toLocaleDateString('en-IN')})`
        : 'Entry tariff per visitor',
    });
  }

  knownSubtotal = roundTo(knownSubtotal, 2);

  // Total Presentation: Honest estimation
  // If there are unknown components, render as ₹X,XXX+ (minimum known estimate)
  const totalDisplay = hasUnknownComponents
    ? `${formatCurrencyINR(knownSubtotal)}+`
    : formatCurrencyINR(knownSubtotal);

  return {
    oneWayDistanceKm: input.oneWayDistanceKm,
    totalDistanceKm,
    tripType: input.tripType,
    vehicleType: input.vehicleType,
    fuelType: profile.fuelType,
    efficiencyUsed,
    efficiencyUnit: profile.efficiencyUnit,
    isCustomEfficiency,
    efficiencyLabel: isCustomEfficiency
      ? 'Using your vehicle efficiency'
      : 'Estimated default',
    energyRequired,
    energyUnit,
    fuelPricePerUnit,
    fuelPricePrecision,
    fuelPriceSource: input.fuelPriceSource,
    fuelPriceVerifiedAt: input.fuelPriceVerifiedAt,
    breakdown,
    knownSubtotal,
    hasUnknownComponents,
    totalDisplay,
    uncertaintyNotes,
  };
}
