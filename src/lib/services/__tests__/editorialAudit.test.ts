import { describe, it, expect } from 'vitest';
import { RESEARCHED_DESTINATIONS, RESEARCHED_22_DESTINATIONS, RESEARCHED_20_DESTINATIONS } from '../../db/destinations-data';
import { RESEARCHED_COLLECTIONS } from '../../db/collections-data';

describe('22-Destination Editorial Audit', () => {
  // ─── A. Structural Integrity ──────────────────────────────────────────
  describe('A. Dataset structure', () => {
    it('contains exactly 22 core published destinations in RESEARCHED_22_DESTINATIONS', () => {
      expect(RESEARCHED_22_DESTINATIONS.length).toBe(22);
      expect(RESEARCHED_DESTINATIONS.filter((d) => d.editorialStatus === 'published').length).toBe(22);
      expect(RESEARCHED_DESTINATIONS.length).toBeGreaterThanOrEqual(52);
    });

    it('exports RESEARCHED_22_DESTINATIONS as primary alias for the 22 core destinations', () => {
      expect(RESEARCHED_22_DESTINATIONS).toBeDefined();
      expect(RESEARCHED_22_DESTINATIONS.length).toBe(22);
      expect(RESEARCHED_22_DESTINATIONS).toEqual(RESEARCHED_DESTINATIONS.slice(0, 22));
    });

    it('exports RESEARCHED_20_DESTINATIONS as deprecated backward-compat alias', () => {
      expect(RESEARCHED_20_DESTINATIONS).toBeDefined();
      expect(RESEARCHED_20_DESTINATIONS).toBe(RESEARCHED_22_DESTINATIONS);
    });

    it('has unique slugs (no duplicates)', () => {
      const slugs = RESEARCHED_DESTINATIONS.map((d) => d.slug);
      const unique = new Set(slugs);
      expect(slugs.length).toBe(unique.size);
    });

    it('has valid URL-safe slugs', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        expect(d.slug).toMatch(/^[a-z0-9-]+$/);
      });
    });

    it('all destinations have editorialStatus = published in core set', () => {
      RESEARCHED_22_DESTINATIONS.forEach((d) => {
        expect(d.editorialStatus).toBe('published');
      });
    });
  });

  // ─── B. Evidence Classification ───────────────────────────────────────
  describe('B. Evidence classification', () => {
    const VALID_CLASSIFICATIONS = ['DOCUMENTED', 'LOCAL_TRADITION', 'DISPUTED', 'UNKNOWN'] as const;

    it('all destinations have a valid overall evidence classification', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        expect(VALID_CLASSIFICATIONS).toContain(d.evidenceClassification);
      });
    });

    it('all evidence items have valid classification values', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        d.evidenceItems.forEach((item) => {
          expect(VALID_CLASSIFICATIONS).toContain(item.classification);
        });
      });
    });

    it('every destination has at least one evidence item', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        expect(d.evidenceItems.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('evidence items have sequential displayOrder', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        const orders = d.evidenceItems.map((e) => e.displayOrder);
        orders.forEach((order, i) => {
          expect(order).toBe(i + 1);
        });
      });
    });

    it('LOCAL_TRADITION items are explicitly labeled in their content', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        d.evidenceItems
          .filter((e) => e.classification === 'LOCAL_TRADITION')
          .forEach((item) => {
            const lowerContent = item.content.toLowerCase();
            const hasQualifier =
              lowerContent.includes('tradition') ||
              lowerContent.includes('folklore') ||
              lowerContent.includes('oral') ||
              lowerContent.includes('local') ||
              lowerContent.includes('legend') ||
              lowerContent.includes('popular') ||
              lowerContent.includes('lore') ||
              lowerContent.includes('asserts') ||
              lowerContent.includes('accounts') ||
              lowerContent.includes('identifies');
            expect(hasQualifier).toBe(true);
          });
      });
    });

    it('DISPUTED items explain what is disputed', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        d.evidenceItems
          .filter((e) => e.classification === 'DISPUTED')
          .forEach((item) => {
            const lowerContent = item.content.toLowerCase();
            const hasClarification =
              lowerContent.includes('while') ||
              lowerContent.includes('however') ||
              lowerContent.includes('dispute') ||
              lowerContent.includes('attribute') ||
              lowerContent.includes('indicate') ||
              lowerContent.includes('suggest');
            expect(hasClarification).toBe(true);
          });
      });
    });
  });

  // ─── C. Source Audit ──────────────────────────────────────────────────
  describe('C. Source validation', () => {
    const VALID_SOURCE_TYPES = [
      'GOVERNMENT', 'ARCHAEOLOGICAL', 'ACADEMIC', 'MUSEUM',
      'OFFICIAL_TOURISM', 'ARCHIVAL', 'NEWS', 'OTHER',
    ] as const;

    it('every destination has at least one source', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        expect(d.sources.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('all sources have valid sourceType values', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        d.sources.forEach((src) => {
          expect(VALID_SOURCE_TYPES).toContain(src.sourceType);
        });
      });
    });

    it('all source URLs (when present) are valid HTTP(S) URLs', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        d.sources.forEach((src) => {
          if (src.url) {
            expect(src.url).toMatch(/^https?:\/\//);
          }
        });
      });
    });

    it('all sources have non-empty title and publisher', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        d.sources.forEach((src) => {
          expect(src.title.trim().length).toBeGreaterThan(0);
          expect(src.publisher.trim().length).toBeGreaterThan(0);
        });
      });
    });
  });

  // ─── D. Coordinate Verification ──────────────────────────────────────
  describe('D. Coordinate verification', () => {
    const INDIA = { latMin: 6.5, latMax: 37.1, lonMin: 68.1, lonMax: 97.4 };

    it('all coordinates are within India bounds', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        expect(d.latitude).toBeGreaterThanOrEqual(INDIA.latMin);
        expect(d.latitude).toBeLessThanOrEqual(INDIA.latMax);
        expect(d.longitude).toBeGreaterThanOrEqual(INDIA.lonMin);
        expect(d.longitude).toBeLessThanOrEqual(INDIA.lonMax);
      });
    });

    it('all coordinates have at least 3 decimal places (not city centroids)', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        const latDec = d.latitude.toString().includes('.')
          ? d.latitude.toString().split('.')[1].length
          : 0;
        const lonDec = d.longitude.toString().includes('.')
          ? d.longitude.toString().split('.')[1].length
          : 0;
        expect(latDec).toBeGreaterThanOrEqual(3);
        expect(lonDec).toBeGreaterThanOrEqual(3);
      });
    });

    it('all coordinates have provenance documented', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        expect(d.coordinateSource.trim().length).toBeGreaterThan(0);
      });
    });
  });

  // ─── E. Practical Visit Information ───────────────────────────────────
  describe('E. Practical visit information', () => {
    it('all destinations have visit info', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        expect(d.visitInfo).toBeDefined();
        expect(d.visitInfo.entryFee.trim().length).toBeGreaterThan(0);
        expect(d.visitInfo.openingInformation.trim().length).toBeGreaterThan(0);
        expect(d.visitInfo.accessInformation.trim().length).toBeGreaterThan(0);
        expect(d.visitInfo.bestTimeInformation.trim().length).toBeGreaterThan(0);
      });
    });

    it('all destinations have valid fee types', () => {
      const VALID_FEE_TYPES = ['free', 'per_person', 'discretionary', 'permit_required'];
      RESEARCHED_DESTINATIONS.forEach((d) => {
        expect(VALID_FEE_TYPES).toContain(d.visitInfo.feeType);
      });
    });

    it('Gondhla fee wording is exactly as approved', () => {
      const gondhla = RESEARCHED_DESTINATIONS.find(
        (d) => d.slug === 'gondhla-tower-fort-lahaul'
      );
      expect(gondhla).toBeDefined();
      expect(gondhla!.visitInfo.entryFee).toBe(
        'An informal preservation fee may be collected on-site by the caretaker family; amount and availability may vary.'
      );
      expect(gondhla!.visitInfo.feeType).toBe('discretionary');
      expect(gondhla!.visitInfo.isFeeVerified).toBe(false);
    });

    it('valid difficulty values', () => {
      const VALID = ['easy', 'moderate', 'challenging', 'strenuous'];
      RESEARCHED_DESTINATIONS.forEach((d) => {
        expect(VALID).toContain(d.difficulty);
      });
    });
  });

  // ─── F. Destination Granularity ───────────────────────────────────────
  describe('F. Destination granularity preservation', () => {
    it('separate destinations exist individually', () => {
      const SEPARATE_SLUGS = [
        'jal-mahal-narnaul',
        'chor-gumbad-narnaul',
        'kalesar-iron-suspension-bridge',
        'kalesar-forest-dak-bungalow',
        'bassi-baoli-pinjore',
      ];
      SEPARATE_SLUGS.forEach((slug) => {
        expect(RESEARCHED_DESTINATIONS.find((d) => d.slug === slug)).toBeDefined();
      });
    });

    it('combined destinations exist as single entries', () => {
      const COMBINED_SLUGS = [
        'sheikh-chehli-tomb-kurukshetra',
        'buria-rang-mahal-yamunanagar',
        'bhima-devi-temple-pinjore',
      ];
      COMBINED_SLUGS.forEach((slug) => {
        expect(RESEARCHED_DESTINATIONS.find((d) => d.slug === slug)).toBeDefined();
      });
    });
  });

  // ─── G. Image Audit ──────────────────────────────────────────────────
  describe('G. Image placeholder audit', () => {
    it('all 22 destinations have at least one image', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        expect(d.images.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('all images are flagged for editorial replacement in core 22 destinations', () => {
      RESEARCHED_22_DESTINATIONS.forEach((d) => {
        d.images.forEach((img) => {
          expect(img.requiresEditorialReplacement).toBe(true);
        });
      });
    });

    it('all image captions clearly identify as representative/placeholder in core 22 destinations', () => {
      RESEARCHED_22_DESTINATIONS.forEach((d) => {
        d.images.forEach((img) => {
          const hasDisclosure =
            img.caption.includes('Representative') ||
            img.caption.includes('Flagged') ||
            img.caption.includes('Placeholder');
          expect(hasDisclosure).toBe(true);
        });
      });
    });

    it('no image credit implies actual site photography in core 22 destinations', () => {
      RESEARCHED_22_DESTINATIONS.forEach((d) => {
        d.images.forEach((img) => {
          const isStock =
            img.credit.includes('Unsplash') ||
            img.credit.includes('Stock') ||
            img.credit.includes('Representative') ||
            img.credit.includes('Pending');
          expect(isStock).toBe(true);
        });
      });
    });
  });

  // ─── H. SEO / Content ────────────────────────────────────────────────
  describe('H. SEO and content', () => {
    it('all destinations have non-empty shortDescription', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        expect(d.shortDescription.trim().length).toBeGreaterThan(10);
      });
    });

    it('all destinations have non-empty longDescription', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        expect(d.longDescription.trim().length).toBeGreaterThan(50);
      });
    });

    it('all destinations have at least one category', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        expect(d.categorySlugs.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('all destinations have valid state names', () => {
      const VALID_STATES = ['Punjab', 'Haryana', 'Himachal Pradesh', 'Chandigarh', 'Rajasthan', 'Delhi'];
      RESEARCHED_DESTINATIONS.forEach((d) => {
        expect(VALID_STATES).toContain(d.state);
      });
    });

    it('known district spellings are correct for core destinations', () => {
      const KNOWN_DISTRICTS = new Set([
        'Bathinda', 'Yamunanagar', 'Bhiwani', 'Kurukshetra', 'Mahendragarh',
        'Nuh (Mewat)', 'Kangra', 'Lahaul and Spiti', 'Chamba', 'Fatehgarh Sahib',
        'Ludhiana', 'Faridkot', 'Chandigarh', 'Panchkula', 'Hanumangarh', 'Solan',
      ]);
      RESEARCHED_22_DESTINATIONS.forEach((d) => {
        expect(KNOWN_DISTRICTS.has(d.district)).toBe(true);
      });
    });
  });

  // ─── I. Collection Audit ─────────────────────────────────────────────
  describe('I. Collection consistency', () => {
    const allDestSlugs = new Set(RESEARCHED_DESTINATIONS.map((d) => d.slug));

    it('contains exactly 5 collections', () => {
      expect(RESEARCHED_COLLECTIONS.length).toBe(5);
    });

    it('all collection waypoints reference valid destination slugs', () => {
      RESEARCHED_COLLECTIONS.forEach((c) => {
        c.waypoints.forEach((wp) => {
          expect(allDestSlugs.has(wp.destinationSlug)).toBe(true);
        });
      });
    });

    it('all collection waypoints have sequential sequence numbers', () => {
      RESEARCHED_COLLECTIONS.forEach((c) => {
        c.waypoints.forEach((wp, i) => {
          expect(wp.sequence).toBe(i + 1);
        });
      });
    });

    it('no collection has duplicate destinations', () => {
      RESEARCHED_COLLECTIONS.forEach((c) => {
        const slugs = c.waypoints.map((wp) => wp.destinationSlug);
        const unique = new Set(slugs);
        expect(slugs.length).toBe(unique.size);
      });
    });

    it('all collections have unique slugs', () => {
      const slugs = RESEARCHED_COLLECTIONS.map((c) => c.slug);
      const unique = new Set(slugs);
      expect(slugs.length).toBe(unique.size);
    });

    it('all collections have published status', () => {
      RESEARCHED_COLLECTIONS.forEach((c) => {
        expect(c.editorialStatus).toBe('published');
      });
    });
  });

  // ─── J. Provenance & Practical Info Integrity ───────────────────────
  describe('J. Provenance & practical information integrity', () => {
    it('destination count remains exactly 22 in core published set', () => {
      expect(RESEARCHED_22_DESTINATIONS.length).toBe(22);
    });

    it('all source URLs when present are valid, well-formed HTTPS URLs with no malformed syntax', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        d.sources.forEach((s) => {
          if (s.url) {
            const urlString = s.url;
            expect(() => new URL(urlString)).not.toThrow();
            expect(urlString).toMatch(/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}/i);
            expect(urlString).not.toContain(' ');
            expect(urlString).not.toContain('<');
            expect(urlString).not.toContain('>');
          }
        });
      });
    });

    it('unlinked sources explicitly retain bibliographic notice in notes across all destinations', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        d.sources.forEach((s) => {
          if (!s.url) {
            expect(s.notes).toBeDefined();
            expect(s.notes).toContain('Digital source unavailable — bibliographic citation retained.');
          }
        });
      });
    });

    it('Gondhla Tower Fort fee wording and attributes remain strictly preserved', () => {
      const gondhla = RESEARCHED_DESTINATIONS.find((d) => d.slug === 'gondhla-tower-fort-lahaul');
      expect(gondhla).toBeDefined();
      expect(gondhla!.visitInfo.entryFee).toBe(
        'An informal preservation fee may be collected on-site by the caretaker family; amount and availability may vary.'
      );
      expect(gondhla!.visitInfo.feeType).toBe('discretionary');
      expect(gondhla!.visitInfo.isFeeVerified).toBe(false);
    });

    it('unknown or discretionary fees are not converted to zero or free', () => {
      const discretionary = RESEARCHED_DESTINATIONS.filter(
        (d) => d.visitInfo.feeType === 'discretionary'
      );
      expect(discretionary.length).toBeGreaterThanOrEqual(1);
      discretionary.forEach((d) => {
        expect(d.visitInfo.entryFee).not.toBe('₹0');
        expect(d.visitInfo.entryFee).not.toBe('0');
        expect(d.visitInfo.entryFee).not.toBe('Free');
        expect(d.visitInfo.isFeeVerified).toBe(false);
      });
    });

    it('all 7 Batch 1 first-publication destinations maintain requiresEditorialReplacement true', () => {
      const batch1Slugs = [
        'bhima-devi-temple-pinjore',
        'bassi-baoli-pinjore',
        'burail-fort-bastion-chandigarh',
        'sheikh-chehli-tomb-kurukshetra',
        'aam-khas-bagh-sirhind',
        'mughal-sarai-doraha-ludhiana',
        'jal-mahal-narnaul',
      ];
      const batch1 = RESEARCHED_DESTINATIONS.filter((d) => batch1Slugs.includes(d.slug));
      expect(batch1.length).toBe(7);

      batch1.forEach((dest) => {
        expect(dest.images.length).toBeGreaterThanOrEqual(1);
        dest.images.forEach((img) => {
          expect(img.requiresEditorialReplacement).toBe(true);
          expect(img.credit).toContain('Representative Stock');
        });
      });
    });
  });
});
