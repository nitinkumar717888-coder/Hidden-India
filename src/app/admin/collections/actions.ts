'use server';

import { revalidatePath } from 'next/cache';
import { collectionService } from '@/lib/services/collection-service';
import { assertAdminUser } from '@/lib/supabase/server';
import { EditorialStatus, EditorialStatusType } from '@/lib/types/enums';

/**
 * Server Action: Create a new collection (admin only).
 */
export async function createCollectionAction(formData: FormData) {
  await assertAdminUser();

  const title = (formData.get('title') as string)?.trim();
  const slug = (formData.get('slug') as string)?.trim().toLowerCase();
  const shortDescription = (formData.get('shortDescription') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();
  const coverImageUrl = (formData.get('coverImageUrl') as string)?.trim() || null;
  const region = (formData.get('region') as string)?.trim() || null;
  const theme = (formData.get('theme') as string)?.trim() || null;
  const editorialStatus =
    (formData.get('editorialStatus') as EditorialStatusType) || EditorialStatus.DRAFT;

  if (!title || !slug || !shortDescription || !description) {
    return {
      success: false,
      error: 'Title, slug, short description, and editorial overview are required.',
    };
  }

  const result = await collectionService.createCollection({
    title,
    slug,
    shortDescription,
    description,
    coverImageUrl,
    region,
    theme,
    editorialStatus,
    publishedAt: editorialStatus === EditorialStatus.PUBLISHED ? new Date() : null,
  });

  if (result.success && result.collection) {
    revalidatePath('/admin/collections');
    revalidatePath('/collections');
    return { success: true, id: result.collection.id, slug: result.collection.slug };
  }

  return { success: false, error: result.error || 'Failed to create collection.' };
}

/**
 * Server Action: Update collection metadata (admin only).
 */
export async function updateCollectionAction(formData: FormData) {
  await assertAdminUser();

  const id = formData.get('id') as string;
  const title = (formData.get('title') as string)?.trim();
  const slug = (formData.get('slug') as string)?.trim().toLowerCase();
  const shortDescription = (formData.get('shortDescription') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();
  const coverImageUrl = (formData.get('coverImageUrl') as string)?.trim() || null;
  const region = (formData.get('region') as string)?.trim() || null;
  const theme = (formData.get('theme') as string)?.trim() || null;
  const editorialStatus = formData.get('editorialStatus') as EditorialStatusType;

  if (!id || !title || !slug || !shortDescription || !description) {
    return {
      success: false,
      error: 'ID, title, slug, short description, and overview are required.',
    };
  }

  const result = await collectionService.updateCollection(id, {
    title,
    slug,
    shortDescription,
    description,
    coverImageUrl,
    region,
    theme,
    editorialStatus,
  });

  if (result.success && result.collection) {
    revalidatePath('/admin/collections');
    revalidatePath(`/admin/collections/${id}`);
    revalidatePath('/collections');
    revalidatePath(`/collections/${result.collection.slug}`);
    return { success: true, slug: result.collection.slug };
  }

  return { success: false, error: result.error || 'Failed to update collection.' };
}

/**
 * Server Action: Update ordered destinations for a collection (admin only).
 */
export async function updateCollectionDestinationsAction(
  collectionId: string,
  waypoints: { destinationId: string; sequence: number; editorialNote?: string | null }[]
) {
  await assertAdminUser();

  if (!collectionId) {
    return { success: false, error: 'Collection ID is required.' };
  }

  const success = await collectionService.setCollectionDestinations(collectionId, waypoints);

  if (success) {
    revalidatePath(`/admin/collections/${collectionId}`);
    revalidatePath('/collections');
    return { success: true };
  }

  return { success: false, error: 'Failed to update collection waypoints.' };
}

/**
 * Server Action: Toggle publication status of a collection (admin only).
 */
export async function toggleCollectionStatusAction(id: string, status: EditorialStatusType) {
  await assertAdminUser();

  const result = await collectionService.updateCollection(id, {
    editorialStatus: status,
    publishedAt: status === EditorialStatus.PUBLISHED ? new Date() : null,
  });

  if (result.success && result.collection) {
    revalidatePath('/admin/collections');
    revalidatePath(`/admin/collections/${id}`);
    revalidatePath('/collections');
    revalidatePath(`/collections/${result.collection.slug}`);
    return { success: true };
  }

  return { success: false, error: result.error || 'Failed to change status.' };
}

/**
 * Server Action: Delete a collection (admin only).
 */
export async function deleteCollectionAction(id: string) {
  await assertAdminUser();

  const success = await collectionService.deleteCollection(id);

  if (success) {
    revalidatePath('/admin/collections');
    revalidatePath('/collections');
    return { success: true };
  }

  return { success: false, error: 'Failed to delete collection.' };
}
