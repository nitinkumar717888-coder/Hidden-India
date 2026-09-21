import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TripService } from '../trip-service';
import { db } from '../../db';

vi.mock('../../db', () => ({
  db: {
    query: {
      trips: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
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

describe('TripService Unit Tests', () => {
  let service: TripService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TripService();
  });

  describe('createTrip', () => {
    it('creates trip with given values and default fallback location', async () => {
      const mockTrip = {
        id: 'trip-1',
        userId: 'user-abc',
        name: 'Monsoon Retreat',
        startLocation: 'Chandigarh',
        startLocationLabel: 'Chandigarh',
        startLatitude: 30.7333,
        startLongitude: 76.7794,
        isStartLocationSaved: false,
        vehicleType: 'PETROL_CAR',
        tripStartDate: null,
        tripEndDate: null,
        notes: null,
        isShared: false,
        shareToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const returningMock = vi.fn().mockResolvedValue([mockTrip]);
      const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
      vi.mocked(db!.insert).mockReturnValue({ values: valuesMock } as any);

      const created = await service.createTrip('user-abc', {
        name: 'Monsoon Retreat',
      });

      expect(created.id).toBe('trip-1');
      expect(created.name).toBe('Monsoon Retreat');
      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Monsoon Retreat',
          userId: 'user-abc',
          startLocation: 'Chandigarh',
          isStartLocationSaved: false,
        })
      );
    });
  });

  describe('toggleTripSharing', () => {
    it('generates share token and sets isShared to true', async () => {
      const returningMock = vi.fn().mockResolvedValue([
        {
          id: 'trip-1',
          isShared: true,
          shareToken: 'abc123token456',
        },
      ]);
      const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
      const setMock = vi.fn().mockReturnValue({ where: whereMock });
      vi.mocked(db!.update).mockReturnValue({ set: setMock } as any);

      const result = await service.toggleTripSharing('user-abc', 'trip-1', true);

      expect(result.isShared).toBe(true);
      expect(result.shareToken).toBeDefined();
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          isShared: true,
          shareToken: expect.any(String),
        })
      );
    });

    it('clears share token when unsharing', async () => {
      const returningMock = vi.fn().mockResolvedValue([
        {
          id: 'trip-1',
          isShared: false,
          shareToken: null,
        },
      ]);
      const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
      const setMock = vi.fn().mockReturnValue({ where: whereMock });
      vi.mocked(db!.update).mockReturnValue({ set: setMock } as any);

      const result = await service.toggleTripSharing('user-abc', 'trip-1', false);

      expect(result.isShared).toBe(false);
      expect(result.shareToken).toBeNull();
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          isShared: false,
          shareToken: null,
        })
      );
    });
  });

  describe('getSharedTrip (Privacy & Redaction)', () => {
    it('returns null if trip is not found or not shared', async () => {
      vi.mocked(db!.query.trips.findFirst).mockResolvedValue(undefined);

      const shared = await service.getSharedTrip('invalid-token');
      expect(shared).toBeNull();
    });

    it('redacts private notes and coordinates when isStartLocationSaved is false', async () => {
      const rawTrip = {
        id: 'trip-1',
        userId: 'user-abc',
        name: 'Secret Escape',
        startLocation: 'Sector 17',
        startLocationLabel: 'Sector 17, Chandigarh',
        startLatitude: 30.7333,
        startLongitude: 76.7794,
        isStartLocationSaved: false, // User chose NOT to save home GPS
        vehicleType: 'EV',
        tripStartDate: null,
        tripEndDate: null,
        notes: 'Personal notes: remember to pack medicines and extra cash',
        isShared: true,
        shareToken: 'valid-token',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db!.query.trips.findFirst).mockResolvedValue(rawTrip as any);

      // Mock waypoint query in enrichTrip
      const orderByMock = vi.fn().mockResolvedValue([]);
      const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
      const innerJoinMock = vi.fn().mockReturnValue({ where: whereMock });
      const fromMock = vi.fn().mockReturnValue({ innerJoin: innerJoinMock });
      vi.mocked(db!.select).mockReturnValue({ from: fromMock } as any);

      const shared = await service.getSharedTrip('valid-token');

      expect(shared).not.toBeNull();
      // PRIVACY: Notes must be redacted to null
      expect(shared!.trip.notes).toBeNull();
      // PRIVACY: Exact coordinates must be redacted to null
      expect(shared!.trip.startLatitude).toBeNull();
      expect(shared!.trip.startLongitude).toBeNull();
      // General label can be shown
      expect(shared!.trip.startLocationLabel).toBe('Sector 17, Chandigarh');
    });

    it('preserves coordinates when user explicitly opted-in (isStartLocationSaved is true)', async () => {
      const rawTrip = {
        id: 'trip-2',
        userId: 'user-abc',
        name: 'Public Trail',
        startLocation: 'Delhi',
        startLocationLabel: 'Delhi Airport',
        startLatitude: 28.5562,
        startLongitude: 77.1000,
        isStartLocationSaved: true, // User explicitly allowed saving
        vehicleType: 'PETROL_CAR',
        tripStartDate: null,
        tripEndDate: null,
        notes: 'Secret note',
        isShared: true,
        shareToken: 'valid-token-2',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db!.query.trips.findFirst).mockResolvedValue(rawTrip as any);

      const orderByMock = vi.fn().mockResolvedValue([]);
      const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
      const innerJoinMock = vi.fn().mockReturnValue({ where: whereMock });
      const fromMock = vi.fn().mockReturnValue({ innerJoin: innerJoinMock });
      vi.mocked(db!.select).mockReturnValue({ from: fromMock } as any);

      const shared = await service.getSharedTrip('valid-token-2');

      expect(shared).not.toBeNull();
      // Notes still redacted
      expect(shared!.trip.notes).toBeNull();
      // Coordinates preserved because isStartLocationSaved is true
      expect(shared!.trip.startLatitude).toBe(28.5562);
      expect(shared!.trip.startLongitude).toBe(77.1000);
    });
  });
});
