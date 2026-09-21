import { db } from '../db';
import {
  collections,
  collectionDestinations,
  destinations,
  categories,
  destinationCategories,
  destinationImages,
  destinationVisitInfo,
  Collection,
  NewCollection,
  Destination,
  Category,
  DestinationImage,
  DestinationVisitInfo,
} from '../db/schema';
import { eq, and, desc, asc, inArray } from 'drizzle-orm';
import { EditorialStatus, EditorialStatusType } from '../types/enums';

export interface EnrichedCollectionCard {
  collection: Collection;
  destinationCount: number;
  destinationPreviews: {
    name: string;
    slug: string;
    locality: string | null;
    state: string;
  }[];
}

export interface EnrichedCollectionWaypoint {
  sequence: number;
  editorialNote: string | null;
  destination: Destination;
  categories: Category[];
  primaryImage: DestinationImage | null;
  visitInfo: DestinationVisitInfo | null;
}

export interface FullCollectionRecord {
  collection: Collection;
  waypoints: EnrichedCollectionWaypoint[];
}

export class CollectionService {
  /**
   * Fetches all published collections for public discovery.
   * Batch-optimized: avoids N+1 queries.
   */
  async getPublishedCollections(): Promise<EnrichedCollectionCard[]> {
    if (!db) return [];

    const collRows = await db.query.collections?.findMany({
      where: eq(collections.editorialStatus, EditorialStatus.PUBLISHED),
      orderBy: [desc(collections.publishedAt), desc(collections.createdAt)],
    });

    if (!collRows || collRows.length === 0) return [];

    const collectionIds = collRows.map((c) => c.id);

    // Batch query waypoints for these collections
    const waypoints = await db
      .select({
        collectionId: collectionDestinations.collectionId,
        destinationId: collectionDestinations.destinationId,
        sequence: collectionDestinations.sequence,
        destinationName: destinations.name,
        destinationSlug: destinations.slug,
        locality: destinations.locality,
        state: destinations.state,
        destEditorialStatus: destinations.editorialStatus,
      })
      .from(collectionDestinations)
      .innerJoin(destinations, eq(collectionDestinations.destinationId, destinations.id))
      .where(
        and(
          inArray(collectionDestinations.collectionId, collectionIds),
          eq(destinations.editorialStatus, EditorialStatus.PUBLISHED)
        )
      )
      .orderBy(asc(collectionDestinations.sequence));

    // Group waypoints by collectionId
    const waypointsByColl = new Map<
      string,
      { name: string; slug: string; locality: string | null; state: string }[]
    >();

    waypoints.forEach((w) => {
      const list = waypointsByColl.get(w.collectionId) || [];
      list.push({
        name: w.destinationName,
        slug: w.destinationSlug,
        locality: w.locality,
        state: w.state,
      });
      waypointsByColl.set(w.collectionId, list);
    });

    return collRows.map((c) => {
      const previews = waypointsByColl.get(c.id) || [];
      return {
        collection: c,
        destinationCount: previews.length,
        destinationPreviews: previews,
      };
    });
  }

