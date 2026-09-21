import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SavedDestinationService } from '../saved-destination-service';
import { db } from '../../db';

vi.mock('../../db', () => ({
  db: {
    query: {
      destinations: {
        findFirst: vi.fn(),
      },
      savedDestinations: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
    insert: vi.fn(),
    delete: vi.fn(),
    select: vi.fn(),
  },
}));

describe('SavedDestinationService Unit Tests', () => {
  let service: SavedDestinationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SavedDestinationService();
  });

  describe('saveDestination', () => {
    it('throws error when destination does not exist or is not published', async () => {
      vi.mocked(db!.query.destinations.findFirst).mockResolvedValue(undefined);

      await expect(
        service.saveDestination('user-123', 'non-existent-dest')
      ).rejects.toThrow('Destination not found or not published.');
    });

    it('inserts saved destination on conflict do nothing when published', async () => {
      vi.mocked(db!.query.destinations.findFirst).mockResolvedValue({ id: 'dest-1' } as any);

      const onConflictDoNothingMock = vi.fn().mockResolvedValue([]);
      const valuesMock = vi.fn().mockReturnValue({ onConflictDoNothing: onConflictDoNothingMock });
      vi.mocked(db!.insert).mockReturnValue({ values: valuesMock } as any);

      const result = await service.saveDestination('user-123', 'dest-1');

      expect(result).toBe(true);
      expect(valuesMock).toHaveBeenCalledWith({
        userId: 'user-123',
        destinationId: 'dest-1',
      });
      expect(onConflictDoNothingMock).toHaveBeenCalled();
    });
  });

  describe('unsaveDestination', () => {
    it('returns true when row is successfully deleted', async () => {
      const returningMock = vi.fn().mockResolvedValue([{ id: 'saved-1' }]);
      const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
      vi.mocked(db!.delete).mockReturnValue({ where: whereMock } as any);

      const result = await service.unsaveDestination('user-123', 'dest-1');

      expect(result).toBe(true);
      expect(whereMock).toHaveBeenCalled();
    });

    it('returns false when no record was found to delete', async () => {
      const returningMock = vi.fn().mockResolvedValue([]);
      const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
      vi.mocked(db!.delete).mockReturnValue({ where: whereMock } as any);

      const result = await service.unsaveDestination('user-123', 'dest-unknown');

      expect(result).toBe(false);
    });
  });

  describe('isDestinationSaved', () => {
    it('returns true when record exists', async () => {
      vi.mocked(db!.query.savedDestinations.findFirst).mockResolvedValue({ id: 'saved-1' } as any);

      const isSaved = await service.isDestinationSaved('user-123', 'dest-1');
      expect(isSaved).toBe(true);
    });

    it('returns false when record does not exist', async () => {
      vi.mocked(db!.query.savedDestinations.findFirst).mockResolvedValue(undefined);

      const isSaved = await service.isDestinationSaved('user-123', 'dest-1');
      expect(isSaved).toBe(false);
    });
  });
});
