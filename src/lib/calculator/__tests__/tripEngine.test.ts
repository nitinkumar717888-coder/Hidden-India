import { describe, it, expect } from 'vitest';
import {
  calculateTripCost,
  TripEngineValidationError,
  roundTo,
} from '../tripEngine';
import { VEHICLE_PROFILES } from '../types';

describe('TripEngine Pure Calculation Unit Tests', () => {
  describe('Petrol Car Calculations', () => {
    it('calculates one-way petrol trip with default efficiency and price', () => {
      const result = calculateTripCost({
        oneWayDistanceKm: 100,
        tripType: 'ONE_WAY',
        vehicleType: 'PETROL_CAR',
      });

      const defaultProfile = VEHICLE_PROFILES.PETROL_CAR;
      const expectedEnergy = roundTo(100 / defaultProfile.defaultEfficiency, 2);
      const expectedFuelCost = roundTo(expectedEnergy * defaultProfile.defaultFuelPriceEstimate, 2);

      expect(result.totalDistanceKm).toBe(100);
      expect(result.isCustomEfficiency).toBe(false);
      expect(result.energyUnit).toBe('litres');
      expect(result.energyRequired).toBe(expectedEnergy);
      expect(result.breakdown.find((b) => b.id === 'fuel_or_charging')?.amount).toBe(expectedFuelCost);
      expect(result.efficiencyLabel).toBe('Estimated default');
    });

    it('calculates round-trip petrol trip (doubling distance and fuel)', () => {
      const result = calculateTripCost({
        oneWayDistanceKm: 150,
        tripType: 'ROUND_TRIP',
        vehicleType: 'PETROL_CAR',
        fuelPricePerUnit: 95.0,
      });

      expect(result.totalDistanceKm).toBe(300);
      const expectedEnergy = roundTo(300 / VEHICLE_PROFILES.PETROL_CAR.defaultEfficiency, 2);
      expect(result.energyRequired).toBe(expectedEnergy);
      expect(result.breakdown.find((b) => b.id === 'fuel_or_charging')?.amount).toBe(
        roundTo(expectedEnergy * 95.0, 2)
      );
    });

    it('uses custom vehicle mileage override and displays "Using your vehicle efficiency"', () => {
      const result = calculateTripCost({
        oneWayDistanceKm: 180,
        tripType: 'ONE_WAY',
        vehicleType: 'PETROL_CAR',
        customEfficiency: 18.0, // 18 km/l instead of default 14.5
        fuelPricePerUnit: 100.0,
      });

      expect(result.isCustomEfficiency).toBe(true);
      expect(result.efficiencyUsed).toBe(18.0);
      expect(result.efficiencyLabel).toBe('Using your vehicle efficiency');
      // 180 / 18 = 10 litres
      expect(result.energyRequired).toBe(10);
      // 10 * 100 = 1000
      expect(result.breakdown.find((b) => b.id === 'fuel_or_charging')?.amount).toBe(1000);
    });
  });

  describe('Diesel Car Calculations', () => {
    it('calculates one-way diesel trip', () => {
      const result = calculateTripCost({
        oneWayDistanceKm: 200,
        tripType: 'ONE_WAY',
        vehicleType: 'DIESEL_CAR',
        fuelPricePerUnit: 88.0,
      });

      expect(result.fuelType).toBe('DIESEL');
      expect(result.energyUnit).toBe('litres');
      const expectedEnergy = roundTo(200 / VEHICLE_PROFILES.DIESEL_CAR.defaultEfficiency, 2);
      expect(result.energyRequired).toBe(expectedEnergy);
    });

    it('calculates round-trip diesel with custom mileage', () => {
      const result = calculateTripCost({
        oneWayDistanceKm: 250,
        tripType: 'ROUND_TRIP',
        vehicleType: 'DIESEL_CAR',
        customEfficiency: 20.0,
        fuelPricePerUnit: 87.0,
      });

      expect(result.totalDistanceKm).toBe(500);
      // 500 / 20 = 25 litres
      expect(result.energyRequired).toBe(25);
      // 25 * 87 = 2175
      expect(result.breakdown.find((b) => b.id === 'fuel_or_charging')?.amount).toBe(2175);
    });
  });

  describe('CNG Car Calculations', () => {
    it('handles CNG with kg units and proper efficiency', () => {
      const result = calculateTripCost({
        oneWayDistanceKm: 110,
        tripType: 'ONE_WAY',
        vehicleType: 'CNG_CAR',
        customEfficiency: 22.0, // 22 km/kg
        fuelPricePerUnit: 75.0,
      });

      expect(result.fuelType).toBe('CNG');
      expect(result.energyUnit).toBe('kg');
      // 110 / 22 = 5 kg
      expect(result.energyRequired).toBe(5);
      expect(result.breakdown.find((b) => b.id === 'fuel_or_charging')?.amount).toBe(375);
    });
  });

  describe('Motorcycle Calculations', () => {
    it('calculates motorcycle travel with high efficiency', () => {
      const result = calculateTripCost({
        oneWayDistanceKm: 84,
        tripType: 'ONE_WAY',
        vehicleType: 'MOTORCYCLE',
        customEfficiency: 42.0,
        fuelPricePerUnit: 95.0,
      });

      expect(result.fuelType).toBe('PETROL');
      expect(result.energyUnit).toBe('litres');
      // 84 / 42 = 2.0 litres
      expect(result.energyRequired).toBe(2.0);
      expect(result.breakdown.find((b) => b.id === 'fuel_or_charging')?.amount).toBe(190);
    });
  });

  describe('EV (Electric Vehicle) Calculations', () => {
    it('calculates EV energy consumption using (distance / 100) * kWhPer100Km', () => {
      const result = calculateTripCost({
        oneWayDistanceKm: 200,
        tripType: 'ONE_WAY',
        vehicleType: 'EV',
        customEfficiency: 15.0, // 15 kWh per 100km
        fuelPricePerUnit: 10.0, // ₹10 per kWh
      });

      expect(result.fuelType).toBe('ELECTRICITY');
      expect(result.energyUnit).toBe('kWh');
      // (200 / 100) * 15 = 30 kWh
      expect(result.energyRequired).toBe(30);
      // 30 kWh * ₹10 = ₹300
      expect(result.breakdown.find((b) => b.id === 'fuel_or_charging')?.amount).toBe(300);
    });

    it('calculates EV round trip with electricity tariff', () => {
      const result = calculateTripCost({
        oneWayDistanceKm: 150,
        tripType: 'ROUND_TRIP',
        vehicleType: 'EV',
        customEfficiency: 16.0,
        fuelPricePerUnit: 8.5,
      });

      expect(result.totalDistanceKm).toBe(300);
      // (300 / 100) * 16 = 48 kWh
      expect(result.energyRequired).toBe(48);
      // 48 * 8.5 = 408
      expect(result.breakdown.find((b) => b.id === 'fuel_or_charging')?.amount).toBe(408);
    });
  });

  describe('Honest Estimation & Unknown Cost Handling (Unknown != 0)', () => {
    it('does NOT treat missing tolls as zero, flags unknown and marks total with +', () => {
      const result = calculateTripCost({
        oneWayDistanceKm: 100,
        tripType: 'ONE_WAY',
        vehicleType: 'PETROL_CAR',
        customEfficiency: 10.0,
        fuelPricePerUnit: 100.0, // Fuel = 1000
        parking: { status: 'KNOWN_AMOUNT', amount: 50 },
        entryFee: { status: 'KNOWN_AMOUNT', amount: 20 },
        tolls: { status: 'UNKNOWN' }, // Tolls unknown!
      });

      expect(result.hasUnknownComponents).toBe(true);
      const tollItem = result.breakdown.find((b) => b.id === 'tolls');
      expect(tollItem?.status).toBe('UNKNOWN');
      expect(tollItem?.amount).toBeNull();
      expect(tollItem?.formattedAmount).toBe('Unavailable');

      // Subtotal of known components: 1000 + 50 + 20 = 1070
      expect(result.knownSubtotal).toBe(1070);
      // Total display must be honest minimum estimate: ₹1,070+
      expect(result.totalDisplay).toBe('₹1,070+');
      expect(result.uncertaintyNotes.length).toBeGreaterThan(0);
    });

    it('handles verified FREE entry and FREE parking properly as ₹0 without unknown flag', () => {
      const result = calculateTripCost({
        oneWayDistanceKm: 100,
        tripType: 'ONE_WAY',
        vehicleType: 'PETROL_CAR',
        customEfficiency: 10.0,
        fuelPricePerUnit: 100.0, // Fuel = 1000
        tolls: { status: 'FREE', amount: 0 },
        parking: { status: 'FREE', amount: 0 },
        entryFee: { status: 'FREE', amount: 0 },
      });

      expect(result.hasUnknownComponents).toBe(false);
      expect(result.knownSubtotal).toBe(1000);
      expect(result.totalDisplay).toBe('₹1,000');
    });

    it('doubles toll amount on round trip when known amount is provided', () => {
      const result = calculateTripCost({
        oneWayDistanceKm: 100,
        tripType: 'ROUND_TRIP',
        vehicleType: 'PETROL_CAR',
        customEfficiency: 10.0,
        fuelPricePerUnit: 100.0, // Fuel = 200 * 10 = 2000
        tolls: { status: 'KNOWN_AMOUNT', amount: 120 }, // 120 * 2 = 240
        parking: { status: 'KNOWN_AMOUNT', amount: 50 }, // Parking is one-off
        entryFee: { status: 'KNOWN_AMOUNT', amount: 30 }, // Entry is one-off
      });

      expect(result.hasUnknownComponents).toBe(false);
      const tollItem = result.breakdown.find((b) => b.id === 'tolls');
      expect(tollItem?.amount).toBe(240);
      // 2000 + 240 + 50 + 30 = 2320
      expect(result.knownSubtotal).toBe(2320);
      expect(result.totalDisplay).toBe('₹2,320');
    });
  });

  describe('Strict Input Validation & Edge Cases', () => {
    it('throws validation error for zero distance', () => {
      expect(() =>
        calculateTripCost({
          oneWayDistanceKm: 0,
          tripType: 'ONE_WAY',
          vehicleType: 'PETROL_CAR',
        })
      ).toThrow(TripEngineValidationError);
    });

    it('throws validation error for negative distance', () => {
      expect(() =>
        calculateTripCost({
          oneWayDistanceKm: -50,
          tripType: 'ONE_WAY',
          vehicleType: 'PETROL_CAR',
        })
      ).toThrow(TripEngineValidationError);
    });

    it('throws validation error for zero or negative custom efficiency', () => {
      expect(() =>
        calculateTripCost({
          oneWayDistanceKm: 100,
          tripType: 'ONE_WAY',
          vehicleType: 'PETROL_CAR',
          customEfficiency: 0,
        })
      ).toThrow(TripEngineValidationError);

      expect(() =>
        calculateTripCost({
          oneWayDistanceKm: 100,
          tripType: 'ONE_WAY',
          vehicleType: 'PETROL_CAR',
          customEfficiency: -12,
        })
      ).toThrow(TripEngineValidationError);
    });

    it('throws validation error for negative fuel price', () => {
      expect(() =>
        calculateTripCost({
          oneWayDistanceKm: 100,
          tripType: 'ONE_WAY',
          vehicleType: 'PETROL_CAR',
          fuelPricePerUnit: -10,
        })
      ).toThrow(TripEngineValidationError);
    });

    it('throws validation error for invalid vehicle type', () => {
      expect(() =>
        calculateTripCost({
          oneWayDistanceKm: 100,
          tripType: 'ONE_WAY',
          // @ts-expect-error Testing invalid runtime input
          vehicleType: 'SPACESHIP',
        })
      ).toThrow(TripEngineValidationError);
    });

    it('never produces NaN in output fields', () => {
      const result = calculateTripCost({
        oneWayDistanceKm: 73.456,
        tripType: 'ROUND_TRIP',
        vehicleType: 'EV',
        customEfficiency: 14.8,
        fuelPricePerUnit: 9.35,
      });

      expect(Number.isNaN(result.totalDistanceKm)).toBe(false);
      expect(Number.isNaN(result.energyRequired)).toBe(false);
      expect(Number.isNaN(result.knownSubtotal)).toBe(false);
      expect(result.totalDisplay).not.toContain('NaN');
    });
  });
});
