import {
  db,
  categories,
  destinations,
  destinationCategories,
  destinationVisitInfo,
  destinationSources,
  destinationEvidenceItems,
  destinationImages,
  collections,
  collectionDestinations,
} from './index';
import { eq } from 'drizzle-orm';
import { RESEARCHED_20_DESTINATIONS } from './destinations-data';
import { RESEARCHED_COLLECTIONS } from './collections-data';

/**
 * Standard Category Taxonomy for Hidden India.
 * Categories describe topic/architecture, strictly independent of factual claim verification.
 */
export const STANDARD_CATEGORIES = [
  { name: 'Historical', slug: 'historical', description: 'Sites tied to documented historical eras, rulers, and milestones.' },
  { name: 'Ancient', slug: 'ancient', description: 'Pre-medieval, antiquity, and classical era monuments and settlements.' },
  { name: 'Archaeological', slug: 'archaeological', description: 'Sites excavated, surveyed, or protected by archaeological authorities.' },
  { name: 'Forts', slug: 'forts', description: 'Military fortifications, ramparts, bastions, and defensive battlements.' },
  { name: 'Ruins', slug: 'ruins', description: 'Architectural remains, weathered stone structures, and dilapidated complexes.' },
  { name: 'Abandoned', slug: 'abandoned', description: 'Settlements, hamlets, or structures vacated due to historical or environmental shifts.' },
  { name: 'Natural', slug: 'natural', description: 'Undisturbed natural geological features, river canyons, and forests.' },
  { name: 'Waterfalls', slug: 'waterfalls', description: 'Lesser-known seasonal and perennial cascades and river falls.' },
  { name: 'Caves', slug: 'caves', description: 'Rock shelters, subterranean caverns, and monastic rock-cut cells.' },
  { name: 'Cultural', slug: 'cultural', description: 'Living traditions, artisanal hamlets, and indigenous cultural monuments.' },
  { name: 'Religious', slug: 'religious', description: 'Ancient stepwells, hermitages, temples, shrines, and sacred architecture.' },
  { name: 'Unusual', slug: 'unusual', description: 'Anomalous engineering, acoustic chambers, and peculiar vernacular designs.' },
  { name: 'Architecture', slug: 'architecture', description: 'Exceptional masonry, stepwell geometry, and indigenous craft techniques.' },
  { name: 'Ghost Stories', slug: 'ghost-stories', description: 'Sites enveloped in local supernatural lore and oral ghost legends (categorized by story topic, not verified fact).' },
  { name: 'Lost Places', slug: 'lost-places', description: 'Sites omitted from conventional tourist maps and commercial circuits.' },
];

/**
 * Seeds the standard categories into the database.
 */
export async function seedCategories() {
  if (!db) {
    console.log('[Seed] Database client not connected. Skipping category seed.');
    return;
  }

  for (const cat of STANDARD_CATEGORIES) {
    const existing = await db.query.categories?.findFirst({
      where: eq(categories.slug, cat.slug),
    });

    if (!existing) {
      await db.insert(categories).values(cat);
      console.log(`[Seed] Inserted category: ${cat.name}`);
    }
  }
}

/**
 * Seeds the explicitly marked internal test record for development validation.
 * Must remain in 'draft' status with noindex so it is never publicly indexed or mistaken for production.
 */
