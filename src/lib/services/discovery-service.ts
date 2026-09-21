import { db } from '../db';
import {
  destinations,
  categories,
  destinationCategories,
  destinationImages,
  Destination,
  Category,
  DestinationImage,
} from '../db/schema';
import { eq, and, or, ilike, sql, desc, inArray, notInArray } from 'drizzle-orm';
import { DifficultyLevelType, EditorialStatus } from '../types/enums';

export interface DiscoveryFilterParams {
  query?: string;
  state?: string;
  categorySlug?: string;
  historicalPeriod?: string;
  difficulty?: DifficultyLevelType;
  page?: number;
  pageSize?: number;
}

export interface EnrichedDestinationCard {
  destination: Destination;
  categories: Category[];
  primaryImage: DestinationImage | null;
}

export interface DiscoverySearchResult {
  items: EnrichedDestinationCard[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  activeFilters: {
    query?: string;
    state?: string;
    categorySlug?: string;
    historicalPeriod?: string;
    difficulty?: DifficultyLevelType;
  };
}

export interface MapDestinationMarker {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  state: string;
  district: string;
  locality: string | null;
  shortDescription: string;
  difficulty: string;
  evidenceClassification: string;
  categoryNames: string[];
  primaryImage: {
    url: string;
    altText: string;
  } | null;
}

export interface RegionStateMetadata {
  slug: string;
  name: string;
  shortDesc: string;
}

export const REGIONAL_STATES: Record<string, RegionStateMetadata> = {
  punjab: {
    slug: 'punjab',
    name: 'Punjab',
    shortDesc:
      'Ancient Indus corridors, forgotten brick ramparts, and historic battlefields across the plains of the Five Rivers.',
  },
  haryana: {
    slug: 'haryana',
    name: 'Haryana',
    shortDesc:
      'Vedic settlements, Mughal baolis, and medieval hill garrisons spanning the Aravalli range and Yamuna river basin.',
  },
  'himachal-pradesh': {
    slug: 'himachal-pradesh',
    name: 'Himachal Pradesh',
    shortDesc:
      'Secluded rock-cut shrines, ancient wood-carved temples, and high-altitude defensive forts nestled in Himalayan valleys.',
  },
  chandigarh: {
    slug: 'chandigarh',
    name: 'Chandigarh',
    shortDesc:
      'Lesser-known colonial outposts, geological river gorges, and historical Shivalik foothills surrounding the union territory.',
  },
  delhi: {
    slug: 'delhi',
    name: 'Delhi',
    shortDesc:
      'Forgotten stepwells, hidden Lodhi tombs, and neglected sultanate fortifications beyond the standard tourist circuit.',
  },
};

export class DiscoveryService {
  /**
   * Search and filter published destinations.
   * STRICT: Only returns records where editorialStatus = 'published'.
   */
  async searchDestinations(params: DiscoveryFilterParams): Promise<DiscoverySearchResult> {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, Math.min(params.pageSize || 12, 48));
    const offset = (page - 1) * pageSize;

    if (!db) {
      return {
        items: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
        pageSize,
        activeFilters: params,
      };
    }

    // Baseline conditions: strictly published
    const conditions = [eq(destinations.editorialStatus, EditorialStatus.PUBLISHED)];

    // 1. Text Query Filter (Name, Locality, District, State, Description, Period)
    if (params.query && params.query.trim().length > 0) {
      const q = `%${params.query.trim()}%`;
      conditions.push(
        or(
          ilike(destinations.name, q),
          ilike(destinations.locality, q),
          ilike(destinations.district, q),
          ilike(destinations.state, q),
          ilike(destinations.shortDescription, q),
          ilike(destinations.longDescription, q),
          ilike(destinations.historicalPeriod, q)
        )!
      );
    }

    // 2. State Filter
    if (params.state && params.state.trim().length > 0) {
      conditions.push(ilike(destinations.state, params.state.trim()));
    }

    // 3. Difficulty Filter
    if (params.difficulty) {
      conditions.push(eq(destinations.difficulty, params.difficulty));
    }

    // 4. Historical Period Filter
    if (params.historicalPeriod && params.historicalPeriod.trim().length > 0) {
      conditions.push(ilike(destinations.historicalPeriod, `%${params.historicalPeriod.trim()}%`));
    }

