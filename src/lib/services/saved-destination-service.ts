/**
 * HIDDEN INDIA — SAVED DESTINATIONS SERVICE
 * Manages user bookmarks ("My Hidden India").
 * STRICT: Enforces user isolation; zero N+1 database queries.
 */

import { db } from '../db';
import {
  savedDestinations,
  destinations,
  destinationImages,
  categories,
  destinationCategories,
  Destination,
  DestinationImage,
  Category,
} from '../db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { EditorialStatus } from '../types/enums';

export interface EnrichedSavedDestination {
  savedAt: Date;
  destination: Destination;
  primaryImage: DestinationImage | null;
  categories: Category[];
}

export class SavedDestinationService {
  /**
   * Saves a destination to the user's account.
   * Handles duplicate saves gracefully via unique constraint.
   */
  async saveDestination(userId: string, destinationId: string): Promise<boolean> {
    if (!db) return false;

    // Verify that the destination exists and is published
    const dest = await db.query.destinations?.findFirst({
      where: and(
        eq(destinations.id, destinationId),
        eq(destinations.editorialStatus, EditorialStatus.PUBLISHED)
      ),
      columns: { id: true },
    });

    if (!dest) {
      throw new Error('Destination not found or not published.');
    }

    try {
      await db
        .insert(savedDestinations)
        .values({
          userId,
          destinationId,
        })
        .onConflictDoNothing();
      return true;
    } catch (err) {
      console.error('Failed to save destination:', err);
      return false;
    }
  }

  /**
   * Removes a saved destination from the user's account.
   */
  async unsaveDestination(userId: string, destinationId: string): Promise<boolean> {
    if (!db) return false;

    const result = await db
      .delete(savedDestinations)
      .where(
        and(
          eq(savedDestinations.userId, userId),
          eq(savedDestinations.destinationId, destinationId)
        )
      )
      .returning({ id: savedDestinations.id });

    return result.length > 0;
  }

  /**
   * Checks whether a destination is saved by a given user.
   */
  async isDestinationSaved(userId: string, destinationId: string): Promise<boolean> {
    if (!db) return false;

    const record = await db.query.savedDestinations?.findFirst({
      where: and(
        eq(savedDestinations.userId, userId),
        eq(savedDestinations.destinationId, destinationId)
      ),
      columns: { id: true },
    });

    return !!record;
  }

  /**
   * Retrieves all saved destinations for a user with full enrichment.
   * BATCH OPTIMIZED: Fetches primary images and categories in batched queries.
   */
  async getUserSavedDestinations(userId: string): Promise<EnrichedSavedDestination[]> {
    if (!db) return [];

    const savedRows = await db
      .select({
        savedAt: savedDestinations.createdAt,
        destination: destinations,
      })
      .from(savedDestinations)
      .innerJoin(destinations, eq(savedDestinations.destinationId, destinations.id))
      .where(eq(savedDestinations.userId, userId))
      .orderBy(desc(savedDestinations.createdAt));

    if (savedRows.length === 0) return [];

    const destIds = savedRows.map((r) => r.destination.id);

    // Batch fetch primary images and categories
    const [allImages, allCatLinks] = await Promise.all([
      db
        .select({
          destinationId: destinationImages.destinationId,
          imageUrl: destinationImages.imageUrl,
          altText: destinationImages.altText,
          isPrimary: destinationImages.isPrimary,
          sortOrder: destinationImages.sortOrder,
          caption: destinationImages.caption,
          credit: destinationImages.credit,
          license: destinationImages.license,
          id: destinationImages.id,
          createdAt: destinationImages.createdAt,
        })
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
    ]);

    const imagesByDest = new Map<string, DestinationImage>();
    allImages.forEach((img) => {
      const existing = imagesByDest.get(img.destinationId);
      if (!existing || (!existing.isPrimary && img.isPrimary)) {
        imagesByDest.set(img.destinationId, img as DestinationImage);
      }
    });

    const catsByDest = new Map<string, Category[]>();
    allCatLinks.forEach(({ destinationId, category }) => {
      const list = catsByDest.get(destinationId) || [];
      list.push(category);
      catsByDest.set(destinationId, list);
    });

    return savedRows.map((row) => ({
      savedAt: row.savedAt,
      destination: row.destination,
      primaryImage: imagesByDest.get(row.destination.id) || null,
      categories: catsByDest.get(row.destination.id) || [],
    }));
  }
}

export const savedDestinationService = new SavedDestinationService();
