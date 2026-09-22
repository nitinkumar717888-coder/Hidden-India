'use server';

import { revalidatePath } from 'next/cache';
import { destinationService } from '@/lib/services/destination-service';
import { assertAdminUser } from '@/lib/supabase/server';
import {
  DifficultyLevelType,
  EditorialStatusType,
  EvidenceClassificationType,
} from '@/lib/types/enums';

/**
 * Server Action: Create a new destination via the Admin panel.
 */
export async function createDestinationAction(formData: FormData) {
  await assertAdminUser();
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const shortDescription = formData.get('shortDescription') as string;
  const longDescription = formData.get('longDescription') as string;
  const state = formData.get('state') as string;
  const district = formData.get('district') as string;
  const locality = (formData.get('locality') as string) || null;
  const latitude = parseFloat(formData.get('latitude') as string);
  const longitude = parseFloat(formData.get('longitude') as string);
  const coordinateSource = (formData.get('coordinateSource') as string) || null;
  const historicalPeriod = (formData.get('historicalPeriod') as string) || null;
  const difficulty = (formData.get('difficulty') as DifficultyLevelType) || 'easy';
  const estimatedVisitDuration = formData.get('estimatedVisitDuration') as string;
  const evidenceClassification = formData.get(
    'evidenceClassification'
  ) as EvidenceClassificationType;
  const editorialStatus = (formData.get('editorialStatus') as EditorialStatusType) || 'draft';

  const result = await destinationService.create({
    name,
    slug,
    shortDescription,
    longDescription,
    state,
    district,
    locality,
    latitude,
    longitude,
    coordinateSource,
    historicalPeriod,
    difficulty,
    estimatedVisitDuration,
    evidenceClassification,
    editorialStatus,
  });

  if (result.success) {
    revalidatePath('/admin/destinations');
    revalidatePath('/destinations');
    return { success: true, slug };
  }

  return {
    success: false,
    errors: result.validation?.errors || [{ field: 'form', message: result.error || 'Failed' }],
  };
}

/**
 * Server Action: Update editorial workflow status (e.g. publish, archive, review).
 */
export async function updateDestinationStatusAction(
  destinationId: string,
  newStatus: EditorialStatusType
) {
  await assertAdminUser();
  const result = await destinationService.updateStatus(destinationId, newStatus);
  if (result.success) {
    revalidatePath('/admin/destinations');
    revalidatePath('/destinations');
  }
  return result;
}

/**
 * Server Action: Ingest and verify photography for a destination.
 */
export async function addDestinationImageAction(formData: FormData) {
  await assertAdminUser();
  const destinationId = formData.get('destinationId') as string;
  const imageUrl = formData.get('imageUrl') as string;
  const altText = formData.get('altText') as string;
  const role = (formData.get('role') as 'hero' | 'detail' | 'context') || 'hero';
  const photographer = (formData.get('photographer') as string) || null;
  const captureDate = (formData.get('captureDate') as string) || null;
  const source = (formData.get('source') as string) || 'Wikimedia Commons';
  const sourceUrl = formData.get('sourceUrl') as string;
  const originalFileUrl = (formData.get('originalFileUrl') as string) || imageUrl;
  const license = formData.get('license') as string;
  const licenseUrl = (formData.get('licenseUrl') as string) || null;
  const attribution = (formData.get('attribution') as string) || null;
  const caption = (formData.get('caption') as string) || null;
  const modificationNotes = (formData.get('modificationNotes') as string) || null;
  const editorialStatus = (formData.get('editorialStatus') as any) || 'PENDING_PHOTOGRAPHY';
  const isPrimary = formData.get('isPrimary') === 'true' || role === 'hero';

  const { photographyService } = await import('@/lib/services/photography-service');
  const validation = photographyService.validateThirdPartyImage({
    imageUrl,
    altText,
    role,
    photographer,
    captureDate,
    source,
    sourceUrl,
    originalFileUrl,
    license,
    licenseUrl,
    attribution,
  });

  const requiresEditorialReplacement =
    editorialStatus !== 'VERIFIED_THIRD_PARTY' && editorialStatus !== 'VERIFIED_FIELD';

  const { db, destinationImages } = await import('@/lib/db');
  if (db) {
    await db.insert(destinationImages).values({
      destinationId,
      imageUrl,
      altText,
      caption,
      credit: photographer ? `${photographer} (${source})` : source,
      license,
      licenseUrl,
      source,
      sourceUrl,
      originalFileUrl,
      photographer,
      captureDate,
      attribution: validation.normalizedAttribution || attribution,
      accessedAt: new Date(),
      modificationNotes,
      role,
      editorialStatus,
      requiresEditorialReplacement,
      isPrimary,
    });
  }

  revalidatePath(`/admin/destinations/${destinationId}`);
  revalidatePath('/admin/destinations');
  revalidatePath('/destinations');
  return { success: true, validation };
}
