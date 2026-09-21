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
