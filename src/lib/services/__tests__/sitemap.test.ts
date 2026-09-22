import { describe, it, expect, vi } from 'vitest';
import sitemap from '../../../app/sitemap';
import { RESEARCHED_DESTINATIONS } from '../../db/destinations-data';
import { RESEARCHED_COLLECTIONS } from '../../db/collections-data';

vi.mock('../../db', () => ({
  db: null, // Test static fallback behavior
  destinations: {},
  collections: {},
}));

describe('Sitemap Generator Integration Tests', () => {
  it('generates a valid sitemap with static roots, published destinations, and published collections', async () => {
    const entries = await sitemap();
    expect(entries.length).toBeGreaterThan(0);

    const urls = entries.map((e) => e.url);

    const expectedBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hiddenindia.pages.dev';

    // Root paths
    expect(urls).toContain(expectedBaseUrl);
    expect(urls).toContain(`${expectedBaseUrl}/collections`);
    expect(urls).toContain(`${expectedBaseUrl}/destinations`);
    expect(urls).toContain(`${expectedBaseUrl}/map`);
    expect(urls).toContain(`${expectedBaseUrl}/search`);

    // Published destinations
    const publishedDests = RESEARCHED_DESTINATIONS.filter((d) => d.editorialStatus === 'published');
    publishedDests.forEach((dest) => {
      expect(urls).toContain(`${expectedBaseUrl}/destinations/${dest.slug}`);
    });

    // Published collections
    const publishedColls = RESEARCHED_COLLECTIONS.filter((c) => c.editorialStatus === 'published');
    publishedColls.forEach((coll) => {
      expect(urls).toContain(`${expectedBaseUrl}/collections/${coll.slug}`);
    });

    // Strictly exclude private or admin routes
    urls.forEach((url) => {
      expect(url).not.toContain('/admin');
      expect(url).not.toContain('/account');
      expect(url).not.toContain('/saved');
      expect(url).not.toContain('/trips/');
    });
  });
});
