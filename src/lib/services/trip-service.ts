/**
 * HIDDEN INDIA — MY TRIPS SERVICE
 * Comprehensive trip lifecycle, ordered waypoint sequencing, and sharing controls.
 * STRICT: Enforces server-side ownership authorization.
 */

import { db } from '../db';
import {
  trips,
  tripDestinations,
  destinations,
  destinationVisitInfo,
  destinationImages,
  Trip,
  Destination,
  DestinationVisitInfo,
  DestinationImage,
} from '../db/schema';
import { eq, and, asc, desc, inArray } from 'drizzle-orm';
import crypto from 'crypto';
import { VehicleCategory } from '../calculator/types';

export const MAX_TRIP_WAYPOINTS = 10;

export interface TripWaypoint {
  id: string;
  sequence: number;
  notes: string | null;
  destination: Destination;
  visitInfo: DestinationVisitInfo | null;
  primaryImage: DestinationImage | null;
}

export interface EnrichedTrip {
  trip: Trip;
  waypoints: TripWaypoint[];
  destinationCount: number;
}

export interface CreateTripInput {
  name: string;
  startLocation?: string | null;
  startLocationLabel?: string | null;
  startLatitude?: number | null;
  startLongitude?: number | null;
  isStartLocationSaved?: boolean;
  vehicleType?: VehicleCategory;
  tripStartDate?: string | null;
  tripEndDate?: string | null;
  notes?: string | null;
  destinationIds?: string[];
}

export class TripService {
  /**
   * Creates a new trip owned by the authenticated user.
   */
  async createTrip(userId: string, input: CreateTripInput): Promise<Trip> {
    if (!db) throw new Error('Database unavailable');

    if (input.destinationIds && input.destinationIds.length > MAX_TRIP_WAYPOINTS) {
      throw new Error(`A trip can contain a maximum of ${MAX_TRIP_WAYPOINTS} destinations.`);
    }

    // PRIVACY INVARIANT: If not explicitly saved, never persist precise coordinates to the database
    const isStartLocationSaved = Boolean(input.isStartLocationSaved);
    const startLatitude = isStartLocationSaved ? (input.startLatitude ?? null) : null;
    const startLongitude = isStartLocationSaved ? (input.startLongitude ?? null) : null;

    const [newTrip] = await db
      .insert(trips)
      .values({
        userId,
        name: input.name.trim(),
        startLocation: input.startLocation || 'Chandigarh',
        startLocationLabel: input.startLocationLabel || 'Chandigarh',
        startLatitude,
        startLongitude,
        isStartLocationSaved,
        vehicleType: input.vehicleType || 'PETROL_CAR',
        tripStartDate: input.tripStartDate || null,
        tripEndDate: input.tripEndDate || null,
        notes: input.notes || null,
      })
      .returning();

    if (!newTrip) {
      throw new Error('Failed to create trip record.');
    }

    // Add initial destinations if provided
    if (input.destinationIds && input.destinationIds.length > 0) {
      const waypointsToInsert = input.destinationIds.map((destId, idx) => ({
        tripId: newTrip.id,
        destinationId: destId,
        sequence: idx + 1,
      }));

      await db.insert(tripDestinations).values(waypointsToInsert);
    }

    return newTrip;
  }

  /**
   * Lists all trips owned by a user.
   */
  async getUserTrips(userId: string): Promise<{ trip: Trip; destinationCount: number }[]> {
    if (!db) return [];

    const userTrips = await db.query.trips?.findMany({
      where: eq(trips.userId, userId),
      orderBy: [desc(trips.createdAt)],
    });

    if (!userTrips || userTrips.length === 0) return [];

    const tripIds = userTrips.map((t) => t.id);
    const allWaypoints = await db
      .select({ tripId: tripDestinations.tripId })
      .from(tripDestinations)
      .where(inArray(tripDestinations.tripId, tripIds));

    const countMap = new Map<string, number>();
    allWaypoints.forEach((w) => {
      countMap.set(w.tripId, (countMap.get(w.tripId) || 0) + 1);
    });

    return userTrips.map((t) => ({
      trip: t,
      destinationCount: countMap.get(t.id) || 0,
    }));
  }

  /**
   * Retrieves a single trip with fully enriched, ordered waypoints.
   * STRICT: Validates user ownership.
   */
  async getTripById(userId: string, tripId: string): Promise<EnrichedTrip | null> {
    if (!db) return null;

    const trip = await db.query.trips?.findFirst({
      where: and(eq(trips.id, tripId), eq(trips.userId, userId)),
    });

    if (!trip) return null;

    return this.enrichTrip(trip);
  }

