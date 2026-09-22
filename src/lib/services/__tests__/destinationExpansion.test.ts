import { describe, it, expect } from 'vitest';
import {
  RESEARCHED_DESTINATIONS,
  RESEARCHED_22_DESTINATIONS,
  EXPANSION_30_DESTINATIONS,
} from '../../db/destinations-data';

describe('Destination Expansion Batch (53-Destination Catalog)', () => {
  // ─── 1. Duplicate Prevention ──────────────────────────────────────────
  describe('Duplicate prevention across catalog', () => {
    it('has zero duplicate slugs across all 53 destinations', () => {
      const slugs = RESEARCHED_DESTINATIONS.map((d) => d.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
      expect(slugs.length).toBe(53);
    });

    it('has zero duplicate destination names across all 53 destinations', () => {
      const names = RESEARCHED_DESTINATIONS.map((d) => d.name.toLowerCase().trim());
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('has zero identical coordinate pairs across all 53 destinations', () => {
      const coordKeys = RESEARCHED_DESTINATIONS.map(
        (d) => `${d.latitude.toFixed(4)},${d.longitude.toFixed(4)}`
      );
      const uniqueCoords = new Set(coordKeys);
      expect(uniqueCoords.size).toBe(coordKeys.length);
    });
  });

  // ─── 2. Dataset Counts & Segregation ──────────────────────────────────
  describe('Dataset counts and core preservation', () => {
    it('contains exactly 53 total destinations', () => {
      expect(RESEARCHED_DESTINATIONS.length).toBe(53);
    });

    it('preserves exactly 22 core published destinations in RESEARCHED_22_DESTINATIONS', () => {
      expect(RESEARCHED_22_DESTINATIONS).toBeDefined();
      expect(RESEARCHED_22_DESTINATIONS.length).toBe(22);
      RESEARCHED_22_DESTINATIONS.forEach((d) => {
        expect(d.editorialStatus).toBe('published');
      });
    });

    it('contains exactly 31 expansion candidate destinations in EXPANSION_30_DESTINATIONS', () => {
      expect(EXPANSION_30_DESTINATIONS).toBeDefined();
      expect(EXPANSION_30_DESTINATIONS.length).toBe(31);
      EXPANSION_30_DESTINATIONS.forEach((d) => {
        expect(d.editorialStatus).toBe('draft');
      });
    });

    it('preserves the original 22 destination slugs in their exact original order', () => {
      const original22Slugs = [
        'qila-mubarak-bathinda',
        'buria-rang-mahal-yamunanagar',
        'tosham-rock-inscription-bhiwani',
        'sheikh-chehli-tomb-kurukshetra',
        'jal-mahal-narnaul',
        'chor-gumbad-narnaul',
        'kotla-fort-mosque-nuh-mewat',
        'masrur-rock-cut-temples-kangra',
        'tabo-monastic-meditation-caves-spiti',
        'killar-kishtwar-cliff-road-pangi',
        'gondhla-tower-fort-lahaul',
        'pragpur-heritage-village-kangra',
        'aam-khas-bagh-sirhind',
        'mughal-sarai-doraha-ludhiana',
        'faridkot-raj-mahal-clock-tower',
        'burail-fort-bastion-chandigarh',
        'bhima-devi-temple-pinjore',
        'kalesar-iron-suspension-bridge',
        'kalesar-forest-dak-bungalow',
        'bhatner-fort-hanumangarh',
        'bassi-baoli-pinjore',
        'dagshai-heritage-jail-catacombs',
      ];

      original22Slugs.forEach((slug, idx) => {
        expect(RESEARCHED_DESTINATIONS[idx].slug).toBe(slug);
        expect(RESEARCHED_22_DESTINATIONS[idx].slug).toBe(slug);
      });
    });
  });

  // ─── 3. Regional Distribution ─────────────────────────────────────────
  describe('Regional distribution across Northern India', () => {
    it('has correct destination counts per state', () => {
      const byState: Record<string, number> = {};
      RESEARCHED_DESTINATIONS.forEach((d) => {
        byState[d.state] = (byState[d.state] || 0) + 1;
      });

      expect(byState['Delhi']).toBe(8);
      expect(byState['Rajasthan']).toBe(8); // 1 core + 7 expansion
      expect(byState['Haryana']).toBe(16); // 10 core + 6 expansion
      expect(byState['Himachal Pradesh']).toBe(10); // 6 core + 4 expansion
      expect(byState['Punjab']).toBe(10); // 4 core + 6 expansion
      expect(byState['Chandigarh']).toBe(1); // 1 core
    });
  });

  // ─── 4. Geographic & Coordinate Validation ────────────────────────────
  describe('Geographic coordinate integrity', () => {
    it('every destination has valid coordinates within Northern India bounds', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        expect(d.latitude).toBeGreaterThanOrEqual(24.0);
        expect(d.latitude).toBeLessThanOrEqual(34.0);
        expect(d.longitude).toBeGreaterThanOrEqual(70.0);
        expect(d.longitude).toBeLessThanOrEqual(79.0);
        expect(d.coordinateSource).toBeDefined();
        expect(d.coordinateSource.length).toBeGreaterThan(10);
      });
    });

    it('every destination slug follows standard kebab-case format', () => {
      const kebabRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      RESEARCHED_DESTINATIONS.forEach((d) => {
        expect(d.slug).toMatch(kebabRegex);
      });
    });
  });

  // ─── 5. Editorial Publication Gate ────────────────────────────────────
  describe('Editorial publication gate and draft safeguards', () => {
    it('only the 22 core destinations are marked published', () => {
      const published = RESEARCHED_DESTINATIONS.filter((d) => d.editorialStatus === 'published');
      expect(published.length).toBe(22);
    });

    it('all 31 expansion candidate destinations are restricted to draft status', () => {
      const drafts = EXPANSION_30_DESTINATIONS.filter((d) => d.editorialStatus === 'draft');
      expect(drafts.length).toBe(31);
    });
  });

  // ─── 6. Evidence Classification & Source Standards ────────────────────
  describe('Evidence classification and source rigor', () => {
    it('every destination has at least one authoritative source', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        expect(d.sources.length).toBeGreaterThanOrEqual(1);
        d.sources.forEach((s) => {
          expect(s.title).toBeDefined();
          expect(s.publisher).toBeDefined();
          expect(['GOVERNMENT', 'ARCHAEOLOGICAL', 'ACADEMIC', 'MUSEUM', 'OFFICIAL_TOURISM', 'ARCHIVAL', 'OTHER']).toContain(s.sourceType);
        });
      });
    });

    it('every destination has structured evidence items with documented citations', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        expect(d.evidenceItems.length).toBeGreaterThanOrEqual(1);
        d.evidenceItems.forEach((ev) => {
          expect(['DOCUMENTED', 'LOCAL_TRADITION', 'DISPUTED', 'UNKNOWN']).toContain(ev.classification);
          expect(ev.sectionTitle.length).toBeGreaterThan(5);
          expect(ev.content.length).toBeGreaterThan(20);
          expect(ev.citationNotes.length).toBeGreaterThan(5);
        });
      });
    });
  });

  // ─── 7. Photography Safeguards ────────────────────────────────────────
  describe('Photography safeguards and placeholder protection', () => {
    it('unverified destinations maintain requiresEditorialReplacement true and verified images have false', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        expect(d.images.length).toBeGreaterThanOrEqual(1);
        d.images.forEach((img) => {
          if (img.editorialStatus === 'VERIFIED_THIRD_PARTY') {
            expect(img.requiresEditorialReplacement).toBe(false);
          } else {
            expect(img.requiresEditorialReplacement).toBe(true);
          }
        });
      });
    });

    it('all expansion candidates have valid roles and photography status', () => {
      EXPANSION_30_DESTINATIONS.forEach((d) => {
        d.images.forEach((img) => {
          expect(['hero', 'detail', 'context']).toContain(img.role);
          expect(['PENDING_PHOTOGRAPHY', 'PENDING_LICENSE_VERIFICATION', 'VERIFIED_THIRD_PARTY']).toContain(img.editorialStatus);
        });
      });
    });

    it('validates photography status model against permitted editorial statuses', () => {
      const PERMITTED_IMAGE_STATUSES = [
        'VERIFIED',
        'PENDING_PHOTOGRAPHY',
        'PENDING_LICENSE_VERIFICATION',
        'VERIFIED_THIRD_PARTY',
        'VERIFIED_FIELD',
        'REJECTED',
        'PENDING_PROVENANCE',
        'NEEDS_REPLACEMENT',
      ];

      RESEARCHED_DESTINATIONS.forEach((d) => {
        d.images.forEach((img) => {
          if (img.editorialStatus) {
            expect(PERMITTED_IMAGE_STATUSES).toContain(img.editorialStatus);
          }
        });
      });
    });
  });

  // ─── 8. Strict Original 22 Dataset Preservation ────────────────────────
  describe('Strict original 22 published dataset preservation', () => {
    const EXPECTED_22_CORE = [
      { slug: 'qila-mubarak-bathinda', name: 'Qila Mubarak (Bathinda Fort)', lat: 30.211, lon: 74.9455, sources: 2 },
      { slug: 'buria-rang-mahal-yamunanagar', name: 'Buria Rang Mahal & Birbal Gateway', lat: 30.1583, lon: 77.3486, sources: 2 },
      { slug: 'tosham-rock-inscription-bhiwani', name: 'Tosham Rock Inscription & Baradari', lat: 28.8778, lon: 75.9142, sources: 2 },
      { slug: 'sheikh-chehli-tomb-kurukshetra', name: 'Sheikh Chehli’s Tomb & Harsh Ka Tila', lat: 29.9806, lon: 76.8258, sources: 2 },
      { slug: 'jal-mahal-narnaul', name: 'Jal Mahal, Narnaul', lat: 28.0467, lon: 76.1089, sources: 2 },
      { slug: 'chor-gumbad-narnaul', name: 'Chor Gumbad, Narnaul', lat: 28.0645, lon: 76.1152, sources: 2 },
      { slug: 'kotla-fort-mosque-nuh-mewat', name: 'Kotla Fort & Mosque (Khanzada Citadel)', lat: 28.0083, lon: 77.0583, sources: 2 },
      { slug: 'masrur-rock-cut-temples-kangra', name: 'Masrur Rock-Cut Temples (Himalayan Monoliths)', lat: 32.0542, lon: 76.1486, sources: 2 },
      { slug: 'tabo-monastic-meditation-caves-spiti', name: 'Tabo Monastic Meditation Caves', lat: 32.0928, lon: 78.3814, sources: 2 },
      { slug: 'killar-kishtwar-cliff-road-pangi', name: 'Killar-Kishtwar Cliff Road & Chenab Gorge', lat: 33.0889, lon: 76.4306, sources: 2 },
      { slug: 'gondhla-tower-fort-lahaul', name: 'Gondhla Tower Fort (Eight-Storey Timber Castle)', lat: 32.4861, lon: 77.0111, sources: 2 },
      { slug: 'pragpur-heritage-village-kangra', name: 'Pragpur Heritage Village & Lal Haveli', lat: 31.8194, lon: 76.2167, sources: 2 },
      { slug: 'aam-khas-bagh-sirhind', name: 'Aam Khas Bagh (Sirhind)', lat: 30.6389, lon: 76.3889, sources: 2 },
      { slug: 'mughal-sarai-doraha-ludhiana', name: 'Mughal Sarai Doraha (Sarai Lashkari Khan)', lat: 30.8056, lon: 76.0278, sources: 1 },
      { slug: 'faridkot-raj-mahal-clock-tower', name: 'Faridkot Raj Mahal & Victoria Clock Tower', lat: 30.6778, lon: 74.7556, sources: 1 },
      { slug: 'burail-fort-bastion-chandigarh', name: 'Burail Fort Bastion (Sector 45)', lat: 30.7083, lon: 76.7583, sources: 2 },
      { slug: 'bhima-devi-temple-pinjore', name: 'Bhima Devi Temple Complex (Pinjore)', lat: 30.7972, lon: 76.9167, sources: 1 },
      { slug: 'kalesar-iron-suspension-bridge', name: 'Kalesar Colonial Red Iron Bridge', lat: 30.3472, lon: 77.5806, sources: 2 },
      { slug: 'kalesar-forest-dak-bungalow', name: 'Kalesar Forest Dak Bungalow', lat: 30.3425, lon: 77.575, sources: 2 },
      { slug: 'bhatner-fort-hanumangarh', name: 'Bhatner Fort (Hanumangarh)', lat: 29.5806, lon: 74.325, sources: 2 },
      { slug: 'bassi-baoli-pinjore', name: 'Bassi Baoli (Pinjore Stepwell)', lat: 30.825, lon: 76.9389, sources: 1 },
      { slug: 'dagshai-heritage-jail-catacombs', name: 'Dagshai Heritage Jail & Catacombs', lat: 30.8814, lon: 77.0512, sources: 2 },
    ];

    it('verifies all 22 core destinations retain exact identity, coordinates, and source counts', () => {
      EXPECTED_22_CORE.forEach((expected, i) => {
        const actual = RESEARCHED_22_DESTINATIONS[i];
        expect(actual.slug).toBe(expected.slug);
        expect(actual.name).toBe(expected.name);
        expect(actual.latitude).toBeCloseTo(expected.lat, 3);
        expect(actual.longitude).toBeCloseTo(expected.lon, 3);
        expect(actual.sources.length).toBe(expected.sources);
        expect(actual.editorialStatus).toBe('published');
        expect(actual.images[0].requiresEditorialReplacement).toBe(true);
      });
    });
  });

  // ─── 9. Sitemap & Search Protection ───────────────────────────────────
  describe('Sitemap and discovery isolation for draft candidates', () => {
    it('ensures published filter strictly isolates 22 destinations from sitemap inclusion', () => {
      const sitemapEligible = RESEARCHED_DESTINATIONS.filter((d) => d.editorialStatus === 'published');
      expect(sitemapEligible.length).toBe(22);

      const sitemapSlugs = new Set(sitemapEligible.map((d) => d.slug));
      EXPANSION_30_DESTINATIONS.forEach((draft) => {
        expect(sitemapSlugs.has(draft.slug)).toBe(false);
      });
    });

    it('all unlinked sources across catalog retain standard bibliographic notice', () => {
      RESEARCHED_DESTINATIONS.forEach((d) => {
        d.sources.forEach((s) => {
          if (!s.url) {
            expect(s.notes).toBeDefined();
            expect(s.notes).toContain('Digital source unavailable — bibliographic citation retained.');
          }
        });
      });
    });
  });
});

