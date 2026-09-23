import { MetadataRoute } from 'next';
import { db, destinations, collections } from '../lib/db';
import { eq } from 'drizzle-orm';
import { EditorialStatus } from '../lib/types/enums';
import { RESEARCHED_DESTINATIONS } from '../lib/db/destinations-data';
import { RESEARCHED_COLLECTIONS } from '../lib/db/collections-data';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hidden-india-lime.vercel.app';

  // 1. Static Public Roots
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/destinations`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/map`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // 2. Published Destinations (strictly published only)
  let destSlugs: string[] = [];
  if (db) {
    const publishedDests = await db
      .select({ slug: destinations.slug, updatedAt: destinations.updatedAt })
      .from(destinations)
      .where(eq(destinations.editorialStatus, EditorialStatus.PUBLISHED));

    destSlugs = publishedDests.map((d) => d.slug);
  } else {
    // Fallback to verified seed catalog during static build/no DB
    destSlugs = RESEARCHED_DESTINATIONS.filter(
      (d) => d.editorialStatus === 'published'
    ).map((d) => d.slug);
  }

  const destinationRoutes: MetadataRoute.Sitemap = destSlugs.map((slug) => ({
    url: `${baseUrl}/destinations/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 3. Published Collections (strictly published only)
  let collSlugs: string[] = [];
  if (db) {
    const publishedColls = await db
      .select({ slug: collections.slug, updatedAt: collections.updatedAt })
      .from(collections)
      .where(eq(collections.editorialStatus, EditorialStatus.PUBLISHED));

    collSlugs = publishedColls.map((c) => c.slug);
  } else {
    collSlugs = RESEARCHED_COLLECTIONS.filter(
      (c) => c.editorialStatus === 'published'
    ).map((c) => c.slug);
  }

  const collectionRoutes: MetadataRoute.Sitemap = collSlugs.map((slug) => ({
    url: `${baseUrl}/collections/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  return [...staticRoutes, ...collectionRoutes, ...destinationRoutes];
}
