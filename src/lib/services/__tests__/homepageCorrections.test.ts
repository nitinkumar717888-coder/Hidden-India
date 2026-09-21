import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { RESEARCHED_DESTINATIONS } from '../../db/destinations-data';

describe('Homepage Targeted Corrections Verification', () => {
  const homePagePath = path.resolve(process.cwd(), 'src/app/page.tsx');
  const footerPath = path.resolve(process.cwd(), 'src/components/common/Footer.tsx');
  const homePageContent = fs.readFileSync(homePagePath, 'utf-8');
  const footerContent = fs.readFileSync(footerPath, 'utf-8');

  it('1. Research / verification claim matches the exact editorial requirement', () => {
    expect(footerContent).toContain(
      'Destinations are researched using archaeological, academic, government, archival, and other documented sources, with evidence and local traditions clearly distinguished.'
    );
    expect(footerContent).not.toContain(
      'Every destination is independently researched and verified against archaeological, academic, and government records.'
    );
  });

  it('2. Hero supporting copy accurately reflects research + discovery + planning', () => {
    expect(homePageContent).toContain('Discover India&apos;s Hidden Places');
    expect(homePageContent).toContain(
      'Forgotten forts, ancient ruins, unusual places and lost stories — researched, mapped, and ready to explore.'
    );
    expect(homePageContent).not.toContain('Hidden waterfalls.');
  });

  it('3. Deduplication logic is present for Featured vs Latest discoveries', () => {
    // Verifies that latest discoveries exclude featured destinations
    expect(homePageContent).toContain('discoveryService.getLatestDestinations(6, featuredIds)');
    expect(homePageContent).toContain(
      '.filter((d) => !featuredIds.includes(d.destination.id))'
    );
  });

  it('4. Trip calculation is explicitly labeled as an Illustrative Trip Calculation with a real published destination', () => {
    expect(homePageContent).toContain('Illustrative Trip Calculation');
    expect(homePageContent).toContain('Illustrative Example');
    expect(homePageContent).toContain('Chandigarh &rarr; Kalesar Colonial Red Iron Bridge');
    expect(homePageContent).toContain('~244 km (illustrative example)');
    expect(homePageContent).toContain('Illustrative Total Estimate');
    expect(homePageContent).toContain('*Illustrative example for demonstration only');

    // Verify Kalesar Colonial Red Iron Bridge is a real published destination in the database catalog
    const kalesar = RESEARCHED_DESTINATIONS.find((d) => d.slug === 'kalesar-iron-suspension-bridge');
    expect(kalesar).toBeDefined();
    expect(kalesar?.editorialStatus).toBe('published');
    expect(kalesar?.name).toBe('Kalesar Colonial Red Iron Bridge');
  });

  it('5. Core positioning DISCOVER -> PLAN -> CALCULATE -> NAVIGATE is preserved', () => {
    expect(homePageContent).toContain(
      'DISCOVER &rarr; PLAN &rarr; CALCULATE &rarr; NAVIGATE'
    );
    expect(homePageContent).toContain('Practical Road Trip Engine');
    expect(homePageContent).toContain('Answer Every Question Before You Travel');
  });
});
