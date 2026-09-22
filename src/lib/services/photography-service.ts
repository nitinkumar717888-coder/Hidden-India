/**
 * Photography Intake, Licensing & Attribution Service
 * Enforces strict provenance, license compatibility, and editorial verification for Hidden India.
 */

export interface PhotographyProvenanceInput {
  imageUrl: string;
  altText: string;
  caption?: string | null;
  role: 'hero' | 'detail' | 'context';
  photographer?: string | null;
  captureDate?: string | null;
  source: string;
  sourceUrl: string;
  originalFileUrl: string;
  license: string;
  licenseUrl?: string | null;
  attribution?: string | null;
  accessedAt?: string | null;
  modificationNotes?: string | null;
  editorialStatus?:
    | 'PENDING_PHOTOGRAPHY'
    | 'PENDING_LICENSE_VERIFICATION'
    | 'VERIFIED_THIRD_PARTY'
    | 'VERIFIED_FIELD'
    | 'REJECTED';
}

export interface LicenseValidationResult {
  isValid: boolean;
  errors: string[];
  normalizedAttribution?: string;
  isCompatibleForWeb: boolean;
}

export const PERMITTED_THIRD_PARTY_LICENSES = [
  'CC0',
  'CC0 1.0',
  'CC0 1.0 Universal',
  'Public Domain',
  'CC BY 2.0',
  'CC BY 2.5',
  'CC BY 3.0',
  'CC BY 4.0',
  'CC BY-SA 2.0',
  'CC BY-SA 2.5',
  'CC BY-SA 3.0',
  'CC BY-SA 4.0',
  'Open Government Licence',
  'Government Open Data License - India (GODL)',
] as const;

export class PhotographyService {
  /**
   * Validates third-party photograph metadata against licensing, attribution, and provenance rules.
   */
  validateThirdPartyImage(input: Partial<PhotographyProvenanceInput>): LicenseValidationResult {
    const errors: string[] = [];

    // 1. Image URL and Alt Text
    if (!input.imageUrl || input.imageUrl.trim().length === 0) {
      errors.push('Missing image URL.');
    }
    if (!input.altText || input.altText.trim().length === 0) {
      errors.push('Missing accessible alt text.');
    }

    // 2. License check
    if (!input.license || input.license.trim().length === 0) {
      errors.push('Missing license.');
    } else {
      const trimmedLicense = input.license.trim();
      const isPermitted = PERMITTED_THIRD_PARTY_LICENSES.some(
        (lic) => lic.toLowerCase() === trimmedLicense.toLowerCase()
      );
      if (!isPermitted) {
        errors.push(`Incompatible or unverified license: "${trimmedLicense}". Must be an authorized open license.`);
      }
    }

    // 3. Source & Source URL check
    if (!input.source || input.source.trim().length === 0) {
      errors.push('Missing photography source repository (e.g. Wikimedia Commons, ASI Archive).');
    }

    if (!input.sourceUrl || input.sourceUrl.trim().length === 0) {
      errors.push('Missing source URL.');
    } else {
      try {
        const parsed = new URL(input.sourceUrl);
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
          errors.push('Source URL must use valid HTTP/HTTPS protocol.');
        }
      } catch {
        errors.push('Invalid source URL format.');
      }
    }

    // 4. Photographer check
    if (input.photographer) {
      const lower = input.photographer.trim().toLowerCase();
      if (
        lower === 'unknown' ||
        lower === 'unknown photographer' ||
        lower === 'anonymous' ||
        lower === 'n/a'
      ) {
        errors.push(
          'Photographer name cannot be a placeholder like "Unknown Photographer". Set photographer to null if truly unidentified by the source.'
        );
      }
    }

    // 5. Attribution check
    const requiresAttribution =
      input.license &&
      !input.license.toLowerCase().includes('cc0') &&
      !input.license.toLowerCase().includes('public domain');

    if (requiresAttribution) {
      if (!input.attribution || input.attribution.trim().length === 0) {
        errors.push('Missing required attribution string for attribution-required license.');
      } else if (input.attribution.includes('Photo: Hidden India')) {
        errors.push('Cannot claim "Photo: Hidden India" for third-party licensed photography.');
      }
    }

    // Construct normalized attribution if valid
    let normalizedAttribution = input.attribution?.trim();
    if (!normalizedAttribution && input.license) {
      const photoPart = input.photographer ? `Photo: ${input.photographer}` : 'Photo: Source Archive';
      const sourcePart = input.source ? ` • Source: ${input.source}` : '';
      const licensePart = ` • License: ${input.license}`;
      normalizedAttribution = `${photoPart}${sourcePart}${licensePart}`;
    }

    return {
      isValid: errors.length === 0,
      errors,
      normalizedAttribution,
      isCompatibleForWeb: errors.length === 0,
    };
  }

  /**
   * Validates state transitions in the photography lifecycle.
   */
  canTransitionStatus(
    currentStatus: string,
    targetStatus: string,
    imageMetadata: Partial<PhotographyProvenanceInput>
  ): { allowed: boolean; reason?: string } {
    if (currentStatus === targetStatus) {
      return { allowed: true };
    }

    // Standard progression:
    // PENDING_PHOTOGRAPHY -> PENDING_LICENSE_VERIFICATION
    // PENDING_LICENSE_VERIFICATION -> VERIFIED_THIRD_PARTY (only if valid)
    // PENDING_LICENSE_VERIFICATION -> REJECTED
    // PENDING_PHOTOGRAPHY -> VERIFIED_FIELD

    if (targetStatus === 'VERIFIED_THIRD_PARTY') {
      const validation = this.validateThirdPartyImage(imageMetadata);
      if (!validation.isValid) {
        return {
          allowed: false,
          reason: `Cannot mark as VERIFIED_THIRD_PARTY due to validation failures: ${validation.errors.join('; ')}`,
        };
      }
      if (currentStatus === 'PENDING_PHOTOGRAPHY') {
        return {
          allowed: false,
          reason: 'Cannot transition directly from PENDING_PHOTOGRAPHY to VERIFIED_THIRD_PARTY without PENDING_LICENSE_VERIFICATION review step.',
        };
      }
    }

    if (targetStatus === 'VERIFIED_FIELD') {
      if (!imageMetadata.captureDate && !imageMetadata.photographer) {
        return {
          allowed: false,
          reason: 'Field photography requires documented photographer and capture metadata.',
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Resolves whether an image is ready for verified publication replacement.
   */
  isReadyForReplacement(status: string, requiresReplacement: boolean): boolean {
    if (requiresReplacement) return false;
    return status === 'VERIFIED_THIRD_PARTY' || status === 'VERIFIED_FIELD';
  }
}

export const photographyService = new PhotographyService();
