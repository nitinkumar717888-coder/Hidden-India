import {
  pgTable,
  uuid,
  varchar,
  text,
  doublePrecision,
  timestamp,
  date,
  pgEnum,
  integer,
  boolean,
  index,
  uniqueIndex,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// =============================================================================
// ENUMS
// =============================================================================

export const vehicleTypeEnum = pgEnum('vehicle_type', [
  'PETROL_CAR',
  'DIESEL_CAR',
  'CNG_CAR',
  'MOTORCYCLE',
  'EV',
]);

export const editorialStatusEnum = pgEnum('editorial_status', [
  'draft',
  'researching',
  'needs_review',
  'verified',
  'published',
  'archived',
]);

export const evidenceClassificationEnum = pgEnum('evidence_classification', [
  'DOCUMENTED',
  'LOCAL_TRADITION',
  'DISPUTED',
  'UNKNOWN',
]);

export const sourceTypeEnum = pgEnum('source_type', [
  'GOVERNMENT',
  'ARCHAEOLOGICAL',
  'ACADEMIC',
  'MUSEUM',
  'OFFICIAL_TOURISM',
  'ARCHIVAL',
  'NEWS',
  'OTHER',
]);

export const difficultyLevelEnum = pgEnum('difficulty_level', [
  'easy',
  'moderate',
  'challenging',
  'strenuous',
]);

// =============================================================================
// 1. CATEGORIES TABLE (Normalized Category Taxonomy)
// =============================================================================

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index('categories_slug_idx').on(table.slug),
  })
);

// =============================================================================
// 2. DESTINATIONS TABLE (Permanent Editorial Core)
// =============================================================================

export const destinations = pgTable(
  'destinations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    shortDescription: text('short_description').notNull(),
    longDescription: text('long_description').notNull(), // The Story / Factual Narrative
    state: varchar('state', { length: 100 }).notNull(),
    district: varchar('district', { length: 100 }).notNull(),
    locality: varchar('locality', { length: 100 }),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    coordinateSource: varchar('coordinate_source', { length: 255 }),
    coordinateVerifiedAt: timestamp('coordinate_verified_at', { withTimezone: true }),
    historicalPeriod: varchar('historical_period', { length: 100 }),
    difficulty: difficultyLevelEnum('difficulty').default('easy').notNull(),
    estimatedVisitDuration: varchar('estimated_visit_duration', { length: 50 }).notNull(),
    evidenceClassification: evidenceClassificationEnum('evidence_classification')
      .default('UNKNOWN')
      .notNull(),
    editorialStatus: editorialStatusEnum('editorial_status').default('draft').notNull(),
    isFeatured: boolean('is_featured').default(false).notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index('destinations_slug_idx').on(table.slug),
    coordsIdx: index('destinations_coords_idx').on(table.latitude, table.longitude),
    stateIdx: index('destinations_state_idx').on(table.state),
    districtIdx: index('destinations_district_idx').on(table.district),
    statusIdx: index('destinations_status_idx').on(table.editorialStatus),
  })
);

// =============================================================================
// 3. DESTINATION_CATEGORIES (Normalized Many-to-Many Bridge)
// =============================================================================

export const destinationCategories = pgTable(
  'destination_categories',
  {
    destinationId: uuid('destination_id')
      .notNull()
      .references(() => destinations.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.destinationId, table.categoryId] }),
    destinationIdx: index('dest_categories_dest_idx').on(table.destinationId),
    categoryIdx: index('dest_categories_cat_idx').on(table.categoryId),
  })
);

// =============================================================================
// 4. DESTINATION SOURCES TABLE (Strict Bibliographic References)
// =============================================================================

export const destinationSources = pgTable(
  'destination_sources',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    destinationId: uuid('destination_id')
      .notNull()
      .references(() => destinations.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 500 }).notNull(),
    publisher: varchar('publisher', { length: 255 }).notNull(),
    url: text('url'),
    sourceType: sourceTypeEnum('source_type').notNull(),
    publicationDate: varchar('publication_date', { length: 50 }),
    notes: text('notes'),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    destinationIdIdx: index('destination_sources_dest_id_idx').on(table.destinationId),
  })
);