    // 5. Category Filter (via subquery or destination_categories join)
    if (params.categorySlug && params.categorySlug.trim().length > 0) {
      const matchingCat = await db.query.categories?.findFirst({
        where: eq(categories.slug, params.categorySlug.trim().toLowerCase()),
      });

      if (matchingCat) {
        const destIdsWithCat = db
          .select({ destId: destinationCategories.destinationId })
          .from(destinationCategories)
          .where(eq(destinationCategories.categoryId, matchingCat.id));

        conditions.push(inArray(destinations.id, destIdsWithCat));
      } else {
        // If specified category doesn't exist, return empty
        return {
          items: [],
          totalCount: 0,
          totalPages: 0,
          currentPage: page,
          pageSize,
          activeFilters: params,
        };
      }
    }

    const whereClause = and(...conditions);

    // Count query
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(destinations)
      .where(whereClause);

    const totalCount = countResult?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Fetch items with pagination
    const destinationRows = await db.query.destinations?.findMany({
      where: whereClause,
      orderBy: [desc(destinations.publishedAt), desc(destinations.createdAt)],
      limit: pageSize,
      offset,
    });

    if (!destinationRows || destinationRows.length === 0) {
      return {
        items: [],
        totalCount,
        totalPages,
        currentPage: page,
        pageSize,
        activeFilters: params,
      };
    }

    // Helper to batch-enrich destinations with categories and primary images
    const destIds = destinationRows.map((d) => d.id);
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

    const enrichedItems: EnrichedDestinationCard[] = destinationRows.map((dest) => ({
      destination: dest,
      categories: catsByDest.get(dest.id) || [],
      primaryImage: imagesByDest.get(dest.id) || null,
    }));

    return {
      items: enrichedItems,
      totalCount,
      totalPages,
      currentPage: page,
      pageSize,
      activeFilters: params,
    };
  }

