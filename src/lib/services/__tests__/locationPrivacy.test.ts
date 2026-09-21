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
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    select: vi.fn(),
  },
}));

describe('Location Persistence Privacy Invariant Tests', () => {
  let service: TripService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TripService();
  });

  it('SECURITY INVARIANT: Never persists start coordinates when isStartLocationSaved is false', async () => {
    const valuesMock = vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: 'trip-1' }]) });
    vi.mocked(db!.insert).mockReturnValue({ values: valuesMock } as any);

    await service.createTrip('user-1', {
      name: 'Shimla Ridge Trip',
      startLocation: 'Sector 17',
      startLocationLabel: 'Sector 17, Chandigarh',
      startLatitude: 30.7333,
      startLongitude: 76.7794,
      isStartLocationSaved: false, // Checkbox OFF
    });

    expect(valuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        isStartLocationSaved: false,
        startLatitude: null, // MUST BE NULL
        startLongitude: null, // MUST BE NULL
        startLocationLabel: 'Sector 17, Chandigarh',
      })
    );
  });

  it('Persists start coordinates ONLY when user explicitly checks isStartLocationSaved = true', async () => {
    const valuesMock = vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: 'trip-2' }]) });
    vi.mocked(db!.insert).mockReturnValue({ values: valuesMock } as any);

    await service.createTrip('user-1', {
      name: 'Spiti Expedition',
      startLocation: 'Chandigarh Airport',
      startLocationLabel: 'Chandigarh Airport',
      startLatitude: 30.6735,
      startLongitude: 76.7885,
      isStartLocationSaved: true, // Checkbox explicitly ON
    });

    expect(valuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        isStartLocationSaved: true,
        startLatitude: 30.6735,
        startLongitude: 76.7885,
      })
    );
  });

  it('Nulls coordinates on updateTrip if isStartLocationSaved is toggled to false', async () => {
    const returningMock = vi.fn().mockResolvedValue([{ id: 'trip-1', isStartLocationSaved: false }]);
    const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
    const setMock = vi.fn().mockReturnValue({ where: whereMock });
    vi.mocked(db!.update).mockReturnValue({ set: setMock } as any);

    await service.updateTrip('user-1', 'trip-1', {
      isStartLocationSaved: false,
      startLatitude: 30.7333 as any,
      startLongitude: 76.7794 as any,
    });

    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({
        isStartLocationSaved: false,
        startLatitude: null,
        startLongitude: null,
      })
    );
  });

  it('Verifies full 5-step location privacy lifecycle from save to disable to shared redaction', async () => {
    // 1 & 2: Create trip with coordinates saved
    const createdTrip = {
      id: 'trip-lifecycle-1',
      userId: 'user-1',
      name: 'Shimla Ridge Trip',
      startLocation: 'Sector 17',
      startLocationLabel: 'Sector 17, Chandigarh',
      startLatitude: 30.7333,
      startLongitude: 76.7794,
      isStartLocationSaved: true,
      vehicleType: 'PETROL_CAR',
      tripStartDate: null,
      tripEndDate: null,
      notes: 'Private pack list',
      isShared: true,
      shareToken: 'token-lifecycle-1234',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const valuesMock = vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([createdTrip]) });
    vi.mocked(db!.insert).mockReturnValue({ values: valuesMock } as any);

    const step1 = await service.createTrip('user-1', {
      name: 'Shimla Ridge Trip',
      startLocation: 'Sector 17',
      startLocationLabel: 'Sector 17, Chandigarh',
      startLatitude: 30.7333,
      startLongitude: 76.7794,
      isStartLocationSaved: true,
    });

    expect(step1.startLatitude).toBe(30.7333);
    expect(step1.startLongitude).toBe(76.7794);

    // 3 & 4: Edit trip and disable "Save this starting point"
    let updatedPayload: any = null;
    const returningMock = vi.fn().mockImplementation(() => [{
      ...createdTrip,
      isStartLocationSaved: false,
      startLatitude: null,
      startLongitude: null,
    }]);
    const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
    const setMock = vi.fn().mockImplementation((p) => {
      updatedPayload = p;
      return { where: whereMock };
    });
    vi.mocked(db!.update).mockReturnValue({ set: setMock } as any);

    await service.updateTrip('user-1', 'trip-lifecycle-1', {
      isStartLocationSaved: false,
    });

    expect(updatedPayload.startLatitude).toBeNull();
    expect(updatedPayload.startLongitude).toBeNull();
    expect(updatedPayload.isStartLocationSaved).toBe(false);

    // 5: Verify getSharedTrip does not expose coordinates
    vi.mocked(db!.query.trips.findFirst).mockResolvedValue({
      ...createdTrip,
      isStartLocationSaved: false,
      startLatitude: null,
      startLongitude: null,
    } as any);

    const orderByMock = vi.fn().mockResolvedValue([]);
    const whereSelectMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
    const innerJoinMock = vi.fn().mockReturnValue({ where: whereSelectMock });
    const fromMock = vi.fn().mockReturnValue({ innerJoin: innerJoinMock });
    vi.mocked(db!.select).mockReturnValue({ from: fromMock } as any);

    const shared = await service.getSharedTrip('token-lifecycle-1234');
    expect(shared).not.toBeNull();
    expect(shared!.trip.startLatitude).toBeNull();
    expect(shared!.trip.startLongitude).toBeNull();
    expect(shared!.trip.notes).toBeNull();
  });
});
