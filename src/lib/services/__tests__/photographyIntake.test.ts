import { describe, it, expect } from 'vitest';
import {
  photographyService,
  PERMITTED_THIRD_PARTY_LICENSES,
} from '../photography-service';
import {
  RESEARCHED_DESTINATIONS,
  RESEARCHED_22_DESTINATIONS,
  EXPANSION_30_DESTINATIONS,
} from '../../db/destinations-data';

describe('Photography Intake, Licensing & Attribution System', () => {
  // ─── 1. License Validation Tests ───────────────────────────────────────
  describe('License & Provenance Validation Rules', () => {
    it('rejects image metadata when license is missing', () => {
      const result = photographyService.validateThirdPartyImage({
        imageUrl: 'https://upload.wikimedia.org/test.jpg',
        altText: 'Sample monument view',
        source: 'Wikimedia Commons',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Test.jpg',
        license: '',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing license.');
    });

    it('rejects incompatible or unknown licenses', () => {
      const result = photographyService.validateThirdPartyImage({
        imageUrl: 'https://upload.wikimedia.org/test.jpg',
        altText: 'Sample monument view',
        source: 'Wikimedia Commons',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Test.jpg',
        license: 'All Rights Reserved (Copyright 2024)',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Incompatible or unverified license'))).toBe(true);
    });

    it('accepts permitted open licenses from authoritative repositories', () => {
      const validLicenses = ['CC0', 'CC BY 4.0', 'CC BY-SA 4.0', 'Public Domain'];
      validLicenses.forEach((license) => {
        const result = photographyService.validateThirdPartyImage({
          imageUrl: 'https://upload.wikimedia.org/test.jpg',
          altText: 'Sample monument view',
          source: 'Wikimedia Commons',
          sourceUrl: 'https://commons.wikimedia.org/wiki/File:Test.jpg',
          license,
          attribution: 'Photo: Author • Source: Commons • License: ' + license,
        });
        expect(result.isValid).toBe(true);
      });
    });

    it('rejects images with missing or malformed source URL', () => {
      const resultMissing = photographyService.validateThirdPartyImage({
        imageUrl: 'https://upload.wikimedia.org/test.jpg',
        altText: 'Sample monument view',
        source: 'Wikimedia Commons',
        sourceUrl: '',
        license: 'CC BY-SA 4.0',
        attribution: 'Photo: Author • License: CC BY-SA 4.0',
      });
      expect(resultMissing.isValid).toBe(false);
      expect(resultMissing.errors).toContain('Missing source URL.');

      const resultMalformed = photographyService.validateThirdPartyImage({
        imageUrl: 'https://upload.wikimedia.org/test.jpg',
        altText: 'Sample monument view',
        source: 'Wikimedia Commons',
        sourceUrl: 'not-a-valid-url',
        license: 'CC BY-SA 4.0',
        attribution: 'Photo: Author • License: CC BY-SA 4.0',
      });
      expect(resultMalformed.isValid).toBe(false);
      expect(resultMalformed.errors).toContain('Invalid source URL format.');
    });

    it('allows photographer to be null only when source genuinely identifies no author', () => {
      const resultNullPhotographer = photographyService.validateThirdPartyImage({
        imageUrl: 'https://upload.wikimedia.org/test.jpg',
        altText: 'Ancient stone plinth',
        source: 'Archaeological Survey of India Digital Archive',
        sourceUrl: 'https://asi.nic.in/archive/file1',
        photographer: null,
        license: 'Public Domain',
      });
      expect(resultNullPhotographer.isValid).toBe(true);
    });

    it('rejects fake or dummy photographer placeholders like "Unknown Photographer"', () => {
      const resultDummy = photographyService.validateThirdPartyImage({
        imageUrl: 'https://upload.wikimedia.org/test.jpg',
        altText: 'Ancient stone plinth',
        source: 'Wikimedia Commons',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Test.jpg',
        photographer: 'Unknown Photographer',
        license: 'CC BY-SA 4.0',
        attribution: 'Photo: Unknown Photographer',
      });
      expect(resultDummy.isValid).toBe(false);
      expect(resultDummy.errors.some((e) => e.includes('placeholder like "Unknown Photographer"'))).toBe(true);
    });

    it('rejects missing attribution for attribution-required licenses', () => {
      const result = photographyService.validateThirdPartyImage({
        imageUrl: 'https://upload.wikimedia.org/test.jpg',
        altText: 'Sample monument view',
        source: 'Wikimedia Commons',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Test.jpg',
        license: 'CC BY-SA 4.0',
        attribution: '',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required attribution string for attribution-required license.');
    });

    it('forbids false attribution claiming "Photo: Hidden India" for third-party photography', () => {
      const result = photographyService.validateThirdPartyImage({
        imageUrl: 'https://upload.wikimedia.org/test.jpg',
        altText: 'Sample monument view',
        source: 'Wikimedia Commons',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Test.jpg',
        license: 'CC BY-SA 4.0',
        attribution: 'Photo: Hidden India • License: CC BY-SA 4.0',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cannot claim "Photo: Hidden India" for third-party licensed photography.');
    });
  });

  // ─── 2. Lifecycle Status Transitions ──────────────────────────────────
  describe('Photography Lifecycle Status Transitions', () => {
    it('allows valid standard transition from PENDING_PHOTOGRAPHY to PENDING_LICENSE_VERIFICATION', () => {
      const transition = photographyService.canTransitionStatus(
        'PENDING_PHOTOGRAPHY',
        'PENDING_LICENSE_VERIFICATION',
        {}
      );
      expect(transition.allowed).toBe(true);
    });

    it('allows transition from PENDING_LICENSE_VERIFICATION to VERIFIED_THIRD_PARTY when all provenance checks pass', () => {
      const validMetadata = {
        imageUrl: 'https://upload.wikimedia.org/test.jpg',
        altText: 'Historical facade',
        source: 'Wikimedia Commons',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Test.jpg',
        originalFileUrl: 'https://upload.wikimedia.org/test.jpg',
        license: 'CC BY-SA 4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
        attribution: 'Photo: Jane Doe • Source: Wikimedia Commons • License: CC BY-SA 4.0',
        photographer: 'Jane Doe',
      };

      const transition = photographyService.canTransitionStatus(
        'PENDING_LICENSE_VERIFICATION',
        'VERIFIED_THIRD_PARTY',
        validMetadata
      );
      expect(transition.allowed).toBe(true);
    });

    it('rejects direct transition from PENDING_PHOTOGRAPHY to VERIFIED_THIRD_PARTY without review step', () => {
      const validMetadata = {
        imageUrl: 'https://upload.wikimedia.org/test.jpg',
        altText: 'Historical facade',
        source: 'Wikimedia Commons',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Test.jpg',
        originalFileUrl: 'https://upload.wikimedia.org/test.jpg',
        license: 'CC BY-SA 4.0',
        attribution: 'Photo: Jane Doe • Source: Wikimedia Commons • License: CC BY-SA 4.0',
      };

      const transition = photographyService.canTransitionStatus(
        'PENDING_PHOTOGRAPHY',
        'VERIFIED_THIRD_PARTY',
        validMetadata
      );
      expect(transition.allowed).toBe(false);
      expect(transition.reason).toContain('without PENDING_LICENSE_VERIFICATION review step');
    });

    it('rejects transition to VERIFIED_THIRD_PARTY if metadata fails validation', () => {
      const invalidMetadata = {
        imageUrl: 'https://upload.wikimedia.org/test.jpg',
        altText: 'Historical facade',
        source: 'Wikimedia Commons',
        sourceUrl: '', // Missing
        license: 'CC BY-SA 4.0',
      };

      const transition = photographyService.canTransitionStatus(
        'PENDING_LICENSE_VERIFICATION',
        'VERIFIED_THIRD_PARTY',
        invalidMetadata
      );
      expect(transition.allowed).toBe(false);
      expect(transition.reason).toContain('validation failures');
    });

    it('allows transition to REJECTED from PENDING_LICENSE_VERIFICATION', () => {
      const transition = photographyService.canTransitionStatus(
        'PENDING_LICENSE_VERIFICATION',
        'REJECTED',
        {}
      );
      expect(transition.allowed).toBe(true);
    });
  });

  // ─── 3. Publication Protection & Research Gate ─────────────────────────
  describe('Publication Protection & Decoupled Gate', () => {
    it('verifies adding or verifying photography does NOT publish a draft destination', () => {
      // Check that all 31 expansion destinations remain draft regardless of image status
      EXPANSION_30_DESTINATIONS.forEach((dest) => {
        expect(dest.editorialStatus).toBe('draft');
      });
    });

    it('ensures Jyotisar Geeta Sthal remains in draft status and flagged for research', () => {
      const jyotisar = RESEARCHED_DESTINATIONS.find((d) => d.slug === 'jyotisar-kurukshetra');
      expect(jyotisar).toBeDefined();
      expect(jyotisar?.editorialStatus).toBe('draft');
      // Must maintain placeholder replacement requirement
      expect(jyotisar?.images[0].requiresEditorialReplacement).toBe(true);
    });

    it('ensures Phillaur Fort remains in draft status and flagged for civilian access research', () => {
      const phillaur = RESEARCHED_DESTINATIONS.find((d) => d.slug === 'phillaur-fort-ludhiana');
      expect(phillaur).toBeDefined();
      expect(phillaur?.editorialStatus).toBe('draft');
      expect(phillaur?.images[0].requiresEditorialReplacement).toBe(true);
    });

    it('ensures all 31 expansion candidate destinations remain excluded from sitemap', () => {
      const published = RESEARCHED_DESTINATIONS.filter((d) => d.editorialStatus === 'published');
      expect(published.length).toBe(22);

      const publishedSlugs = new Set(published.map((d) => d.slug));
      EXPANSION_30_DESTINATIONS.forEach((draft) => {
        expect(publishedSlugs.has(draft.slug)).toBe(false);
      });
    });
  });

  // ─── 4. Placeholder vs. Verified Replacement Behavior ──────────────────
  describe('Placeholder vs Verified Image Replacement Invariants', () => {
    it('verifies unverified destinations maintain requiresEditorialReplacement = true and verified images have false', () => {
      RESEARCHED_DESTINATIONS.forEach((dest) => {
        dest.images.forEach((img) => {
          if (img.editorialStatus === 'VERIFIED_THIRD_PARTY') {
            expect(img.requiresEditorialReplacement).toBe(false);
          } else {
            expect(img.requiresEditorialReplacement).toBe(true);
          }
        });
      });
    });

    it('correctly reports replacement readiness only when verified status and false flag are set', () => {
      expect(photographyService.isReadyForReplacement('VERIFIED_THIRD_PARTY', false)).toBe(true);
      expect(photographyService.isReadyForReplacement('VERIFIED_FIELD', false)).toBe(true);
      expect(photographyService.isReadyForReplacement('PENDING_LICENSE_VERIFICATION', true)).toBe(false);
      expect(photographyService.isReadyForReplacement('PENDING_PHOTOGRAPHY', true)).toBe(false);
      expect(photographyService.isReadyForReplacement('REJECTED', true)).toBe(false);
    });

    it('verifies the 18 priority destinations have both Hero and Detail image targets', () => {
      const PRIORITY_SLUGS = [
        'qutub-minar-delhi',
        'red-fort-delhi',
        'humayuns-tomb-delhi',
        'purana-qila-delhi',
        'agrasen-ki-baoli-delhi',
        'safdarjungs-tomb-delhi',
        'amber-fort-jaipur',
        'hawa-mahal-jaipur',
        'mehrangarh-fort-jodhpur',
        'jaisalmer-fort-rajasthan',
        'chittorgarh-fort-rajasthan',
        'kumbhalgarh-fort-rajasthan',
        'chand-baori-abhaneri',
        'rakhigarhi-archaeological-site-hisar',
        'pinjore-gardens-panchkula',
        'kangra-fort-himachal',
        'hidimba-devi-temple-manali',
        'golden-temple-amritsar',
      ];

      PRIORITY_SLUGS.forEach((slug) => {
        const dest = RESEARCHED_DESTINATIONS.find((d) => d.slug === slug);
        expect(dest, `Missing priority destination: ${slug}`).toBeDefined();
        expect(dest?.images.length, `Priority destination ${slug} must have at least 2 images`).toBeGreaterThanOrEqual(2);

        const hero = dest?.images.find((img) => img.role === 'hero');
        const detail = dest?.images.find((img) => img.role === 'detail');

        expect(hero, `Missing hero image for ${slug}`).toBeDefined();
        expect(detail, `Missing detail image for ${slug}`).toBeDefined();

        expect(['VERIFIED_THIRD_PARTY', 'PENDING_LICENSE_VERIFICATION']).toContain(hero?.editorialStatus);
        expect(['VERIFIED_THIRD_PARTY', 'PENDING_LICENSE_VERIFICATION']).toContain(detail?.editorialStatus);
        expect(hero?.sourceUrl).toMatch(/^https:\/\//);
        expect(detail?.sourceUrl).toMatch(/^https:\/\//);
      });
    });
  });

  // ─── 5. Existing Dataset Protection ───────────────────────────────────
  describe('Dataset Integrity & Core Preservation', () => {
    it('dataset contains exactly 53 total destinations', () => {
      expect(RESEARCHED_DESTINATIONS.length).toBe(53);
    });

    it('dataset contains exactly 22 published core destinations', () => {
      expect(RESEARCHED_22_DESTINATIONS.length).toBe(22);
      RESEARCHED_22_DESTINATIONS.forEach((d) => {
        expect(d.editorialStatus).toBe('published');
      });
    });

    it('dataset contains exactly 31 draft expansion destinations', () => {
      expect(EXPANSION_30_DESTINATIONS.length).toBe(31);
      EXPANSION_30_DESTINATIONS.forEach((d) => {
        expect(d.editorialStatus).toBe('draft');
      });
    });

    it('has zero duplicate slugs across all 53 destinations', () => {
      const slugs = RESEARCHED_DESTINATIONS.map((d) => d.slug);
      const unique = new Set(slugs);
      expect(unique.size).toBe(53);
    });
  });
});
