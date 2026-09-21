import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CollectionService } from '../collection-service';
import { db } from '../../db';
import { EditorialStatus } from '../../types/enums';

vi.mock('../../db', () => ({
  db: {
    query: {
      collections: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      collectionDestinations: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      destinations: {
        findMany: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    select: vi.fn(),
  },
}));

describe('CollectionService Unit Tests', () => {
  let service: CollectionService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CollectionService();
  });

  describe('getBySlug publication gating', () => {
    it('returns published collection for public visitors', async () => {
      const mockCollection = {
        id: 'coll-1',
        title: 'Mughal Heritage',
        slug: 'mughal-heritage',
        shortDescription: 'Historic Mughal monuments',
        description: 'Long editorial narrative',
        editorialStatus: EditorialStatus.PUBLISHED,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db!.query.collections.findFirst).mockResolvedValue(mockCollection as any);
      // Empty waypoints mock for select
      vi.mocked(db!.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      const result = await service.getBySlug('mughal-heritage');
      expect(result).not.toBeNull();
      expect(result?.collection.title).toBe('Mughal Heritage');
    });

    it('returns null for draft collection if allowDraftPreview is false', async () => {
      vi.mocked(db!.query.collections.findFirst).mockResolvedValue(undefined);

      const result = await service.getBySlug('draft-trail', false);
      expect(result).toBeNull();
    });

    it('returns draft collection if allowDraftPreview is true (admin preview)', async () => {
      const mockDraft = {
        id: 'coll-draft',
        title: 'Draft Trail',
        slug: 'draft-trail',
        editorialStatus: EditorialStatus.DRAFT,
      };

      vi.mocked(db!.query.collections.findFirst).mockResolvedValue(mockDraft as any);
      vi.mocked(db!.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      const result = await service.getBySlug('draft-trail', true);
      expect(result).not.toBeNull();
      expect(result?.collection.title).toBe('Draft Trail');
    });
  });

  describe('createCollection', () => {
    it('creates collection and lowercases/trims slug', async () => {
      vi.mocked(db!.query.collections.findFirst).mockResolvedValue(undefined);

      const inserted = {
        id: 'coll-new',
        title: 'High Himalayan Monoliths',
        slug: 'high-himalayan-monoliths',
        editorialStatus: EditorialStatus.DRAFT,
      };

      const returningMock = vi.fn().mockResolvedValue([inserted]);
      const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
      vi.mocked(db!.insert).mockReturnValue({ values: valuesMock } as any);

      const result = await service.createCollection({
        title: 'High Himalayan Monoliths',
        slug: 'High-Himalayan-Monoliths ',
        shortDescription: 'Rock-cut temples and caves',
        description: 'Detailed narrative',
        editorialStatus: EditorialStatus.DRAFT,
      } as any);

      expect(result.success).toBe(true);
      expect(result.collection?.slug).toBe('high-himalayan-monoliths');
    });

    it('rejects duplicate slug', async () => {
      vi.mocked(db!.query.collections.findFirst).mockResolvedValue({ id: 'existing' } as any);

      const result = await service.createCollection({
        title: 'Existing Trail',
        slug: 'existing-trail',
        shortDescription: 'Desc',
        description: 'Desc',
        editorialStatus: EditorialStatus.DRAFT,
      } as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });
  });

  describe('setCollectionDestinations', () => {
    it('deletes existing waypoints and inserts new sequential waypoints', async () => {
      const whereMock = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db!.delete).mockReturnValue({ where: whereMock } as any);

      const valuesMock = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db!.insert).mockReturnValue({ values: valuesMock } as any);

      const updateWhereMock = vi.fn().mockResolvedValue(undefined);
      const setMock = vi.fn().mockReturnValue({ where: updateWhereMock });
      vi.mocked(db!.update).mockReturnValue({ set: setMock } as any);

      const success = await service.setCollectionDestinations('coll-1', [
        { destinationId: 'dest-a', sequence: 1, editorialNote: 'First stop' },
        { destinationId: 'dest-b', sequence: 2, editorialNote: 'Second stop' },
      ]);

      expect(success).toBe(true);
      expect(db!.delete).toHaveBeenCalled();
      expect(db!.insert).toHaveBeenCalled();
    });
  });
});
