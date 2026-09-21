import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  destinations,
  destinationImages,
  categories,
  destinationCategories,
  savedDestinations,
} from '@/lib/db/schema';
import { inArray, eq, and } from 'drizzle-orm';
import { EditorialStatus } from '@/lib/types/enums';
import { getCurrentUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET: Fetches enriched destination cards for anonymous client-side bookmarks.
 * STRICT: Validates UUID format and filters out any non-published destinations.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get('ids');

    if (!idsParam || !db) {
      return NextResponse.json({ items: [] });
    }

    const rawIds = idsParam.split(',').map((id) => id.trim()).filter(Boolean);
    // STRICT VALIDATION: Filter out any malformed UUID strings
    const validIds = rawIds.filter((id) => UUID_REGEX.test(id));

    if (validIds.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // Only fetch published destinations
    const rows = await db.query.destinations?.findMany({
      where: and(
        inArray(destinations.id, validIds),
        eq(destinations.editorialStatus, EditorialStatus.PUBLISHED)
      ),
    });

    if (!rows || rows.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const destIds = rows.map((r) => r.id);

    const [allImages, allCatLinks] = await Promise.all([
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
    ]);

    const imagesByDest = new Map<string, { imageUrl: string; altText: string }>();
    allImages.forEach((img) => {
      const existing = imagesByDest.get(img.destinationId);
      if (!existing || img.isPrimary) {
        imagesByDest.set(img.destinationId, {
          imageUrl: img.imageUrl,
          altText: img.altText,
        });
      }
    });

    const catsByDest = new Map<string, { id: string; name: string; slug: string }[]>();
    allCatLinks.forEach(({ destinationId, category }) => {
      const list = catsByDest.get(destinationId) || [];
      list.push({ id: category.id, name: category.name, slug: category.slug });
      catsByDest.set(destinationId, list);
    });

    const items = rows.map((r) => ({
      savedAt: new Date().toISOString(),
      destination: r,
      primaryImage: imagesByDest.get(r.id) || null,
      categories: catsByDest.get(r.id) || [],
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Local saved destinations fetch error:', error);
    return NextResponse.json({ items: [] });
  }
}

/**
 * POST: Migrates anonymous localStorage bookmarks into an authenticated user's account.
 * STRICT: Authenticates user, validates UUID format, verifies published status before inserting.
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required to migrate saved discoveries.' },
        { status: 401 }
      );
    }

    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const body = await req.json();
    const destinationIds: unknown = body.destinationIds;

    if (!Array.isArray(destinationIds) || destinationIds.length === 0) {
      return NextResponse.json({ migratedCount: 0, success: true });
    }

    // STRICT VALIDATION: Filter out any non-string or malformed UUIDs
    const validIds = destinationIds
      .filter((id): id is string => typeof id === 'string' && UUID_REGEX.test(id))
      .slice(0, 50); // Cap migration batch at 50

    if (validIds.length === 0) {
      return NextResponse.json({ migratedCount: 0, success: true });
    }

    // Verify all destinations exist and are published
    const publishedDests = await db
      .select({ id: destinations.id })
      .from(destinations)
      .where(
        and(
          inArray(destinations.id, validIds),
          eq(destinations.editorialStatus, EditorialStatus.PUBLISHED)
        )
      );

    if (publishedDests.length === 0) {
      return NextResponse.json({ migratedCount: 0, success: true });
    }

    // Batch insert with onConflictDoNothing
    const recordsToInsert = publishedDests.map((d) => ({
      userId: authUser.id,
      destinationId: d.id,
    }));

    await db.insert(savedDestinations).values(recordsToInsert).onConflictDoNothing();

    return NextResponse.json({
      success: true,
      migratedCount: publishedDests.length,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Failed to migrate bookmarks' }, { status: 500 });
  }
}