// =============================================================================
// 5. DESTINATION VISIT INFO (Separated Rapidly Changing Travel Information)
// =============================================================================

export const destinationVisitInfo = pgTable(
  'destination_visit_info',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    destinationId: uuid('destination_id')
      .notNull()
      .unique()
      .references(() => destinations.id, { onDelete: 'cascade' }),
    entryFee: text('entry_fee'),
    currency: varchar('currency', { length: 10 }).default('INR').notNull(),
    feeType: varchar('fee_type', { length: 50 }).default('per_person'),
    isFeeVerified: boolean('is_fee_verified').default(false).notNull(),
    openingInformation: text('opening_information'),
    parkingInformation: text('parking_information'),
    accessInformation: text('access_information'),
    contactInformation: text('contact_information'),
    bestTimeInformation: text('best_time_information'),
    sourceId: uuid('source_id').references(() => destinationSources.id, {
      onDelete: 'set null',
    }),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    destinationIdIdx: index('destination_visit_info_dest_id_idx').on(table.destinationId),
  })
);

// =============================================================================
// 6. DESTINATION EVIDENCE ITEMS (Structured Fact vs. Legend Segregation)
// =============================================================================

export const destinationEvidenceItems = pgTable(
  'destination_evidence_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    destinationId: uuid('destination_id')
      .notNull()
      .references(() => destinations.id, { onDelete: 'cascade' }),
    sectionTitle: varchar('section_title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    classification: evidenceClassificationEnum('classification').notNull(),
    citationNotes: text('citation_notes'),
    displayOrder: integer('display_order').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    destinationIdIdx: index('dest_evidence_dest_id_idx').on(table.destinationId),
    classificationIdx: index('dest_evidence_class_idx').on(table.classification),
  })
);

// =============================================================================
// 7. DESTINATION IMAGES TABLE (Strict Attribution & Licensing)
// =============================================================================

export const destinationImages = pgTable(
  'destination_images',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    destinationId: uuid('destination_id')
      .notNull()
      .references(() => destinations.id, { onDelete: 'cascade' }),
    imageUrl: text('image_url').notNull(),
    altText: varchar('alt_text', { length: 255 }).notNull(),
    caption: text('caption'),
    credit: varchar('credit', { length: 255 }),
    license: varchar('license', { length: 100 }),
    licenseUrl: text('license_url'),
    source: varchar('source', { length: 255 }),
    sourceUrl: text('source_url'),
    originalFileUrl: text('original_file_url'),
    photographer: varchar('photographer', { length: 255 }),
    captureDate: varchar('capture_date', { length: 100 }),
    attribution: text('attribution'),
    accessedAt: timestamp('accessed_at', { withTimezone: true }),
    modificationNotes: text('modification_notes'),
    role: varchar('role', { length: 50 }).default('hero'),
    editorialStatus: varchar('editorial_status', { length: 50 }).default('PENDING_PHOTOGRAPHY'),
    requiresEditorialReplacement: boolean('requires_editorial_replacement').default(true),
    isPrimary: boolean('is_primary').default(false).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    destinationIdIdx: index('destination_images_dest_id_idx').on(table.destinationId),
    isPrimaryIdx: index('destination_images_primary_idx').on(table.isPrimary),
  })
);

// =============================================================================
// RELATIONS
// =============================================================================

export const categoriesRelations = relations(categories, ({ many }) => ({
  destinations: many(destinationCategories),
}));

export const destinationsRelations = relations(destinations, ({ one, many }) => ({
  categories: many(destinationCategories),
  visitInfo: one(destinationVisitInfo, {
    fields: [destinations.id],
    references: [destinationVisitInfo.destinationId],
  }),
  sources: many(destinationSources),
  evidenceItems: many(destinationEvidenceItems),
  images: many(destinationImages),
}));

export const destinationCategoriesRelations = relations(destinationCategories, ({ one }) => ({
  destination: one(destinations, {
    fields: [destinationCategories.destinationId],
    references: [destinations.id],
  }),
  category: one(categories, {
    fields: [destinationCategories.categoryId],
    references: [categories.id],
  }),
}));