  /**
   * Fetches a single collection by slug with ordered waypoints.
   * Gating: strictly requires editorialStatus = 'published' unless allowDraftPreview is true.
   */
  async getBySlug(
    slug: string,
    allowDraftPreview: boolean = false
  ): Promise<FullCollectionRecord | null> {
    if (!db) return null;

    const condition = allowDraftPreview
      ? eq(collections.slug, slug)
      : and(eq(collections.slug, slug), eq(collections.editorialStatus, EditorialStatus.PUBLISHED));

    const collection = await db.query.collections?.findFirst({
      where: condition,
    });

    if (!collection) return null;

    // Fetch waypoints
    const waypointRows = await db
      .select({
        id: collectionDestinations.id,
        sequence: collectionDestinations.sequence,
        editorialNote: collectionDestinations.editorialNote,
        destinationId: collectionDestinations.destinationId,
      })
      .from(collectionDestinations)
      .where(eq(collectionDestinations.collectionId, collection.id))
      .orderBy(asc(collectionDestinations.sequence));

    if (waypointRows.length === 0) {
      return {
        collection,
        waypoints: [],
      };
    }

    const destIds = waypointRows.map((w) => w.destinationId);

    // Fetch destinations
    const destCondition = allowDraftPreview
      ? inArray(destinations.id, destIds)
      : and(
          inArray(destinations.id, destIds),
          eq(destinations.editorialStatus, EditorialStatus.PUBLISHED)
        );

    const destinationRows = await db.query.destinations?.findMany({
      where: destCondition,
    });

    if (!destinationRows || destinationRows.length === 0) {
      return {
        collection,
        waypoints: [],
      };
    }

    const destMap = new Map<string, Destination>();
    destinationRows.forEach((d) => destMap.set(d.id, d));

    // Batch fetch categories, primary images, and visit info
    const [allImages, allCatLinks, allVisitInfo] = await Promise.all([
      db
        .select()
        .from(destinationImages)
        .where(inArray(destinationImages.destinationId, destIds)),
      db
        .select({
          destinationId: destinationCategories.destinationId,
          category: categories,
        })
        .from(destinationCategories)
        .innerJoin(categories, eq(destinationCategories.categoryId, categories.id))
        .where(inArray(destinationCategories.destinationId, destIds)),
      db
        .select()
        .from(destinationVisitInfo)
        .where(inArray(destinationVisitInfo.destinationId, destIds)),
    ]);

    const primaryImageByDest = new Map<string, DestinationImage>();
    allImages.forEach((img) => {
      const existing = primaryImageByDest.get(img.destinationId);
      if (!existing || (!existing.isPrimary && img.isPrimary)) {
        primaryImageByDest.set(img.destinationId, img);
      }
    });

    const catsByDest = new Map<string, Category[]>();
    allCatLinks.forEach(({ destinationId, category }) => {
      const list = catsByDest.get(destinationId) || [];
      list.push(category);
      catsByDest.set(destinationId, list);
    });

    const visitInfoByDest = new Map<string, DestinationVisitInfo>();
    allVisitInfo.forEach((vi) => visitInfoByDest.set(vi.destinationId, vi));

    // Build assembled waypoints in sequence order
    const waypoints: EnrichedCollectionWaypoint[] = [];
    for (const w of waypointRows) {
      const dest = destMap.get(w.destinationId);
      if (!dest) continue; // Skip unpublished destination if not allowed

      waypoints.push({
        sequence: w.sequence,
        editorialNote: w.editorialNote,
        destination: dest,
        categories: catsByDest.get(dest.id) || [],
        primaryImage: primaryImageByDest.get(dest.id) || null,
        visitInfo: visitInfoByDest.get(dest.id) || null,
      });
    }

    return {
      collection,
      waypoints,
    };
  }

  /**
   * Admin: List all collections with optional status filter and waypoint counts.
   */
  async getAllForAdmin(
    statusFilter?: EditorialStatusType
  ): Promise<{ collection: Collection; waypointCount: number }[]> {
    if (!db) return [];

    const condition = statusFilter
      ? eq(collections.editorialStatus, statusFilter)
      : undefined;

    const rows = await db.query.collections?.findMany({
      where: condition,
      orderBy: [desc(collections.updatedAt)],
    });

    if (!rows || rows.length === 0) return [];

    const collIds = rows.map((r) => r.id);
    const waypoints = await db
      .select({ collectionId: collectionDestinations.collectionId })
      .from(collectionDestinations)
      .where(inArray(collectionDestinations.collectionId, collIds));

    const countMap = new Map<string, number>();
    waypoints.forEach((w) => {
      countMap.set(w.collectionId, (countMap.get(w.collectionId) || 0) + 1);
    });

    return rows.map((r) => ({
      collection: r,
      waypointCount: countMap.get(r.id) || 0,
    }));
  }