  /**
   * Fetches lightweight destination records for the interactive map.
   * Returns only fields necessary for clustering and popups.
   * BATCH OPTIMIZED: Eliminates N+1 queries using grouped batched queries.
   */
  async getMapDestinations(
    filters?: Omit<DiscoveryFilterParams, 'page' | 'pageSize'>
  ): Promise<MapDestinationMarker[]> {
    if (!db) return [];

    const conditions = [eq(destinations.editorialStatus, EditorialStatus.PUBLISHED)];

    if (filters?.query && filters.query.trim().length > 0) {
      const q = `%${filters.query.trim()}%`;
      conditions.push(
        or(
          ilike(destinations.name, q),
          ilike(destinations.locality, q),
          ilike(destinations.district, q),
          ilike(destinations.state, q),
          ilike(destinations.shortDescription, q)
        )!
      );
    }

    if (filters?.state && filters.state.trim().length > 0) {
      conditions.push(ilike(destinations.state, filters.state.trim()));
    }

    if (filters?.difficulty) {
      conditions.push(eq(destinations.difficulty, filters.difficulty));
    }

    if (filters?.categorySlug && filters.categorySlug.trim().length > 0) {
      const matchingCat = await db.query.categories?.findFirst({
        where: eq(categories.slug, filters.categorySlug.trim().toLowerCase()),
      });
      if (matchingCat) {
        const destIdsWithCat = db
          .select({ destId: destinationCategories.destinationId })
          .from(destinationCategories)
          .where(eq(destinationCategories.categoryId, matchingCat.id));
        conditions.push(inArray(destinations.id, destIdsWithCat));
      }
    }

    const rows = await db.query.destinations?.findMany({
      where: and(...conditions),
      columns: {
        id: true,
        name: true,
        slug: true,
        latitude: true,
        longitude: true,
        state: true,
        district: true,
        locality: true,
        shortDescription: true,
        difficulty: true,
        evidenceClassification: true,
      },
    });

    if (!rows || rows.length === 0) return [];

    const destIds = rows.map((r) => r.id);

    // BATCH QUERY: Fetch all primary images and category names in 2 batched queries
    const [allImages, allCats] = await Promise.all([
      db
        .select({
          destinationId: destinationImages.destinationId,
          imageUrl: destinationImages.imageUrl,
          altText: destinationImages.altText,
          isPrimary: destinationImages.isPrimary,
        })
        .from(destinationImages)
        .where(inArray(destinationImages.destinationId, destIds)),
      db
        .select({
          destinationId: destinationCategories.destinationId,
          categoryName: categories.name,
        })
        .from(destinationCategories)
        .innerJoin(categories, eq(destinationCategories.categoryId, categories.id))
        .where(inArray(destinationCategories.destinationId, destIds)),
    ]);

    const primaryImageByDest = new Map<string, { url: string; altText: string }>();
    allImages.forEach((img) => {
      const existing = primaryImageByDest.get(img.destinationId);
      if (!existing || img.isPrimary) {
        primaryImageByDest.set(img.destinationId, {
          url: img.imageUrl,
          altText: img.altText,
        });
      }
    });

    const categoryNamesByDest = new Map<string, string[]>();
    allCats.forEach(({ destinationId, categoryName }) => {
      const list = categoryNamesByDest.get(destinationId) || [];
      list.push(categoryName);
      categoryNamesByDest.set(destinationId, list);
    });

    // Synchronous in-memory assembly (O(N))
    const markers: MapDestinationMarker[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      latitude: row.latitude,
      longitude: row.longitude,
      state: row.state,
      district: row.district,
      locality: row.locality,
      shortDescription: row.shortDescription,
      difficulty: row.difficulty,
      evidenceClassification: row.evidenceClassification,
      categoryNames: categoryNamesByDest.get(row.id) || [],
      primaryImage: primaryImageByDest.get(row.id) || null,
    }));

    return markers;
  }

  /**
   * Fetches published destinations by category slug.
   */
  async getDestinationsByCategory(categorySlug: string, page: number = 1, pageSize: number = 12) {
    return this.searchDestinations({ categorySlug, page, pageSize });
  }

  /**
   * Fetches published destinations by state name/slug.
   */
  async getDestinationsByState(stateSlug: string, page: number = 1, pageSize: number = 12) {
    const meta = REGIONAL_STATES[stateSlug.toLowerCase()];
    const stateName = meta ? meta.name : stateSlug;
    return this.searchDestinations({ state: stateName, page, pageSize });
  }

  /**
   * Fetches featured destinations for the homepage.
   * Batch optimized.
   */
  async getFeaturedDestinations(limit: number = 6): Promise<EnrichedDestinationCard[]> {
    if (!db) return [];

    const rows = await db.query.destinations?.findMany({
      where: and(
        eq(destinations.editorialStatus, EditorialStatus.PUBLISHED),
        eq(destinations.isFeatured, true)
      ),
      orderBy: [desc(destinations.publishedAt)],
      limit,
    });

    if (!rows || rows.length === 0) return [];

    return this.enrichDestinationRows(rows);
  }

  /**
   * Fetches latest published destinations.
   * Batch optimized.
   */
  async getLatestDestinations(
    limit: number = 6,
    excludeIds: string[] = []
  ): Promise<EnrichedDestinationCard[]> {
    if (!db) return [];

    const conditions = [eq(destinations.editorialStatus, EditorialStatus.PUBLISHED)];
    if (excludeIds.length > 0) {
      conditions.push(notInArray(destinations.id, excludeIds));
    }

    const rows = await db.query.destinations?.findMany({
      where: and(...conditions),
      orderBy: [desc(destinations.publishedAt)],
      limit,
    });

    if (!rows || rows.length === 0) return [];

    return this.enrichDestinationRows(rows);
  }

  /**
   * Helper to batch enrich destination rows with primary image and categories.
   */
  private async enrichDestinationRows(rows: Destination[]): Promise<EnrichedDestinationCard[]> {
    if (!db || rows.length === 0) return [];
    const destIds = rows.map((r) => r.id);

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

    return rows.map((dest) => ({
      destination: dest,
      categories: catsByDest.get(dest.id) || [],
      primaryImage: imagesByDest.get(dest.id) || null,
    }));
  }

  /**
   * Retrieves all categories for navigation and filter selects.
   */
  async getAllCategories(): Promise<Category[]> {
    if (!db) return [];
    return db.query.categories?.findMany({
      orderBy: [categories.name],
    }) || [];
  }

  /**
   * Retrieves single category by slug.
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    if (!db) return null;
    const cat = await db.query.categories?.findFirst({
      where: eq(categories.slug, slug.toLowerCase().trim()),
    });
    return cat || null;
  }
}

export const discoveryService = new DiscoveryService();