export async function seedDevTestFixture() {
  if (!db) {
    console.log('[Seed] Database client not connected. Skipping test fixture.');
    return;
  }

  const TEST_SLUG = 'test-destination-only';

  const existing = await db.query.destinations?.findFirst({
    where: eq(destinations.slug, TEST_SLUG),
  });

  if (existing) {
    console.log('[Seed] Dev test fixture already present.');
    return;
  }

  // 1. Insert core destination in DRAFT status
  const [testDest] = await db
    .insert(destinations)
    .values({
      name: 'TEST_DESTINATION_ONLY (Internal Architectural Fixture)',
      slug: TEST_SLUG,
      shortDescription:
        'This is an internal development test fixture strictly used for verifying component rendering and schema integrity. Not a real destination.',
      longDescription:
        'This record serves purely as a technical integration fixture to test the Fact vs Legend separation, source citations drawer, visit info components, and SEO structured data. It carries no factual travel claim and is restricted to draft status.',
      state: 'Punjab',
      district: 'Bathinda',
      locality: 'Internal Test Lab',
      latitude: 30.211,
      longitude: 74.9455,
      coordinateSource: 'Internal Technical Specification Fixture',
      coordinateVerifiedAt: new Date(),
      historicalPeriod: 'Test Specification Era',
      difficulty: 'easy',
      estimatedVisitDuration: '1 hour',
      evidenceClassification: 'DOCUMENTED',
      editorialStatus: 'draft', // STRICTLY DRAFT: never published publicly
      isFeatured: false,
    })
    .returning();

  // 2. Insert verified sample sources
  const [sourceGov] = await db
    .insert(destinationSources)
    .values({
      destinationId: testDest.id,
      title: 'Architectural Heritage Gazette Test Citation',
      publisher: 'Archaeological Survey of India Technical Repository',
      url: 'https://asi.nic.in',
      sourceType: 'GOVERNMENT',
      publicationDate: '1972',
      notes: 'Test bibliographic record verifying schema relations.',
      verifiedAt: new Date(),
    })
    .returning();

  // 3. Insert visit information
  await db.insert(destinationVisitInfo).values({
    destinationId: testDest.id,
    entryFee: '₹20 for Indian citizens; ₹250 for foreign nationals',
    currency: 'INR',
    feeType: 'per_person',
    isFeeVerified: true,
    openingInformation: '08:00 to 17:30 daily',
    parkingInformation: 'Designated parking bay available near outer gate',
    accessInformation: 'Metalled road access up to the site boundary',
    contactInformation: 'Circle Office Telephone: 0172-000000',
    bestTimeInformation: 'October through March',
    sourceId: sourceGov.id,
    verifiedAt: new Date(),
  });

  // 4. Insert structured evidence items (Documented vs Tradition)
  await db.insert(destinationEvidenceItems).values([
    {
      destinationId: testDest.id,
      sectionTitle: 'Documented Architectural Excavation',
      content:
        'Excavations conducted by institutional teams uncovered brick masonry structures conforming to the Kushan architectural period.',
      classification: 'DOCUMENTED',
      citationNotes: 'Referenced from ASI Technical Report Vol. 14.',
      displayOrder: 1,
    },
    {
      destinationId: testDest.id,
      sectionTitle: 'Local Oral Legend of the Subterranean Vault',
      content:
        'Local villagers recount oral stories claiming a forgotten underground tunnel connected the inner bastion to a nearby medieval well.',
      classification: 'LOCAL_TRADITION',
      citationNotes: 'Recorded from oral testimony; not supported by archaeological excavation.',
      displayOrder: 2,
    },
  ]);

  console.log('[Seed] Dev test fixture inserted successfully.');
}

/**
 * Seeds the 20 genuinely researched destinations into the database.
 */
export async function seed20ResearchedDestinations() {
  if (!db) {
    console.log('[Seed] Database client not connected. Skipping researched destinations seed.');
    return;
  }

  // Ensure categories exist first
  await seedCategories();

  // Cache categories by slug
  const allCategories = await db.query.categories?.findMany();
  const categoryMap = new Map<string, string>();
  allCategories?.forEach((cat) => categoryMap.set(cat.slug, cat.id));

  console.log(`[Seed] Beginning seed of verified researched destinations...`);

  // Remove obsolete split/renamed destinations to prevent orphaned records
  const obsoleteSlugs = [
    'jal-mahal-chor-gumbad-narnaul',
    'kalesar-colonial-bridge-dak-bungalow',
    'bassi-baoli-pinjore-stepwells',
  ];
  for (const obsSlug of obsoleteSlugs) {
    const oldDest = await db.query.destinations?.findFirst({
      where: eq(destinations.slug, obsSlug),
    });
    if (oldDest) {
      await db.delete(destinations).where(eq(destinations.id, oldDest.id));
      console.log(`[Seed] Removed obsolete destination record: ${obsSlug}`);
    }
  }

  for (const destData of RESEARCHED_20_DESTINATIONS) {
    const existing = await db.query.destinations?.findFirst({
      where: eq(destinations.slug, destData.slug),
    });

    if (existing) {
      console.log(`[Seed] Destination already exists: ${destData.name}`);
      continue;
    }

    // 1. Insert core destination
    const [insertedDest] = await db
      .insert(destinations)
      .values({
        name: destData.name,
        slug: destData.slug,
        shortDescription: destData.shortDescription,
        longDescription: destData.longDescription,
        state: destData.state,
        district: destData.district,
        locality: destData.locality,
        latitude: destData.latitude,
        longitude: destData.longitude,
        coordinateSource: destData.coordinateSource,
        coordinateVerifiedAt: new Date(),
        historicalPeriod: destData.historicalPeriod,
        difficulty: destData.difficulty,
        estimatedVisitDuration: destData.estimatedVisitDuration,
        evidenceClassification: destData.evidenceClassification,
        editorialStatus: destData.editorialStatus,
        isFeatured: destData.isFeatured,
      })
      .returning();

    if (!insertedDest) continue;

    // 2. Link categories
    for (const catSlug of destData.categorySlugs) {
      const categoryId = categoryMap.get(catSlug);
      if (categoryId) {
        await db.insert(destinationCategories).values({
          destinationId: insertedDest.id,
          categoryId,
        });
      }
    }

    // 3. Insert sources
    let primarySourceId: string | null = null;
    for (const src of destData.sources) {
      const [insertedSource] = await db
        .insert(destinationSources)
        .values({
          destinationId: insertedDest.id,
          title: src.title,
          publisher: src.publisher,
          url: src.url || null,
          sourceType: src.sourceType,
          publicationDate: src.publicationDate || null,
          notes: src.notes || null,
          verifiedAt: new Date(),
        })
        .returning();

      if (!primarySourceId && insertedSource) {
        primarySourceId = insertedSource.id;
      }
    }

    // 4. Insert visit info
    await db.insert(destinationVisitInfo).values({
      destinationId: insertedDest.id,
      entryFee: destData.visitInfo.entryFee,
      currency: destData.visitInfo.currency,
      feeType: destData.visitInfo.feeType,
      isFeeVerified: destData.visitInfo.isFeeVerified,
      openingInformation: destData.visitInfo.openingInformation,
      parkingInformation: destData.visitInfo.parkingInformation,
      accessInformation: destData.visitInfo.accessInformation,
      contactInformation: destData.visitInfo.contactInformation || null,
      bestTimeInformation: destData.visitInfo.bestTimeInformation,
      sourceId: primarySourceId,
      verifiedAt: new Date(),
    });

    // 5. Insert evidence items
    for (const ev of destData.evidenceItems) {
      await db.insert(destinationEvidenceItems).values({
        destinationId: insertedDest.id,
        sectionTitle: ev.sectionTitle,
        content: ev.content,
        classification: ev.classification,
        citationNotes: ev.citationNotes,
        displayOrder: ev.displayOrder,
      });
    }

    // 6. Insert images
    for (let idx = 0; idx < destData.images.length; idx++) {
      const img = destData.images[idx];
      await db.insert(destinationImages).values({
        destinationId: insertedDest.id,
        imageUrl: img.imageUrl,
        altText: img.altText,
        caption: img.caption,
        credit: img.credit,
        license: img.license,
        isPrimary: img.isPrimary,
        sortOrder: idx + 1,
      });
    }

    console.log(`[Seed] Successfully seeded: ${destData.name}`);
  }

  console.log(`[Seed] 20 Researched Destinations seeded successfully.`);

  // Seed curated editorial collections
  await seedCollections();
}

