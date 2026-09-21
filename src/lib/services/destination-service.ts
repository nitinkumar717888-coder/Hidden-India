import { db } from '../db';
import { RESEARCHED_DESTINATIONS } from '../db/destinations-data';
import {
  destinations,
  destinationCategories,
  categories,
  destinationVisitInfo,
  destinationSources,
  destinationEvidenceItems,
  destinationImages,
  Destination,
  DestinationVisitInfo,
  DestinationSource,
  DestinationEvidenceItem,
  DestinationImage,
  Category,
} from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { EditorialStatus, EditorialStatusType } from '../types/enums';
import {
  DestinationPayload,
  validateDestinationPayload,
  ValidationResult,
} from '../validation/destination';

export interface FullDestinationRecord {
  destination: Destination;
  categories: Category[];
  visitInfo: DestinationVisitInfo | null;
  sources: DestinationSource[];
  evidenceItems: DestinationEvidenceItem[];
  images: DestinationImage[];
}

export class DestinationService {
  /**
   * Fetches a full destination record by slug.
   * By default, strictly requires editorialStatus = 'published'.
   * If allowDraftPreview is true (e.g. for admin preview), drafts can be retrieved.
   */
  async getBySlug(
    slug: string,
    allowDraftPreview: boolean = false
  ): Promise<FullDestinationRecord | null> {
    if (!db) return null;

    const condition = allowDraftPreview
      ? eq(destinations.slug, slug)
      : and(eq(destinations.slug, slug), eq(destinations.editorialStatus, EditorialStatus.PUBLISHED));

    const destination = await db.query.destinations?.findFirst({
      where: condition,
    });

    if (!destination) return null;

    // Fetch related normalized categories
    const destCats = await db
      .select({
        category: categories,
      })
      .from(destinationCategories)
      .innerJoin(categories, eq(destinationCategories.categoryId, categories.id))
      .where(eq(destinationCategories.destinationId, destination.id));

    // Fetch visit information
    const visitInfo = await db.query.destinationVisitInfo?.findFirst({
      where: eq(destinationVisitInfo.destinationId, destination.id),
    });

    // Fetch verified sources
    const sources = await db.query.destinationSources?.findMany({
      where: eq(destinationSources.destinationId, destination.id),
      orderBy: [desc(destinationSources.createdAt)],
    });

    // Fetch structured evidence items (Documented vs Local Tradition)
    const evidenceItems = await db.query.destinationEvidenceItems?.findMany({
      where: eq(destinationEvidenceItems.destinationId, destination.id),
      orderBy: [destinationEvidenceItems.displayOrder],
    });

    // Fetch images
    const images = await db.query.destinationImages?.findMany({
      where: eq(destinationImages.destinationId, destination.id),
      orderBy: [destinationImages.sortOrder],
    });

    return {
      destination,
      categories: destCats.map((dc) => dc.category),
      visitInfo: visitInfo || null,
      sources: sources || [],
      evidenceItems: evidenceItems || [],
      images: images || [],
    };
  }

  /**
   * Fetches published destinations for discovery catalog.
   */
  async getPublished(limit: number = 20, offset: number = 0) {
    if (!db) return [];

    return db.query.destinations?.findMany({
      where: eq(destinations.editorialStatus, EditorialStatus.PUBLISHED),
      orderBy: [desc(destinations.publishedAt), desc(destinations.createdAt)],
      limit,
      offset,
    });
  }