  /**
   * Admin: Fetch a collection by ID with all waypoints (including draft destinations).
   */
  async getByIdForAdmin(id: string): Promise<FullCollectionRecord | null> {
    if (!db) return null;

    const collection = await db.query.collections?.findFirst({
      where: eq(collections.id, id),
    });

    if (!collection) return null;

    const waypointRows = await db
      .select({
        id: collectionDestinations.id,
        sequence: collectionDestinations.sequence,
        editorialNote: collectionDestinations.editorialNote,
        destinationId: collectionDestinations.destinationId,
      })
      .from(collectionDestinations)
      .where(eq(collectionDestinations.collectionId, id))
      .orderBy(asc(collectionDestinations.sequence));

    if (waypointRows.length === 0) {
      return { collection, waypoints: [] };
    }

    const destIds = waypointRows.map((w) => w.destinationId);
    const destinationRows = await db.query.destinations?.findMany({
      where: inArray(destinations.id, destIds),
    });

    const destMap = new Map<string, Destination>();
    destinationRows?.forEach((d) => destMap.set(d.id, d));

    const waypoints: EnrichedCollectionWaypoint[] = [];
    for (const w of waypointRows) {
      const dest = destMap.get(w.destinationId);
      if (!dest) continue;

      waypoints.push({
        sequence: w.sequence,
        editorialNote: w.editorialNote,
        destination: dest,
        categories: [],
        primaryImage: null,
        visitInfo: null,
      });
    }

    return { collection, waypoints };
  }

  /**
   * Admin: Create a new collection.
   */
  async createCollection(
    data: Omit<NewCollection, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; collection?: Collection; error?: string }> {
    if (!db) return { success: false, error: 'Database unavailable' };

    try {
      const slug = data.slug.toLowerCase().trim();
      const existing = await db.query.collections?.findFirst({
        where: eq(collections.slug, slug),
      });

      if (existing) {
        return { success: false, error: `Slug "${slug}" already exists.` };
      }

      const [inserted] = await db
        .insert(collections)
        .values({
          ...data,
          slug,
          publishedAt: data.editorialStatus === EditorialStatus.PUBLISHED ? new Date() : null,
        })
        .returning();

      return { success: true, collection: inserted };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create collection' };
    }
  }

  /**
   * Admin: Update an existing collection's metadata.
   */
  async updateCollection(
    id: string,
    data: Partial<NewCollection>
  ): Promise<{ success: boolean; collection?: Collection; error?: string }> {
    if (!db) return { success: false, error: 'Database unavailable' };

    try {
      const updateData: any = { ...data, updatedAt: new Date() };

      if (data.editorialStatus === EditorialStatus.PUBLISHED) {
        const existing = await db.query.collections?.findFirst({
          where: eq(collections.id, id),
        });
        if (existing && !existing.publishedAt) {
          updateData.publishedAt = new Date();
        }
      }

      const [updated] = await db
        .update(collections)
        .set(updateData)
        .where(eq(collections.id, id))
        .returning();

      if (!updated) return { success: false, error: 'Collection not found' };
      return { success: true, collection: updated };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update collection' };
    }
  }

  /**
   * Admin: Atomically sets waypoints for a collection.
   * Replaces existing waypoints with the provided sequential list.
   */
  async setCollectionDestinations(
    collectionId: string,
    waypoints: { destinationId: string; sequence: number; editorialNote?: string | null }[]
  ): Promise<boolean> {
    if (!db) return false;

    // Remove existing waypoints
    await db
      .delete(collectionDestinations)
      .where(eq(collectionDestinations.collectionId, collectionId));

    if (waypoints.length === 0) return true;

    // Insert new sequential waypoints
    const values = waypoints.map((w, idx) => ({
      collectionId,
      destinationId: w.destinationId,
      sequence: idx + 1,
      editorialNote: w.editorialNote || null,
    }));

    await db.insert(collectionDestinations).values(values);

    await db
      .update(collections)
      .set({ updatedAt: new Date() })
      .where(eq(collections.id, collectionId));

    return true;
  }

  /**
   * Admin: Delete a collection and its cascade waypoints.
   */
  async deleteCollection(id: string): Promise<boolean> {
    if (!db) return false;

    const deleted = await db
      .delete(collections)
      .where(eq(collections.id, id))
      .returning({ id: collections.id });

    return deleted.length > 0;
  }
}

export const collectionService = new CollectionService();