export const destinationVisitInfoRelations = relations(destinationVisitInfo, ({ one }) => ({
  destination: one(destinations, {
    fields: [destinationVisitInfo.destinationId],
    references: [destinations.id],
  }),
  source: one(destinationSources, {
    fields: [destinationVisitInfo.sourceId],
    references: [destinationSources.id],
  }),
}));

export const destinationSourcesRelations = relations(destinationSources, ({ one }) => ({
  destination: one(destinations, {
    fields: [destinationSources.destinationId],
    references: [destinations.id],
  }),
}));

export const destinationEvidenceItemsRelations = relations(destinationEvidenceItems, ({ one }) => ({
  destination: one(destinations, {
    fields: [destinationEvidenceItems.destinationId],
    references: [destinations.id],
  }),
}));

export const destinationImagesRelations = relations(destinationImages, ({ one }) => ({
  destination: one(destinations, {
    fields: [destinationImages.destinationId],
    references: [destinations.id],
  }),
}));

// =============================================================================
// 8. USER PROFILES TABLE (Canonical Identity matching Supabase auth.users)
// =============================================================================

export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey(), // Matches Supabase auth.users.id
    email: varchar('email', { length: 255 }).notNull(),
    fullName: varchar('full_name', { length: 255 }),
    role: varchar('role', { length: 50 }).default('user').notNull(), // 'user' | 'editor' | 'admin'
    marketingEmailOptIn: boolean('marketing_email_opt_in').default(false).notNull(),
    marketingEmailOptedInAt: timestamp('marketing_email_opted_in_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index('profiles_email_idx').on(table.email),
    roleIdx: index('profiles_role_idx').on(table.role),
  })
);

// =============================================================================
// 9. SAVED DESTINATIONS TABLE (User Bookmarks / My Hidden India)
// =============================================================================

export const savedDestinations = pgTable(
  'saved_destinations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    destinationId: uuid('destination_id')
      .notNull()
      .references(() => destinations.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userDestUniqueIdx: uniqueIndex('saved_dest_user_dest_idx').on(
      table.userId,
      table.destinationId
    ),
    userIdx: index('saved_dest_user_idx').on(table.userId),
    destIdx: index('saved_dest_dest_idx').on(table.destinationId),
  })
);

// =============================================================================
// 10. TRIPS TABLE (User Itineraries)
// =============================================================================

export const trips = pgTable(
  'trips',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    startLocation: varchar('start_location', { length: 255 }),
    startLocationLabel: varchar('start_location_label', { length: 255 }),
    startLatitude: doublePrecision('start_latitude'),
    startLongitude: doublePrecision('start_longitude'),
    isStartLocationSaved: boolean('is_start_location_saved').default(false).notNull(),
    vehicleType: vehicleTypeEnum('vehicle_type').default('PETROL_CAR').notNull(),
    tripStartDate: date('trip_start_date'),
    tripEndDate: date('trip_end_date'),
    notes: text('notes'),
    isShared: boolean('is_shared').default(false).notNull(),
    shareToken: varchar('share_token', { length: 100 }).unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('trips_user_idx').on(table.userId),
    shareTokenIdx: index('trips_share_token_idx').on(table.shareToken),
  })
);

// =============================================================================
// 11. TRIP DESTINATIONS TABLE (Ordered Itinerary Waypoints)
// =============================================================================

export const tripDestinations = pgTable(
  'trip_destinations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tripId: uuid('trip_id')
      .notNull()
      .references(() => trips.id, { onDelete: 'cascade' }),
    destinationId: uuid('destination_id')
      .notNull()
      .references(() => destinations.id, { onDelete: 'cascade' }),
    sequence: integer('sequence').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tripSequenceIdx: uniqueIndex('trip_dest_trip_seq_idx').on(table.tripId, table.sequence),
    tripIdx: index('trip_dest_trip_idx').on(table.tripId),
    destIdx: index('trip_dest_dest_idx').on(table.destinationId),
  })
);

// =============================================================================
// 12. COLLECTIONS TABLE (Curated Editorial Themes & Trails)
// =============================================================================

