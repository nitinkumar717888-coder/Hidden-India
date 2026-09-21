import {
  DifficultyLevel,
  DifficultyLevelType,
  EditorialStatus,
  EditorialStatusType,
  EvidenceClassification,
  EvidenceClassificationType,
  SourceType,
  SourceTypeType,
} from '../types/enums';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates a URL string for http/https format.
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates SEO slug format: lowercase alphanumeric words separated by single hyphens.
 */
export function validateSlug(slug: string): ValidationError | null {
  if (!slug || slug.trim().length === 0) {
    return { field: 'slug', message: 'Slug is required.' };
  }
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(slug)) {
    return {
      field: 'slug',
      message:
        'Slug must consist solely of lowercase alphanumeric characters separated by single hyphens (e.g. bathinda-fort).',
    };
  }
  if (slug.length < 3 || slug.length > 200) {
    return { field: 'slug', message: 'Slug must be between 3 and 200 characters in length.' };
  }
  return null;
}

/**
 * Validates geographical coordinates.
 */
export function validateCoordinates(
  lat: number,
  lng: number
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof lat !== 'number' || isNaN(lat) || lat < -90 || lat > 90) {
    errors.push({ field: 'latitude', message: 'Latitude must be a valid number between -90 and 90.' });
  }
  if (typeof lng !== 'number' || isNaN(lng) || lng < -180 || lng > 180) {
    errors.push({ field: 'longitude', message: 'Longitude must be a valid number between -180 and 180.' });
  }
  return errors;
}

/**
 * Validates complete destination creation/update input.
 */
export interface DestinationPayload {
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  state: string;
  district: string;
  locality?: string | null;
  latitude: number;
  longitude: number;
  coordinateSource?: string | null;
  historicalPeriod?: string | null;
  difficulty?: DifficultyLevelType;
  estimatedVisitDuration: string;
  evidenceClassification: EvidenceClassificationType;
  editorialStatus: EditorialStatusType;
  categoryIds?: string[];
}

export function validateDestinationPayload(payload: DestinationPayload): ValidationResult {
  const errors: ValidationError[] = [];

  if (!payload.name || payload.name.trim().length < 3) {
    errors.push({ field: 'name', message: 'Destination name is required and must be at least 3 characters.' });
  }

  const slugError = validateSlug(payload.slug);
  if (slugError) errors.push(slugError);

  if (!payload.shortDescription || payload.shortDescription.trim().length < 20) {
    errors.push({
      field: 'shortDescription',
      message: 'Short description must be at least 20 characters.',
    });
  }

  if (!payload.longDescription || payload.longDescription.trim().length < 50) {
    errors.push({
      field: 'longDescription',
      message: 'Long editorial description is required and must be at least 50 characters.',
    });
  }

  if (!payload.state || payload.state.trim().length === 0) {
    errors.push({ field: 'state', message: 'State is required.' });
  }

  if (!payload.district || payload.district.trim().length === 0) {
    errors.push({ field: 'district', message: 'District is required.' });
  }

  const coordErrors = validateCoordinates(payload.latitude, payload.longitude);
  errors.push(...coordErrors);

  if (
    !Object.values(EditorialStatus).includes(payload.editorialStatus as any)
  ) {
    errors.push({
      field: 'editorialStatus',
      message: `Invalid editorial status: ${payload.editorialStatus}.`,
    });
  }

  if (
    !Object.values(EvidenceClassification).includes(
      payload.evidenceClassification as any
    )
  ) {
    errors.push({
      field: 'evidenceClassification',
      message: `Invalid evidence classification: ${payload.evidenceClassification}.`,
    });
  }

  if (
    payload.difficulty &&
    !Object.values(DifficultyLevel).includes(payload.difficulty as any)
  ) {
    errors.push({
      field: 'difficulty',
      message: `Invalid difficulty level: ${payload.difficulty}.`,
    });
  }

  if (
    !payload.estimatedVisitDuration ||
    payload.estimatedVisitDuration.trim().length === 0
  ) {
    errors.push({
      field: 'estimatedVisitDuration',
      message: 'Estimated visit duration is required (e.g. "1.5–2 hours").',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates bibliographic source input.
 */
export interface SourcePayload {
  title: string;
  publisher: string;
  url?: string | null;
  sourceType: SourceTypeType;
  publicationDate?: string | null;
  notes?: string | null;
}

export function validateSourcePayload(payload: SourcePayload): ValidationResult {
  const errors: ValidationError[] = [];

  if (!payload.title || payload.title.trim().length < 3) {
    errors.push({ field: 'title', message: 'Source title is required.' });
  }

  if (!payload.publisher || payload.publisher.trim().length < 2) {
    errors.push({ field: 'publisher', message: 'Publisher is required.' });
  }

  if (payload.url && payload.url.trim().length > 0 && !isValidUrl(payload.url.trim())) {
    errors.push({
      field: 'url',
      message: 'Source URL must be a valid HTTP or HTTPS address.',
    });
  }

  if (!Object.values(SourceType).includes(payload.sourceType as any)) {
    errors.push({
      field: 'sourceType',
      message: `Invalid source type: ${payload.sourceType}. Must be one of: ${Object.values(
        SourceType
      ).join(', ')}.`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates media image input.
 */
export interface ImagePayload {
  imageUrl: string;
  altText: string;
  caption?: string | null;
  credit?: string | null;
  license?: string | null;
}

export function validateImagePayload(payload: ImagePayload): ValidationResult {
  const errors: ValidationError[] = [];

  if (!payload.imageUrl || payload.imageUrl.trim().length === 0) {
    errors.push({ field: 'imageUrl', message: 'Image URL is required.' });
  } else if (
    !payload.imageUrl.startsWith('/') &&
    !isValidUrl(payload.imageUrl)
  ) {
    errors.push({
      field: 'imageUrl',
      message: 'Image URL must be an absolute web URL or a root-relative local path (e.g. /images/...).',
    });
  }

  if (!payload.altText || payload.altText.trim().length < 5) {
    errors.push({
      field: 'altText',
      message: 'Descriptive alt text is required for accessibility and must be at least 5 characters.',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
