import { describe, it, expect } from 'vitest';
import { RESEARCHED_COLLECTIONS } from '../../db/collections-data';
import { RESEARCHED_DESTINATIONS } from '../../db/destinations-data';

describe('Phase 6 Initial Curated Collections Dataset Verification', () => {
  it('contains exactly 5 curated initial collections', () => {
    expect(RESEARCHED_COLLECTIONS.length).toBe(5);
  });

  it('all collection slugs are lowercase, hyphen-separated, and unique', () => {
    const slugs = RESEARCHED_COLLECTIONS.map((c) => c.slug);
    const uniqueSlugs = new Set(slugs);

    expect(uniqueSlugs.size).toBe(RESEARCHED_COLLECTIONS.length);

    slugs.forEach((slug) => {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    });
  });

  it('all collection waypoints reference verified destinations that actually exist in the catalog', () => {
    const validDestSlugs = new Set(RESEARCHED_DESTINATIONS.map((d) => d.slug));

    RESEARCHED_COLLECTIONS.forEach((collection) => {
      expect(collection.waypoints.length).toBeGreaterThan(0);
      expect(collection.waypoints.length).toBeLessThanOrEqual(10); // Each initial collection is within 10 stops

      collection.waypoints.forEach((wp) => {
        expect(
          validDestSlugs.has(wp.destinationSlug),
          `Destination "${wp.destinationSlug}" in collection "${collection.title}" does not exist in destination catalog!`
        ).toBe(true);

        expect(wp.editorialNote).toBeDefined();
        expect(wp.editorialNote.length).toBeGreaterThan(10);
      });
    });
  });

  it('waypoint sequences are 1-indexed and strictly sequential without gaps', () => {
    RESEARCHED_COLLECTIONS.forEach((collection) => {
      collection.waypoints.forEach((wp, idx) => {
        expect(wp.sequence).toBe(idx + 1);
      });
    });
  });

  it('all collections have non-empty factual descriptions, region, theme, and cover image', () => {
    RESEARCHED_COLLECTIONS.forEach((collection) => {
      expect(collection.title).toBeTruthy();
      expect(collection.shortDescription.length).toBeGreaterThan(20);
      expect(collection.description.length).toBeGreaterThan(50);
      expect(collection.region).toBeTruthy();
      expect(collection.theme).toBeTruthy();
      expect(collection.coverImageUrl).toBeTruthy();
      expect(collection.editorialStatus).toBe('published');
    });
  });
});