export const collections = pgTable(
  'collections',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    shortDescription: varchar('short_description', { length: 500 }).notNull(),
    description: text('description').notNull(),
    coverImageUrl: text('cover_image_url'),
    region: varchar('region', { length: 100 }),
    theme: varchar('theme', { length: 100 }),
    editorialStatus: editorialStatusEnum('editorial_status').default('draft').notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index('collections_slug_idx').on(table.slug),
    statusIdx: index('collections_status_idx').on(table.editorialStatus),
  })
);

// =============================================================================
// 13. COLLECTION DESTINATIONS TABLE (Ordered Trail Waypoints)
// =============================================================================

export const collectionDestinations = pgTable(
  'collection_destinations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    collectionId: uuid('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade' }),
    destinationId: uuid('destination_id')
      .notNull()
      .references(() => destinations.id, { onDelete: 'cascade' }),
    sequence: integer('sequence').notNull(),
    editorialNote: text('editorial_note'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    collDestUniqueIdx: uniqueIndex('coll_dest_unique_idx').on(
      table.collectionId,
      table.destinationId
    ),
    collSeqUniqueIdx: uniqueIndex('coll_seq_unique_idx').on(
      table.collectionId,
      table.sequence
    ),
    collIdx: index('coll_dest_coll_idx').on(table.collectionId),
    destIdx: index('coll_dest_dest_idx').on(table.destinationId),
  })
);

// Phase 5 Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  savedDestinations: many(savedDestinations),
  trips: many(trips),
}));

export const savedDestinationsRelations = relations(savedDestinations, ({ one }) => ({
  user: one(profiles, {
    fields: [savedDestinations.userId],
    references: [profiles.id],
  }),
  destination: one(destinations, {
    fields: [savedDestinations.destinationId],
    references: [destinations.id],
  }),
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  user: one(profiles, {
    fields: [trips.userId],
    references: [profiles.id],
  }),
  destinations: many(tripDestinations),
}));

export const tripDestinationsRelations = relations(tripDestinations, ({ one }) => ({
  trip: one(trips, {
    fields: [tripDestinations.tripId],
    references: [trips.id],
  }),
  destination: one(destinations, {
    fields: [tripDestinations.destinationId],
    references: [destinations.id],
  }),
}));

// Phase 6 Relations
export const collectionsRelations = relations(collections, ({ many }) => ({
  destinations: many(collectionDestinations),
}));

export const collectionDestinationsRelations = relations(collectionDestinations, ({ one }) => ({
  collection: one(collections, {
    fields: [collectionDestinations.collectionId],
    references: [collections.id],
  }),
  destination: one(destinations, {
    fields: [collectionDestinations.destinationId],
    references: [destinations.id],
  }),
}));

// Inferred types
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Destination = typeof destinations.$inferSelect;
export type NewDestination = typeof destinations.$inferInsert;

export type DestinationCategory = typeof destinationCategories.$inferSelect;
export type NewDestinationCategory = typeof destinationCategories.$inferInsert;

export type DestinationVisitInfo = typeof destinationVisitInfo.$inferSelect;
export type NewDestinationVisitInfo = typeof destinationVisitInfo.$inferInsert;

export type DestinationSource = typeof destinationSources.$inferSelect;
export type NewDestinationSource = typeof destinationSources.$inferInsert;

export type DestinationEvidenceItem = typeof destinationEvidenceItems.$inferSelect;
export type NewDestinationEvidenceItem = typeof destinationEvidenceItems.$inferInsert;

export type DestinationImage = typeof destinationImages.$inferSelect;
export type NewDestinationImage = typeof destinationImages.$inferInsert;

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type SavedDestination = typeof savedDestinations.$inferSelect;
export type NewSavedDestination = typeof savedDestinations.$inferInsert;

export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;

export type TripDestination = typeof tripDestinations.$inferSelect;
export type NewTripDestination = typeof tripDestinations.$inferInsert;

export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;

export type CollectionDestination = typeof collectionDestinations.$inferSelect;
export type NewCollectionDestination = typeof collectionDestinations.$inferInsert;

