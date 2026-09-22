import { describe, it, expect } from 'vitest';
import { RESEARCHED_DESTINATIONS, RESEARCHED_20_DESTINATIONS } from '../../db/destinations-data';

describe('Phase 5.5 Final Corrections Data Verification', () => {
  it('exports both RESEARCHED_DESTINATIONS and backward-compatible RESEARCHED_20_DESTINATIONS', () => {
    expect(RESEARCHED_DESTINATIONS).toBeDefined();
    expect(RESEARCHED_20_DESTINATIONS).toBeDefined();
    expect(RESEARCHED_DESTINATIONS.length).toBeGreaterThanOrEqual(52);
    expect(RESEARCHED_20_DESTINATIONS.length).toBe(22);
  });

  it('verifies old combined slugs no longer exist in the published catalog', () => {
    const slugs = RESEARCHED_DESTINATIONS.map((d) => d.slug);
    expect(slugs).not.toContain('jal-mahal-chor-gumbad-narnaul');
    expect(slugs).not.toContain('kalesar-colonial-bridge-dak-bungalow');
    expect(slugs).not.toContain('bassi-baoli-pinjore-stepwells');
  });

  it('verifies Jal Mahal & Chor Gumbad split into two distinct destinations with exact coordinates', () => {
    const jalMahal = RESEARCHED_DESTINATIONS.find((d) => d.slug === 'jal-mahal-narnaul');
    const chorGumbad = RESEARCHED_DESTINATIONS.find((d) => d.slug === 'chor-gumbad-narnaul');

    expect(jalMahal).toBeDefined();
    expect(chorGumbad).toBeDefined();

    // Verify names
    expect(jalMahal?.name).toBe('Jal Mahal, Narnaul');
    expect(chorGumbad?.name).toBe('Chor Gumbad, Narnaul');

    // Verify exact coordinates specified by user
    expect(jalMahal?.latitude).toBeCloseTo(28.0467, 4);
    expect(jalMahal?.longitude).toBeCloseTo(76.1089, 4);
    expect(chorGumbad?.latitude).toBeCloseTo(28.0645, 4);
    expect(chorGumbad?.longitude).toBeCloseTo(76.1152, 4);

    // Verify distinct visit info and evidence
    expect(jalMahal?.evidenceItems[0].sectionTitle).toContain('Shah Quli Khan');
    expect(chorGumbad?.evidenceItems[0].sectionTitle).toContain('Fourteenth-Century Afghan Masonry');
  });

  it('verifies Kalesar Bridge and Dak Bungalow split into two distinct destinations', () => {
    const bridge = RESEARCHED_DESTINATIONS.find((d) => d.slug === 'kalesar-iron-suspension-bridge');
    const bungalow = RESEARCHED_DESTINATIONS.find((d) => d.slug === 'kalesar-forest-dak-bungalow');

    expect(bridge).toBeDefined();
    expect(bungalow).toBeDefined();

    // Verify names
    expect(bridge?.name).toBe('Kalesar Colonial Red Iron Bridge');
    expect(bungalow?.name).toBe('Kalesar Forest Dak Bungalow');

    // Verify coordinates
    expect(bridge?.latitude).toBeCloseTo(30.3472, 4);
    expect(bridge?.longitude).toBeCloseTo(77.5806, 4);
    expect(bungalow?.latitude).toBeCloseTo(30.3425, 4);
    expect(bungalow?.longitude).toBeCloseTo(77.5750, 4);

    // Verify visitInfo segregation
    expect(bridge?.visitInfo.feeType).toBe('free');
    expect(bungalow?.visitInfo.feeType).toBe('permit_required');
  });

  it('verifies Bassi Baoli rename and slug update', () => {
    const bassi = RESEARCHED_DESTINATIONS.find((d) => d.slug === 'bassi-baoli-pinjore');
    expect(bassi).toBeDefined();
    expect(bassi?.name).toBe('Bassi Baoli (Pinjore Stepwell)');
    expect(bassi?.latitude).toBeCloseTo(30.8250, 4);
    expect(bassi?.longitude).toBeCloseTo(76.9389, 4);
  });

  it('verifies Gondhla entry fee wording clarifies uncertainty and is not marked as verified fixed fee', () => {
    const gondhla = RESEARCHED_DESTINATIONS.find((d) => d.slug === 'gondhla-tower-fort-lahaul');
    expect(gondhla).toBeDefined();
    expect(gondhla?.visitInfo.entryFee).toContain(
      'An informal preservation fee may be collected on-site by the caretaker family; amount and availability may vary.'
    );
    expect(gondhla?.visitInfo.isFeeVerified).toBe(false);
    expect(gondhla?.visitInfo.feeType).toBe('discretionary');
  });

  it('verifies all images are flagged for editorial replacement with honest attribution in core catalog', () => {
    for (const dest of RESEARCHED_20_DESTINATIONS) {
      expect(dest.images.length).toBeGreaterThan(0);
      for (const img of dest.images) {
        expect(img.requiresEditorialReplacement).toBe(true);
        expect(img.credit).toContain('Unsplash (Representative Stock');
        expect(img.caption).toContain('Flagged for editorial field photography replacement');
      }
    }
  });

  it('verifies all destinations retain valid categories, sources, and visit information', () => {
    for (const dest of RESEARCHED_DESTINATIONS) {
      expect(dest.categorySlugs.length).toBeGreaterThan(0);
      expect(dest.sources.length).toBeGreaterThan(0);
      expect(dest.visitInfo).toBeDefined();
    }
    for (const dest of RESEARCHED_20_DESTINATIONS) {
      expect(dest.editorialStatus).toBe('published');
    }
  });
});