/**
 * Seeds the 5 curated editorial collections and their ordered waypoints.
 */
export async function seedCollections() {
  if (!db) {
    console.log('[Seed] Database client not connected. Skipping collections seed.');
    return;
  }

  console.log(`[Seed] Beginning seed of ${RESEARCHED_COLLECTIONS.length} curated collections...`);

  // Cache destinations by slug for fast ID lookup
  const allDestinations = await db.query.destinations?.findMany({
    columns: { id: true, slug: true },
  });
  const destMap = new Map<string, string>();
  allDestinations?.forEach((d) => destMap.set(d.slug, d.id));

  for (const collData of RESEARCHED_COLLECTIONS) {
    const existing = await db.query.collections?.findFirst({
      where: eq(collections.slug, collData.slug),
    });

    let collectionId = existing?.id;

    if (!existing) {
      const [inserted] = await db
        .insert(collections)
        .values({
          title: collData.title,
          slug: collData.slug,
          shortDescription: collData.shortDescription,
          description: collData.description,
          coverImageUrl: collData.coverImageUrl,
          region: collData.region,
          theme: collData.theme,
          editorialStatus: collData.editorialStatus,
          publishedAt: new Date(),
        })
        .returning();

      collectionId = inserted?.id;
      console.log(`[Seed] Inserted collection: ${collData.title}`);
    } else {
      console.log(`[Seed] Collection already exists: ${collData.title}`);
    }

    if (!collectionId) continue;

    // Seed waypoints
    for (const wp of collData.waypoints) {
      const destId = destMap.get(wp.destinationSlug);
      if (!destId) {
        console.warn(`[Seed] Destination slug "${wp.destinationSlug}" not found in database.`);
        continue;
      }

      const existingWp = await db.query.collectionDestinations?.findFirst({
        where: eq(collectionDestinations.collectionId, collectionId),
      });

      // Insert if not already linked
      const existingLink = await db
        .select({ id: collectionDestinations.id })
        .from(collectionDestinations)
        .where(
          eq(collectionDestinations.collectionId, collectionId)
        );

      const hasDestination = existingLink.some((l: any) => l.destinationId === destId);

      if (!hasDestination) {
        await db.insert(collectionDestinations).values({
          collectionId,
          destinationId: destId,
          sequence: wp.sequence,
          editorialNote: wp.editorialNote,
        });
      }
    }
  }

  console.log(`[Seed] Curated collections seeded successfully.`);
}

// Direct execution runner
if (require.main === module) {
  seed20ResearchedDestinations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed] Error during seeding:', err);
      process.exit(1);
    });
}

