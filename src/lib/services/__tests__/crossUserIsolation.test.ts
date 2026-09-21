import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TripService } from '../trip-service';
import { SavedDestinationService } from '../saved-destination-service';
import { db } from '../../db';

vi.mock('../../db', () => ({
  db: {
    query: {
      trips: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      savedDestinations: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    select: vi.fn(),
  },
}));

describe('Cross-User Security & Isolation Tests', () => {
  const USER_A_ID = '00000000-0000-0000-0000-000000000001';
  const USER_B_ID = '00000000-0000-0000-0000-000000000002';
  const TRIP_A_ID = '11111111-1111-1111-1111-111111111111';
  const DEST_A_ID = '22222222-2222-2222-2222-222222222222';

  let tripService: TripService;
  let savedService: SavedDestinationService;

  beforeEach(() => {
    vi.clearAllMocks();
    tripService = new TripService();
    savedService = new SavedDestinationService();
  });

  describe('Trip Ownership Isolation', () => {
    it('User B cannot retrieve User A private trip via getTripById', async () => {
      // Drizzle findFirst returns undefined because userId does not match User B
      vi.mocked(db!.query.trips.findFirst).mockResolvedValue(undefined);

      const result = await tripService.getTripById(USER_B_ID, TRIP_A_ID);
      expect(result).toBeNull();
    });

    it('User B cannot update User A trip', async () => {
      // Drizzle update returns empty array because where clause checks eq(trips.userId, userId)
      const returningMock = vi.fn().mockResolvedValue([]);
      const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
      const setMock = vi.fn().mockReturnValue({ where: whereMock });
      vi.mocked(db!.update).mockReturnValue({ set: setMock } as any);

      await expect(
        tripService.updateTrip(USER_B_ID, TRIP_A_ID, { name: 'Hacked Trip Name' })
      ).rejects.toThrow('Trip not found or unauthorized to update.');
    });

    it('User B cannot delete User A trip', async () => {
      const returningMock = vi.fn().mockResolvedValue([]);
      const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
      vi.mocked(db!.delete).mockReturnValue({ where: whereMock } as any);

      const success = await tripService.deleteTrip(USER_B_ID, TRIP_A_ID);
      expect(success).toBe(false);
    });

    it('User B cannot reorder waypoints in User A trip', async () => {
      // getTripById returns null for unauthorized user
      vi.mocked(db!.query.trips.findFirst).mockResolvedValue(undefined);

      await expect(
        tripService.reorderTripDestinations(USER_B_ID, TRIP_A_ID, ['wp-1', 'wp-2'])
      ).rejects.toThrow('Trip not found or unauthorized.');
    });

    it('User B cannot toggle sharing on User A trip', async () => {
      const returningMock = vi.fn().mockResolvedValue([]);
      const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
      const setMock = vi.fn().mockReturnValue({ where: whereMock });
      vi.mocked(db!.update).mockReturnValue({ set: setMock } as any);

      await expect(
        tripService.toggleTripSharing(USER_B_ID, TRIP_A_ID, true)
      ).rejects.toThrow('Trip not found or unauthorized.');
    });
  });

  describe('Saved Destinations Isolation', () => {
    it('User B cannot delete User A saved destination', async () => {
      // eq(savedDestinations.userId, USER_B_ID) produces 0 returned rows
      const returningMock = vi.fn().mockResolvedValue([]);
      const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
      vi.mocked(db!.delete).mockReturnValue({ where: whereMock } as any);

      const success = await savedService.unsaveDestination(USER_B_ID, DEST_A_ID);
      expect(success).toBe(false);
    });

    it('User B isDestinationSaved returns false for User A bookmark', async () => {
      vi.mocked(db!.query.savedDestinations.findFirst).mockResolvedValue(undefined);

      const isSaved = await savedService.isDestinationSaved(USER_B_ID, DEST_A_ID);
      expect(isSaved).toBe(false);
    });
  });
});