  /**
   * Fetches all destinations for the protected admin management interface.
   * Includes image replacement status indicator for editorial oversight.
   */
  async getAllForAdmin(statusFilter?: EditorialStatusType) {
    if (!db) {
      const items = RESEARCHED_DESTINATIONS.filter(
        (d) => !statusFilter || d.editorialStatus === statusFilter
      );
      return items.map((d, index) => ({
        id: `dest-${index + 1}`,
        name: d.name,
        slug: d.slug,
        shortDescription: d.shortDescription,
        longDescription: d.longDescription,
        state: d.state,
        district: d.district,
        locality: d.locality,
        latitude: d.latitude,
        longitude: d.longitude,
        coordinateSource: d.coordinateSource,
        coordinateVerifiedAt: new Date(),
        historicalPeriod: d.historicalPeriod,
        difficulty: d.difficulty,
        estimatedVisitDuration: d.estimatedVisitDuration,
        evidenceClassification: d.evidenceClassification,
        editorialStatus: d.editorialStatus,
        isFeatured: d.isFeatured,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        requiresEditorialReplacement: d.images.some(
          (img) => img.requiresEditorialReplacement || img.credit?.includes('Representative Stock')
        ),
      }));
    }

    const condition = statusFilter ? eq(destinations.editorialStatus, statusFilter) : undefined;

    const allDests = await db.query.destinations?.findMany({
      where: condition,
      orderBy: [desc(destinations.updatedAt)],
    });

    if (!allDests || allDests.length === 0) return [];

    // Query images to determine placeholder status
    const allImages = await db.query.destinationImages?.findMany();
    const destsNeedingImage = new Set<string>();
    allImages?.forEach((img) => {
      if (
        img.credit?.includes('Representative Stock') ||
        img.caption?.includes('Flagged for editorial')
      ) {
        destsNeedingImage.add(img.destinationId);
      }
    });

    return allDests.map((dest) => ({
      ...dest,
      requiresEditorialReplacement: destsNeedingImage.has(dest.id),
    }));
  }

  /**
   * Creates a new destination with validation.
   */
  async create(payload: DestinationPayload): Promise<{
    success: boolean;
    data?: Destination;
    validation?: ValidationResult;
    error?: string;
  }> {
    const validation = validateDestinationPayload(payload);
    if (!validation.isValid) {
      return { success: false, validation };
    }

    if (!db) {
      return { success: false, error: 'Database is not connected.' };
    }

    try {
      const [inserted] = await db
        .insert(destinations)
        .values({
          name: payload.name.trim(),
          slug: payload.slug.trim().toLowerCase(),
          shortDescription: payload.shortDescription.trim(),
          longDescription: payload.longDescription.trim(),
          state: payload.state.trim(),
          district: payload.district.trim(),
          locality: payload.locality?.trim() || null,
          latitude: payload.latitude,
          longitude: payload.longitude,
          coordinateSource: payload.coordinateSource?.trim() || null,
          historicalPeriod: payload.historicalPeriod?.trim() || null,
          difficulty: payload.difficulty || 'easy',
          estimatedVisitDuration: payload.estimatedVisitDuration.trim(),
          evidenceClassification: payload.evidenceClassification,
          editorialStatus: payload.editorialStatus,
          publishedAt:
            payload.editorialStatus === EditorialStatus.PUBLISHED ? new Date() : null,
        })
        .returning();

      // Bind category relationships if provided
      if (payload.categoryIds && payload.categoryIds.length > 0) {
        for (const catId of payload.categoryIds) {
          await db
            .insert(destinationCategories)
            .values({
              destinationId: inserted.id,
              categoryId: catId,
            })
            .onConflictDoNothing();
        }
      }

      return { success: true, data: inserted };
    } catch (err: any) {
      if (err.code === '23505') {
        return {
          success: false,
          validation: {
            isValid: false,
            errors: [{ field: 'slug', message: 'A destination with this slug already exists.' }],
          },
        };
      }
      return { success: false, error: err.message || 'Database insert failed.' };
    }
  }

  /**
   * Updates editorial status with publication timestamp handling.
   */
  async updateStatus(
    id: string,
    status: EditorialStatusType
  ): Promise<{ success: boolean; error?: string }> {
    if (!db) return { success: false, error: 'Database is not connected.' };

    try {
      await db
        .update(destinations)
        .set({
          editorialStatus: status,
          updatedAt: new Date(),
          publishedAt: status === EditorialStatus.PUBLISHED ? new Date() : undefined,
        })
        .where(eq(destinations.id, id));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

export const destinationService = new DestinationService();
