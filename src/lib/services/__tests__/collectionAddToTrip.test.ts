import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TripService } from '../trip-service';
import { db } from '../../db';

vi.mock('../../db', () => ({
  db: {
    query: {
      trips: {
        findFirst: vi.fn(),
      },
      tripDestinations: {
        findMany: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    select: vi.fn(),
  },
}));

describe('TripService - Add Collection to Trip (Invariants & Limits)', () => {
  let service: TripService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TripService();
  });

  it('rejects adding destinations to a trip owned by another user', async () => {
    vi.mocked(db!.query.trips.findFirst).mockResolvedValue(undefined);

    await expect(
      service.addDestinationsToTrip('user-attacker', 'trip-victim', ['dest-1', 'dest-2'])
    ).rejects.toThrow('Trip not found or unauthorized.');
  });

  it('adds destinations and skips duplicate destinations already in trip', async () => {
    // Mock user's trip found
    vi.mocked(db!.query.trips.findFirst).mockResolvedValue({
      id: 'trip-1',
      name: 'Weekend Getaway',
    } as any);

    // Trip currently contains Dest A (sequence 1)
    vi.mocked(db!.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue([
            { destinationId: 'dest-A', sequence: 1 },
          ]),
        }),
      }),
    } as any);

    const valuesMock = vi.fn().mockResolvedValue(undefined);
    vi.mocked(db!.insert).mockReturnValue({ values: valuesMock } as any);

    const updateWhereMock = vi.fn().mockResolvedValue(undefined);
    const setMock = vi.fn().mockReturnValue({ where: updateWhereMock });
    vi.mocked(db!.update).mockReturnValue({ set: setMock } as any);

    // User attempts to add [Dest A, Dest B, Dest C]
    const result = await service.addDestinationsToTrip('user-1', 'trip-1', [
      'dest-A',
      'dest-B',
      'dest-C',
    ]);

    expect(result.success).toBe(true);
    expect(result.addedCount).toBe(2);
    expect(result.skippedDuplicatesCount).toBe(1);
    expect(result.currentTotal).toBe(3); // 1 existing + 2 added
    expect(result.message).toContain('2 destinations added');
    expect(result.message).toContain('1 destination was already in the trip');

    // db.insert should have been called twice (for Dest B and Dest C)
    expect(valuesMock).toHaveBeenCalledTimes(2);
    // Dest B sequence should be 2, Dest C should be 3
    expect(valuesMock).toHaveBeenNthCalledWith(1, {
      tripId: 'trip-1',
      destinationId: 'dest-B',
      sequence: 2,
    });
    expect(valuesMock).toHaveBeenNthCalledWith(2, {
      tripId: 'trip-1',
      destinationId: 'dest-C',
      sequence: 3,
    });
  });

  it('strictly enforces the 10-destination maximum cap when adding to trip with partial capacity', async () => {
    vi.mocked(db!.query.trips.findFirst).mockResolvedValue({
      id: 'trip-1',
      name: 'Road Trip',
    } as any);

    // Trip already has 8 destinations
    const existingWaypoints = Array.from({ length: 8 }, (_, i) => ({
      destinationId: `existing-dest-${i + 1}`,
      sequence: i + 1,
    }));

    vi.mocked(db!.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(existingWaypoints),
        }),
      }),
    } as any);

    // Attempting to add 5 new destinations (8 + 5 = 13 > 10) must throw
    await expect(
      service.addDestinationsToTrip('user-1', 'trip-1', [
        'new-1',
        'new-2',
        'new-3',
        'new-4',
        'new-5',
      ])
    ).rejects.toThrow('Cannot add 5 destinations. A trip can contain a maximum of 10 destinations (current: 8).');
  });

  it('allows adding up to the remaining capacity', async () => {
    vi.mocked(db!.query.trips.findFirst).mockResolvedValue({
      id: 'trip-1',
      name: 'Road Trip',
    } as any);

    // Trip already has 8 destinations
    const existingWaypoints = Array.from({ length: 8 }, (_, i) => ({
      destinationId: `existing-dest-${i + 1}`,
      sequence: i + 1,
    }));

    vi.mocked(db!.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(existingWaypoints),
        }),
      }),
    } as any);

    const valuesMock = vi.fn().mockResolvedValue(undefined);
    vi.mocked(db!.insert).mockReturnValue({ values: valuesMock } as any);

    const updateWhereMock = vi.fn().mockResolvedValue(undefined);
    const setMock = vi.fn().mockReturnValue({ where: updateWhereMock });
    vi.mocked(db!.update).mockReturnValue({ set: setMock } as any);

    // Adding exactly 2 destinations (8 + 2 = 10) must succeed
    const result = await service.addDestinationsToTrip('user-1', 'trip-1', ['new-1', 'new-2']);
    expect(result.success).toBe(true);
    expect(result.addedCount).toBe(2);
    expect(result.currentTotal).toBe(10);
  });

  it('createTripFromDestinations strictly enforces 10-destination cap for new trips', async () => {
    // Array with 12 destinations
    const tooManyDests = Array.from({ length: 12 }, (_, i) => `dest-${i + 1}`);

    await expect(
      service.createTripFromDestinations('user-1', 'Too Big Trail', tooManyDests)
    ).rejects.toThrow('Cannot create trip with 12 destinations. Maximum allowed is 10.');
  });

  it('createTripFromDestinations creates trip and inserts waypoints sequentially', async () => {
    const returningMock = vi.fn().mockResolvedValue([{ id: 'new-trip-1', name: 'Mughal Highway' }]);
    const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
    vi.mocked(db!.insert).mockReturnValue({ values: valuesMock } as any);

    const result = await service.createTripFromDestinations('user-1', 'Mughal Highway', [
      'dest-1',
      'dest-2',
      'dest-3',
    ]);

    expect(result.trip.id).toBe('new-trip-1');
    expect(result.destinationCount).toBe(3);
  });
});
