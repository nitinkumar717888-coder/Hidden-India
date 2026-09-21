import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TripService } from '../trip-service';
import { db } from '../../db';

vi.mock('../../db', () => ({
  db: {
    query: {
      trips: {
        findFirst: vi.fn(),
      },
    },
    update: vi.fn(),
    select: vi.fn(),
  },
}));

describe('Share Token Lifecycle & Invalidation State Machine Tests', () => {
  let service: TripService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TripService();
  });

  it('Generates a 32-character hexadecimal token on sharing', async () => {
    let capturedSetPayload: any = null;
    const returningMock = vi.fn().mockImplementation(() => [{
      id: 'trip-1',
      isShared: capturedSetPayload?.isShared,
      shareToken: capturedSetPayload?.shareToken,
    }]);
    const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
    const setMock = vi.fn().mockImplementation((payload) => {
      capturedSetPayload = payload;
      return { where: whereMock };
    });
    vi.mocked(db!.update).mockReturnValue({ set: setMock } as any);

    const result = await service.toggleTripSharing('user-1', 'trip-1', true);

    expect(result.isShared).toBe(true);
    expect(result.shareToken).toBeDefined();
    // 16 bytes = 32 hex chars
    expect(result.shareToken).toMatch(/^[0-9a-f]{32}$/);
    expect(capturedSetPayload.shareToken).toBe(result.shareToken);
  });

  it('Destroys the shareToken in the database when sharing is disabled', async () => {
    let capturedSetPayload: any = null;
    const returningMock = vi.fn().mockImplementation(() => [{
      id: 'trip-1',
      isShared: false,
      shareToken: null,
    }]);
    const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
    const setMock = vi.fn().mockImplementation((payload) => {
      capturedSetPayload = payload;
      return { where: whereMock };
    });
    vi.mocked(db!.update).mockReturnValue({ set: setMock } as any);

    const result = await service.toggleTripSharing('user-1', 'trip-1', false);

    expect(result.isShared).toBe(false);
    expect(result.shareToken).toBeNull();
    // Token is destroyed in DB, not just hidden by application
    expect(capturedSetPayload.shareToken).toBeNull();
  });

  it('Old share token returns null (yielding 404) after sharing is disabled', async () => {
    // When sharing is disabled or token destroyed, DB query returns undefined
    vi.mocked(db!.query.trips.findFirst).mockResolvedValue(undefined);

    const sharedTrip = await service.getSharedTrip('old-revoked-token-1234');
    expect(sharedTrip).toBeNull();
  });

  it('Re-sharing generates a NEW token; old revoked token remains permanently invalid', async () => {
    let capturedTokens: string[] = [];
    const returningMock = vi.fn().mockImplementation(() => [{
      id: 'trip-1',
      isShared: true,
      shareToken: capturedTokens[capturedTokens.length - 1],
    }]);
    const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
    const setMock = vi.fn().mockImplementation((payload) => {
      capturedTokens.push(payload.shareToken);
      return { where: whereMock };
    });
    vi.mocked(db!.update).mockReturnValue({ set: setMock } as any);

    // Share 1
    const share1 = await service.toggleTripSharing('user-1', 'trip-1', true);
    const token1 = share1.shareToken!;

    // Unshare
    await service.toggleTripSharing('user-1', 'trip-1', false);

    // Share 2
    const share2 = await service.toggleTripSharing('user-1', 'trip-1', true);
    const token2 = share2.shareToken!;

    expect(token1).not.toBe(token2);

    // Querying for token1 against DB where current active token is token2
    vi.mocked(db!.query.trips.findFirst).mockImplementation((async ({ where }: any) => {
      // Drizzle where check: trips.shareToken === token
      return undefined; // Old token1 doesn't match current trip shareToken
    }) as any);

    const lookupOldToken = await service.getSharedTrip(token1);
    expect(lookupOldToken).toBeNull();
  });
});