  /**
   * Updates trip metadata (name, vehicle, dates, start location, notes).
   * STRICT: Validates user ownership.
   */
  async updateTrip(
    userId: string,
    tripId: string,
    updates: Partial<Omit<Trip, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Trip> {
    if (!db) throw new Error('Database unavailable');

    const sanitizedUpdates = { ...updates };
    // PRIVACY INVARIANT: If start location is not saved, coordinates must be null
    if (sanitizedUpdates.isStartLocationSaved !== undefined && !sanitizedUpdates.isStartLocationSaved) {
      sanitizedUpdates.startLatitude = null;
      sanitizedUpdates.startLongitude = null;
    }

    const [updated] = await db
      .update(trips)
      .set({
        ...sanitizedUpdates,
        updatedAt: new Date(),
      })
      .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
      .returning();

    if (!updated) {
      throw new Error('Trip not found or unauthorized to update.');
    }

    return updated;
  }

  /**
   * Deletes a trip and cascades to its waypoints.
   * STRICT: Validates user ownership.
   */
  async deleteTrip(userId: string, tripId: string): Promise<boolean> {
    if (!db) return false;

    const deleted = await db
      .delete(trips)
      .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
      .returning({ id: trips.id });

    return deleted.length > 0;
  }

  /**
   * Appends a destination to a trip.
   */
  async addDestinationToTrip(
    userId: string,
    tripId: string,
    destinationId: string
  ): Promise<boolean> {
    if (!db) return false;

    // Verify trip ownership
    const trip = await db.query.trips?.findFirst({
      where: and(eq(trips.id, tripId), eq(trips.userId, userId)),
      columns: { id: true },
    });

    if (!trip) throw new Error('Trip not found or unauthorized.');

    // Get current max sequence and count
    const existingWaypoints = await db
      .select({ sequence: tripDestinations.sequence })
      .from(tripDestinations)
      .where(eq(tripDestinations.tripId, tripId))
      .orderBy(desc(tripDestinations.sequence));

    if (existingWaypoints.length >= MAX_TRIP_WAYPOINTS) {
      throw new Error(`A trip can contain a maximum of ${MAX_TRIP_WAYPOINTS} destinations.`);
    }

    const nextSeq = existingWaypoints.length > 0 ? existingWaypoints[0].sequence + 1 : 1;

    await db.insert(tripDestinations).values({
      tripId,
      destinationId,
      sequence: nextSeq,
    });

    return true;
  }

  /**
   * Adds multiple destinations to an existing trip.
   * STRICT: Enforces trip ownership, deduplicates, and validates the 10-waypoint maximum cap.
   */
  async addDestinationsToTrip(
    userId: string,
    tripId: string,
    destinationIds: string[]
  ): Promise<{
    success: boolean;
    addedCount: number;
    skippedDuplicatesCount: number;
    currentTotal: number;
    message: string;
  }> {
    if (!db) {
      return {
        success: false,
        addedCount: 0,
        skippedDuplicatesCount: 0,
        currentTotal: 0,
        message: 'Database unavailable',
      };
    }

    // 1. Verify trip ownership
    const trip = await db.query.trips?.findFirst({
      where: and(eq(trips.id, tripId), eq(trips.userId, userId)),
      columns: { id: true, name: true },
    });

    if (!trip) throw new Error('Trip not found or unauthorized.');

    // 2. Fetch existing waypoints
    const existingWaypoints = await db
      .select({ destinationId: tripDestinations.destinationId, sequence: tripDestinations.sequence })
      .from(tripDestinations)
      .where(eq(tripDestinations.tripId, tripId))
      .orderBy(asc(tripDestinations.sequence));

    const existingDestSet = new Set(existingWaypoints.map((w) => w.destinationId));

    // Deduplicate within the incoming list while preserving order
    const uniqueIncoming: string[] = [];
    const seen = new Set<string>();
    for (const id of destinationIds) {
      if (!seen.has(id)) {
        seen.add(id);
        uniqueIncoming.push(id);
      }
    }

    const toAdd: string[] = [];
    let skippedDuplicatesCount = 0;

    for (const id of uniqueIncoming) {
      if (existingDestSet.has(id)) {
        skippedDuplicatesCount++;
      } else {
        toAdd.push(id);
      }
    }

    const currentCount = existingWaypoints.length;

    // 3. Strict 10-destination cap validation
    if (currentCount + toAdd.length > MAX_TRIP_WAYPOINTS) {
      throw new Error(
        `Cannot add ${toAdd.length} destination${toAdd.length > 1 ? 's' : ''}. ` +
          `A trip can contain a maximum of ${MAX_TRIP_WAYPOINTS} destinations (current: ${currentCount}).`
      );
    }

    // If nothing new to add
    if (toAdd.length === 0) {
      return {
        success: true,
        addedCount: 0,
        skippedDuplicatesCount,
        currentTotal: currentCount,
        message:
          skippedDuplicatesCount > 0
            ? `All selected destinations (${skippedDuplicatesCount}) are already in your trip.`
            : 'No destinations were provided.',
      };
    }

    // 4. Determine starting sequence
    const maxSeq =
      existingWaypoints.length > 0
        ? Math.max(...existingWaypoints.map((w) => w.sequence))
        : 0;

    // 5. Insert new waypoints
    for (let i = 0; i < toAdd.length; i++) {
      await db.insert(tripDestinations).values({
        tripId,
        destinationId: toAdd[i],
        sequence: maxSeq + i + 1,
      });
    }

    await db
      .update(trips)
      .set({ updatedAt: new Date() })
      .where(eq(trips.id, tripId));

    const message =
      `${toAdd.length} destination${toAdd.length > 1 ? 's' : ''} added to "${trip.name}".` +
      (skippedDuplicatesCount > 0
        ? ` ${skippedDuplicatesCount} destination${skippedDuplicatesCount > 1 ? 's were' : ' was'} already in the trip.`
        : '');

    return {
      success: true,
      addedCount: toAdd.length,
      skippedDuplicatesCount,
      currentTotal: currentCount + toAdd.length,
      message,
    };
  }

  /**
   * Creates a brand-new trip pre-populated with destinations (e.g. from a collection).
   */
  async createTripFromDestinations(
    userId: string,
    tripName: string,
    destinationIds: string[]
  ): Promise<{ trip: Trip; destinationCount: number }> {
    if (!db) throw new Error('Database unavailable');

    // Deduplicate incoming while preserving order
    const uniqueIncoming: string[] = [];
    const seen = new Set<string>();
    for (const id of destinationIds) {
      if (!seen.has(id)) {
        seen.add(id);
        uniqueIncoming.push(id);
      }
    }

    if (uniqueIncoming.length > MAX_TRIP_WAYPOINTS) {
      throw new Error(
        `Cannot create trip with ${uniqueIncoming.length} destinations. Maximum allowed is ${MAX_TRIP_WAYPOINTS}.`
      );
    }

    // Create trip
    const [newTrip] = await db
      .insert(trips)
      .values({
        userId,
        name: tripName.trim() || 'Curated Trail Trip',
        isStartLocationSaved: false,
      })
      .returning();

    if (!newTrip) throw new Error('Failed to create trip');

    for (let i = 0; i < uniqueIncoming.length; i++) {
      await db.insert(tripDestinations).values({
        tripId: newTrip.id,
        destinationId: uniqueIncoming[i],
        sequence: i + 1,
      });
    }

    return {
      trip: newTrip,
      destinationCount: uniqueIncoming.length,
    };
  }

  /**
   * Removes a destination from a trip and resequences remaining waypoints.
   */
  async removeDestinationFromTrip(
    userId: string,
    tripId: string,
    destinationId: string
  ): Promise<boolean> {
    if (!db) return false;

    // Verify ownership
    const trip = await db.query.trips?.findFirst({
      where: and(eq(trips.id, tripId), eq(trips.userId, userId)),
      columns: { id: true },
    });

    if (!trip) throw new Error('Trip not found or unauthorized.');

    // Delete waypoint
    await db
      .delete(tripDestinations)
      .where(
        and(
          eq(tripDestinations.tripId, tripId),
          eq(tripDestinations.destinationId, destinationId)
        )
      );

    // Resequence remaining waypoints
    const remaining = await db
      .select({ id: tripDestinations.id })
      .from(tripDestinations)
      .where(eq(tripDestinations.tripId, tripId))
      .orderBy(asc(tripDestinations.sequence));

    for (let i = 0; i < remaining.length; i++) {
      await db
        .update(tripDestinations)
        .set({ sequence: i + 1 })
        .where(eq(tripDestinations.id, remaining[i].id));
    }

    return true;
  }

  /**
   * Reorders trip destinations by an array of destination IDs in their new order.
   */
  async reorderTripDestinations(
    userId: string,
    tripId: string,
    destinationIdsInOrder: string[]
  ): Promise<boolean> {
    if (!db) return false;

    // Verify ownership
    const trip = await db.query.trips?.findFirst({
      where: and(eq(trips.id, tripId), eq(trips.userId, userId)),
      columns: { id: true },
    });

    if (!trip) throw new Error('Trip not found or unauthorized.');

    for (let i = 0; i < destinationIdsInOrder.length; i++) {
      await db
        .update(tripDestinations)
        .set({ sequence: i + 1 })
        .where(
          and(
            eq(tripDestinations.tripId, tripId),
            eq(tripDestinations.destinationId, destinationIdsInOrder[i])
          )
        );
    }

    return true;
  }

  /**
   * Toggles public sharing of a trip.
   * Generates a cryptographically random shareToken when enabling.
   */
  async toggleTripSharing(
    userId: string,
    tripId: string,
    isShared: boolean
  ): Promise<{ isShared: boolean; shareToken: string | null }> {
    if (!db) throw new Error('Database unavailable');

    const shareToken = isShared ? crypto.randomBytes(16).toString('hex') : null;

    const [updated] = await db
      .update(trips)
      .set({
        isShared,
        shareToken,
        updatedAt: new Date(),
      })
      .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
      .returning();

    if (!updated) {
      throw new Error('Trip not found or unauthorized.');
    }

    return {
      isShared: updated.isShared,
      shareToken: updated.shareToken,
    };
  }

  /**
   * Retrieves a publicly shared trip by token.
   * PRIVACY: Sanitizes private notes and exact home coordinates.
   */
  async getSharedTrip(shareToken: string): Promise<EnrichedTrip | null> {
    if (!db) return null;

    const trip = await db.query.trips?.findFirst({
      where: and(eq(trips.shareToken, shareToken), eq(trips.isShared, true)),
    });

    if (!trip) return null;

    // Redact private notes and precise origin coordinates if not saved
    const sanitizedTrip: Trip = {
      ...trip,
      notes: null, // Private notes redacted for public shares
      startLatitude: trip.isStartLocationSaved ? trip.startLatitude : null,
      startLongitude: trip.isStartLocationSaved ? trip.startLongitude : null,
    };

    const enriched = await this.enrichTrip(sanitizedTrip);
    return {
      ...enriched,
      waypoints: enriched.waypoints.map((w) => ({
        ...w,
        notes: null, // Waypoint-level private notes redacted for public shares
      })),
    };
  }

  /**
   * Helper to enrich trip records with ordered waypoints, visit info, and images.
   */
  private async enrichTrip(trip: Trip): Promise<EnrichedTrip> {
    const rawWaypoints = await db!
      .select({
        id: tripDestinations.id,
        sequence: tripDestinations.sequence,
        notes: tripDestinations.notes,
        destination: destinations,
      })
      .from(tripDestinations)
      .innerJoin(destinations, eq(tripDestinations.destinationId, destinations.id))
      .where(eq(tripDestinations.tripId, trip.id))
      .orderBy(asc(tripDestinations.sequence));

    if (rawWaypoints.length === 0) {
      return {
        trip,
        waypoints: [],
        destinationCount: 0,
      };
    }

    const destIds = rawWaypoints.map((w) => w.destination.id);

    // Batch fetch visit info and primary images
    const [visitInfos, allImages] = await Promise.all([
      db!
        .select()
        .from(destinationVisitInfo)
        .where(inArray(destinationVisitInfo.destinationId, destIds)),
      db!
        .select()
        .from(destinationImages)
        .where(inArray(destinationImages.destinationId, destIds)),
    ]);

    const visitInfoByDest = new Map<string, DestinationVisitInfo>();
    visitInfos.forEach((v) => visitInfoByDest.set(v.destinationId, v));

    const imageByDest = new Map<string, DestinationImage>();
    allImages.forEach((img) => {
      const existing = imageByDest.get(img.destinationId);
      if (!existing || img.isPrimary) {
        imageByDest.set(img.destinationId, img);
      }
    });

    const waypoints: TripWaypoint[] = rawWaypoints.map((w) => ({
      id: w.id,
      sequence: w.sequence,
      notes: w.notes,
      destination: w.destination,
      visitInfo: visitInfoByDest.get(w.destination.id) || null,
      primaryImage: imageByDest.get(w.destination.id) || null,
    }));

    return {
      trip,
      waypoints,
      destinationCount: waypoints.length,
    };
  }
}

export const tripService = new TripService();
