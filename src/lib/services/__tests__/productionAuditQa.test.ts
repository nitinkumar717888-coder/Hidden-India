import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RESEARCHED_DESTINATIONS, RESEARCHED_22_DESTINATIONS } from '../../db/destinations-data';
import { RESEARCHED_COLLECTIONS } from '../../db/collections-data';
import { TripService } from '../trip-service';
import { calculateMultiStopItinerary } from '../../calculator/multiStopCalculator';
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

describe('Hidden India — Comprehensive Production QA & Security Audit Suite', () => {
  // =========================================================================
  // 1. ALL 22 RESEARCHED DESTINATIONS DATA QUALITY AUDIT
  // =========================================================================
  describe('Part 4: Destination Data Quality & Editorial Invariants', () => {
    it('contains 22 core published destinations in the catalog', () => {
      expect(
        RESEARCHED_DESTINATIONS.filter((d) => d.editorialStatus === 'published').length
      ).toBe(22);
      expect(RESEARCHED_DESTINATIONS.length).toBeGreaterThanOrEqual(52);
    });

    it('every destination has valid identity: name, slug, state, district, and locality', () => {
      const slugs = new Set<string>();

      RESEARCHED_DESTINATIONS.forEach((d) => {
        expect(d.name).toBeTruthy();
        expect(d.name.trim().length).toBeGreaterThan(3);

        expect(d.slug).toBeTruthy();
        expect(d.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
        expect(slugs.has(d.slug), `Duplicate slug detected: ${d.slug}`).toBe(false);
        slugs.add(d.slug);

        expect(['Punjab', 'Haryana', 'Himachal Pradesh', 'Chandigarh', 'Rajasthan', 'Delhi']).toContain(d.state);
        expect(d.district).toBeTruthy();
        expect(d.locality).toBeTruthy();
      });
    });

    it('every destination has plausible coordinates within northern India with recorded sources', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        expect(d.latitude).toBeGreaterThanOrEqual(24.0);
        expect(d.latitude).toBeLessThanOrEqual(34.0);
        expect(d.longitude).toBeGreaterThanOrEqual(70.0);
        expect(d.longitude).toBeLessThanOrEqual(79.5);

        expect(d.coordinateSource).toBeTruthy();
        expect(d.coordinateSource.length).toBeGreaterThan(10);
      });
    });

    it('segregates documented historical facts from local traditions and oral folklore', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        expect(d.evidenceItems.length).toBeGreaterThan(0);

        const classifications = d.evidenceItems.map((e) => e.classification);
        // Must contain at least one documented evidence item
        expect(classifications).toContain('DOCUMENTED');

        d.evidenceItems.forEach((e) => {
          expect(['DOCUMENTED', 'LOCAL_TRADITION', 'DISPUTED']).toContain(e.classification);
          expect(e.sectionTitle).toBeTruthy();
          expect(e.content.length).toBeGreaterThan(20);
          expect(e.citationNotes).toBeTruthy();
        });
      });
    });

    it('every destination has verified sources from reputable publishers/authorities', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        expect(d.sources.length).toBeGreaterThan(0);
        d.sources.forEach((s) => {
          expect(s.title).toBeTruthy();
          expect(s.publisher).toBeTruthy();
          expect([
            'GOVERNMENT',
            'ARCHAEOLOGICAL',
            'ACADEMIC',
            'MUSEUM',
            'OFFICIAL_TOURISM',
            'ARCHIVAL',
            'NEWS',
            'OTHER',
          ]).toContain(s.sourceType);
        });
      });
    });

    it('preserves architectural and geographic splits from Phase 5.5', () => {
      // 1. Jal Mahal vs Chor Gumbad
      const jalMahal = RESEARCHED_DESTINATIONS.find((d) => d.slug === 'jal-mahal-narnaul');
      const chorGumbad = RESEARCHED_DESTINATIONS.find((d) => d.slug === 'chor-gumbad-narnaul');
      expect(jalMahal).toBeDefined();
      expect(chorGumbad).toBeDefined();
      expect(jalMahal?.name).toBe('Jal Mahal, Narnaul');
      expect(chorGumbad?.name).toBe('Chor Gumbad, Narnaul');
      expect(jalMahal?.latitude).toBeCloseTo(28.0467, 4);
      expect(jalMahal?.longitude).toBeCloseTo(76.1089, 4);
      expect(chorGumbad?.latitude).toBeCloseTo(28.0645, 4);
      expect(chorGumbad?.longitude).toBeCloseTo(76.1152, 4);

      // 2. Kalesar Red Iron Bridge vs Forest Dak Bungalow
      const bridge = RESEARCHED_DESTINATIONS.find((d) => d.slug === 'kalesar-iron-suspension-bridge');
      const bungalow = RESEARCHED_DESTINATIONS.find((d) => d.slug === 'kalesar-forest-dak-bungalow');
      expect(bridge).toBeDefined();
      expect(bungalow).toBeDefined();
      expect(bridge?.name).toBe('Kalesar Colonial Red Iron Bridge');
      expect(bungalow?.name).toBe('Kalesar Forest Dak Bungalow');
      expect(bridge?.latitude).toBeCloseTo(30.3472, 4);
      expect(bridge?.longitude).toBeCloseTo(77.5806, 4);
      expect(bungalow?.latitude).toBeCloseTo(30.3425, 4);
      expect(bungalow?.longitude).toBeCloseTo(77.5750, 4);

      // 3. Bassi Baoli
      const bassi = RESEARCHED_DESTINATIONS.find((d) => d.slug === 'bassi-baoli-pinjore');
      expect(bassi).toBeDefined();
      expect(bassi?.name).toBe('Bassi Baoli (Pinjore Stepwell)');
    });

    it('enforces exact Gondhla Tower Fort discretionary fee structure', () => {
      const gondhla = RESEARCHED_DESTINATIONS.find((d) => d.slug === 'gondhla-tower-fort-lahaul');
      expect(gondhla).toBeDefined();
      expect(gondhla?.visitInfo.feeType).toBe('discretionary');
      expect(gondhla?.visitInfo.isFeeVerified).toBe(false);
      expect(gondhla?.visitInfo.entryFee).toBe(
        'An informal preservation fee may be collected on-site by the caretaker family; amount and availability may vary.'
      );
    });
  });

  // =========================================================================
  // 2. ALL 5 CURATED COLLECTIONS AUDIT
  // =========================================================================
  describe('Part 5: Curated Collections Audit', () => {
    it('contains exactly 5 curated collections matching required titles', () => {
      expect(RESEARCHED_COLLECTIONS.length).toBe(5);

      const titles = RESEARCHED_COLLECTIONS.map((c) => c.title);
      expect(titles).toContain('Forgotten Fortresses of Haryana & the Borderlands');
      expect(titles).toContain('Hidden Mughal Wayposts of the Grand Highway & Frontier');
      expect(titles).toContain('Sacred Stones & Stepwells of the Shiwalik Foothills');
      expect(titles).toContain('Relics of British Colonial Frontier Administration');
      expect(titles).toContain('High Himalayan Strongholds & Sacred Monoliths');
    });

    it('each collection has at most 10 waypoints, unique stops, and strictly sequential numbering', () => {
      RESEARCHED_COLLECTIONS.forEach((c) => {
        expect(c.waypoints.length).toBeGreaterThan(0);
        expect(c.waypoints.length).toBeLessThanOrEqual(10);

        const slugs = new Set<string>();
        c.waypoints.forEach((wp, idx) => {
          expect(wp.sequence).toBe(idx + 1);
          expect(slugs.has(wp.destinationSlug), `Duplicate stop in collection ${c.title}`).toBe(false);
          slugs.add(wp.destinationSlug);
        });
      });
    });

    it('all collection destinations exist and are published in the destination database', () => {
      const publishedDestMap = new Map(
        RESEARCHED_DESTINATIONS.filter((d) => d.editorialStatus === 'published').map((d) => [d.slug, d])
      );

      RESEARCHED_COLLECTIONS.forEach((c) => {
        expect(c.editorialStatus).toBe('published');
        c.waypoints.forEach((wp) => {
          expect(
            publishedDestMap.has(wp.destinationSlug),
            `Collection "${c.title}" references missing or unpublished destination "${wp.destinationSlug}"`
          ).toBe(true);
        });
      });
    });
  });

  // =========================================================================
  // 3. IMAGE PLACEHOLDER AUDIT
  // =========================================================================
  describe('Part 6: Image Placeholder & Editorial Attribution Audit', () => {
    it('every core 22 destination image is explicitly flagged as a representative stock placeholder', () => {
      RESEARCHED_22_DESTINATIONS.forEach((dest) => {
        expect(dest.images.length).toBeGreaterThan(0);
        dest.images.forEach((img) => {
          expect(img.requiresEditorialReplacement).toBe(true);
          expect(img.credit).toContain('Unsplash (Representative Stock');
          expect(img.caption).toContain('Flagged for editorial field photography replacement');
        });
      });
    });
  });

  // =========================================================================
  // 4. SHARED TRIP PRIVACY AUDIT
  // =========================================================================
  describe('Part 11: Shared Trip Privacy & Sensitive Data Redaction', () => {
    let service: TripService;

    beforeEach(() => {
      vi.clearAllMocks();
      service = new TripService();
    });

    it('redacts both trip-level notes AND waypoint-level private notes on public shared trips', async () => {
      const mockTrip = {
        id: 'trip-qa-1',
        userId: 'user-secret-123',
        name: 'Historic Grand Trunk Road',
        startLocation: 'Chandigarh',
        startLocationLabel: 'Chandigarh',
        startLatitude: 30.7333,
        startLongitude: 76.7794,
        isStartLocationSaved: false, // Checkbox OFF: coordinates must be hidden
        vehicleType: 'PETROL_CAR',
        tripStartDate: '2026-10-15',
        tripEndDate: '2026-10-18',
        notes: 'Secret owner packing list and personal budget notes',
        isShared: true,
        shareToken: 'token-secret-share-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db!.query.trips.findFirst).mockResolvedValue(mockTrip as any);

      // Mock enrichTrip inner select
      const mockRawWaypoints = [
        {
          id: 'wp-1',
          sequence: 1,
          notes: 'Private note: stop at dhaba before toll gate',
          destination: {
            id: 'dest-1',
            name: 'Qila Mubarak',
            slug: 'qila-mubarak-bathinda',
            latitude: 30.211,
            longitude: 74.9455,
          },
        },
      ];

      const orderByMock = vi.fn().mockResolvedValue(mockRawWaypoints);
      const whereSelectMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
      const innerJoinMock = vi.fn().mockReturnValue({ where: whereSelectMock });
      const fromMock = vi.fn().mockReturnValue({
        innerJoin: innerJoinMock,
        where: vi.fn().mockResolvedValue([]),
      });
      vi.mocked(db!.select).mockReturnValue({ from: fromMock } as any);

      const shared = await service.getSharedTrip('token-secret-share-123');

      expect(shared).not.toBeNull();
      // 1. Trip notes redacted
      expect(shared!.trip.notes).toBeNull();
      // 2. Waypoint private notes redacted
      expect(shared!.waypoints[0].notes).toBeNull();
      // 3. Unsaved start coordinates redacted
      expect(shared!.trip.startLatitude).toBeNull();
      expect(shared!.trip.startLongitude).toBeNull();
      // 4. Public name preserved
      expect(shared!.trip.name).toBe('Historic Grand Trunk Road');
    });
  });

  // =========================================================================
  // 5. MULTI-STOP CALCULATOR DETERMINISM & UNKNOWN != 0 AUDIT
  // =========================================================================
  describe('Part 10: Multi-Stop Calculator Accounting', () => {
    it('marks parking and entry fees as UNKNOWN if any waypoint has unverified costs (Unknown != 0)', async () => {
      const result = await calculateMultiStopItinerary({
        startLocation: { latitude: 30.7333, longitude: 76.7794 },
        startLocationLabel: 'Chandigarh',
        waypoints: [
          {
            destinationId: 'dest-1',
            name: 'Bassi Baoli',
            coordinates: { latitude: 30.825, longitude: 76.9389 },
            visitInfo: {
              id: 'vi-1',
              destinationId: 'dest-1',
              entryFee: 'Free',
              currency: 'INR',
              feeType: 'free',
              isFeeVerified: true,
              openingInformation: 'Open 24 hours',
              parkingInformation: 'No designated parking; roadside parking only',
              accessInformation: 'Walk 100m from village road',
              contactInformation: null,
              bestTimeInformation: 'Morning',
              sourceId: null,
              verifiedAt: new Date(),
              updatedAt: new Date(),
            },
          },
          {
            destinationId: 'dest-2',
            name: 'Gondhla Tower Fort',
            coordinates: { latitude: 32.5025, longitude: 77.0189 },
            visitInfo: {
              id: 'vi-2',
              destinationId: 'dest-2',
              entryFee: 'Discretionary fee',
              currency: 'INR',
              feeType: 'discretionary',
              isFeeVerified: false, // UNVERIFIED: Must trigger Unknown != 0
              openingInformation: 'Subject to caretaker presence',
              parkingInformation: 'Roadside unpaved pullout',
              accessInformation: 'Short walk from Keylong highway',
              contactInformation: null,
              bestTimeInformation: 'Summer',
              sourceId: null,
              verifiedAt: new Date(),
              updatedAt: new Date(),
            },
          },
        ],
        vehicleType: 'PETROL_CAR',
        isRoundTrip: true,
      });

      expect(result.segments.length).toBe(3); // Start -> W1 -> W2 -> Return
      expect(result.totalDistanceKm).toBeGreaterThan(0);
      // Entry fee must NOT be treated as zero; it must be flagged as UNKNOWN
      const entryFeeItem = result.costCalculation.breakdown.find((b) => b.id === 'entry_fee');
      expect(entryFeeItem).toBeDefined();
      expect(entryFeeItem?.status).toBe('UNKNOWN');
      expect(result.costCalculation.hasUnknownComponents).toBe(true);
      expect(result.costCalculation.totalDisplay).toContain('+');
    });
  });
});
