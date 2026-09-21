import React from 'react';
import type { Metadata } from 'next';
import { Container } from '@/components/common/Container';
import { getCurrentUser } from '@/lib/supabase/server';
import { savedDestinationService } from '@/lib/services/saved-destination-service';
import { SavedDestinationsClient } from '@/components/saved/SavedDestinationsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Hidden India — Saved Discoveries',
  description: 'Your personal collection of saved places, forgotten monuments, and travel notes.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SavedPage() {
  const authUser = await getCurrentUser();
  let savedItems: any[] = [];

  if (authUser) {
    const rawItems = await savedDestinationService.getUserSavedDestinations(authUser.id);
    savedItems = rawItems.map((item) => ({
      savedAt: item.savedAt.toISOString(),
      destination: {
        id: item.destination.id,
        name: item.destination.name,
        slug: item.destination.slug,
        state: item.destination.state,
        district: item.destination.district,
        locality: item.destination.locality,
        shortDescription: item.destination.shortDescription,
        evidenceClassification: item.destination.evidenceClassification,
        difficulty: item.destination.difficulty,
      },
      primaryImage: item.primaryImage
        ? {
            imageUrl: item.primaryImage.imageUrl,
            altText: item.primaryImage.altText,
          }
        : null,
      categories: item.categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      })),
    }));
  }

  return (
    <main className="saved-page-main">
      <Container size="normal">
        <header className="page-header" style={{ marginBottom: '2rem' }}>
          <span className="text-eyebrow">Personal Exploration Notebook</span>
          <h1 className="text-h1">My Hidden India</h1>
          <p className="text-lead" style={{ marginTop: '0.5rem' }}>
            Curated discoveries, historical monuments, and quiet field sanctuaries you want to visit.
          </p>
        </header>

        <SavedDestinationsClient
          initialItems={savedItems}
          isAuthenticated={!!authUser}
        />
      </Container>
    </main>
  );
}
