import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateMultiStopItinerary, ItineraryWaypointInput } from '../multiStopCalculator';
import { routingService } from '../../routing/routing-provider';

describe('MultiStopCalculator Unit Tests', () => {
  const dummyStart = { latitude: 30.7333, longitude: 76.7794 }; // Chandigarh
  const dummyWaypoint1: ItineraryWaypointInput = {
    destinationId: 'dest-1',
    name: 'Kasauli Pine Trail',
    coordinates: { latitude: 30.9013, longitude: 76.9649 },
    visitInfo: {
      id: 'vi-1',
      destinationId: 'dest-1',
      entryFee: '₹50',
      currency: 'INR',
      feeType: 'per_person',
      isFeeVerified: true,
      openingInformation: 'Open 9 AM - 5 PM',
      parkingInformation: '₹100 dedicated lot',
      accessInformation: 'Paved road',
      contactInformation: null,
      bestTimeInformation: 'All year',
      sourceId: null,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const dummyWaypoint2: ItineraryWaypointInput = {
    destinationId: 'dest-2',
    name: 'Dagshai Heritage Jail',
    coordinates: { latitude: 30.8814, longitude: 77.0512 },
    visitInfo: {
      id: 'vi-2',
      destinationId: 'dest-2',
      entryFee: '₹30',
      currency: 'INR',
      feeType: 'per_person',
      isFeeVerified: true,
      openingInformation: 'Open 10 AM - 4 PM',
      parkingInformation: 'Unknown roadside space', // Unknown parking fee
      accessInformation: 'Narrow hill road',
      contactInformation: null,
      bestTimeInformation: 'Autumn',
      sourceId: null,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    },
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws an error if no waypoints are provided', async () => {
    await expect(
      calculateMultiStopItinerary({
        startLocation: dummyStart,
        startLocationLabel: 'Chandigarh',
        waypoints: [],
        vehicleType: 'PETROL_CAR',
      })
    ).rejects.toThrow('At least one destination waypoint is required.');
  });

  it('calculates round trip itinerary with multiple stops', async () => {
    // Mock routing service to return deterministic estimates
    vi.spyOn(routingService, 'calculateRoute').mockImplementation(async ({ origin, destination }) => ({
      distanceMeters: 50000,
      distanceKm: 50,
      durationSeconds: 3600,
      durationMinutes: 60,
      provider: 'GOOGLE_ROUTES',
      precision: 'ACTUAL_DRIVE',
      precisionLabel: 'Exact distance 50 km',
      isEstimated: false,
      tollEstimateINR: 40,
      hasTollInfo: true,
      disclaimer: 'Mocked route calculation',
    }));

    const result = await calculateMultiStopItinerary({
      startLocation: dummyStart,
      startLocationLabel: 'Chandigarh',
      waypoints: [dummyWaypoint1, dummyWaypoint2],
      vehicleType: 'PETROL_CAR',
      isRoundTrip: true,
    });

    // 3 segments: Chandigarh -> W1, W1 -> W2, W2 -> Chandigarh (Return)
    expect(result.segments).toHaveLength(3);
    expect(result.segments[0].fromName).toBe('Chandigarh');
    expect(result.segments[0].toName).toBe('Kasauli Pine Trail');
    expect(result.segments[1].fromName).toBe('Kasauli Pine Trail');
    expect(result.segments[1].toName).toBe('Dagshai Heritage Jail');
    expect(result.segments[2].fromName).toBe('Dagshai Heritage Jail');
    expect(result.segments[2].toName).toBe('Chandigarh (Return)');

    expect(result.totalDistanceKm).toBe(150); // 50 * 3
    expect(result.totalDurationMinutes).toBe(180); // 60 * 3

    // Cost calculation verification
    expect(result.costCalculation.totalDistanceKm).toBe(150);
    // Tolls: all 3 segments had 40 INR => total known tolls = 120
    const tollItem = result.costCalculation.breakdown.find((b) => b.id === 'tolls');
    expect(tollItem?.status).toBe('KNOWN_AMOUNT');
    expect(tollItem?.amount).toBe(120);

    // Parking: W1 had 100, but W2 had null (unknown) => overall status must be UNKNOWN
    const parkingItem = result.costCalculation.breakdown.find((b) => b.id === 'parking');
    expect(parkingItem?.status).toBe('UNKNOWN');

    // Entry fees: W1 had 50, W2 had 30 => total known = 80
    const entryItem = result.costCalculation.breakdown.find((b) => b.id === 'entry_fee');
    expect(entryItem?.status).toBe('KNOWN_AMOUNT');
    expect(entryItem?.amount).toBe(80);

    // Verify Google Maps URL
    expect(result.googleMapsUrl).toContain('https://www.google.com/maps/dir/?api=1');
    expect(result.googleMapsUrl).toContain(encodeURIComponent('30.7333,76.7794'));
    expect(result.googleMapsUrl).toContain('waypoints=');
    expect(result.googleMapsUrl).toContain('travelmode=driving');
  });

  it('calculates one-way itinerary without return leg', async () => {
    vi.spyOn(routingService, 'calculateRoute').mockResolvedValue({
      distanceMeters: 40000,
      distanceKm: 40,
      durationSeconds: 3000,
      durationMinutes: 50,
      provider: 'GOOGLE_ROUTES',
      precision: 'ACTUAL_DRIVE',
      precisionLabel: 'Exact distance 40 km',
      isEstimated: false,
      tollEstimateINR: null,
      hasTollInfo: false,
      disclaimer: 'Mocked route calculation',
    });

    const result = await calculateMultiStopItinerary({
      startLocation: dummyStart,
      startLocationLabel: 'Chandigarh',
      waypoints: [dummyWaypoint1],
      vehicleType: 'DIESEL_CAR',
      isRoundTrip: false,
    });

    // Only 1 segment: Chandigarh -> Kasauli Pine Trail
    expect(result.segments).toHaveLength(1);
    expect(result.segments[0].fromName).toBe('Chandigarh');
    expect(result.segments[0].toName).toBe('Kasauli Pine Trail');
    expect(result.totalDistanceKm).toBe(40);

    // Unknown tolls since routing did not have toll info
    const tollItem = result.costCalculation.breakdown.find((b) => b.id === 'tolls');
    expect(tollItem?.status).toBe('UNKNOWN');
  });

  it('throws an error if waypoints exceed 10 stops', async () => {
    const elevenWaypoints = Array.from({ length: 11 }, (_, i) => ({
      ...dummyWaypoint1,
      destinationId: `dest-${i + 1}`,
      name: `Waypoint ${i + 1}`,
    }));

    await expect(
      calculateMultiStopItinerary({
        startLocation: dummyStart,
        startLocationLabel: 'Chandigarh',
        waypoints: elevenWaypoints,
        vehicleType: 'PETROL_CAR',
      })
    ).rejects.toThrow('A trip itinerary can contain at most 10 destination waypoints.');
  });
});
