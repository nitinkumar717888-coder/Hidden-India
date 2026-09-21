import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { discoveryService } from '@/lib/services/discovery-service';
import { Container } from '@/components/common/Container';
import { DestinationCard } from '@/components/destination/DestinationCard';
import { EmptyState } from '@/components/common/EmptyState';
import { DifficultyLevelType } from '@/lib/types/enums';

interface SearchPageProps {
  searchParams: {
    q?: string;
    state?: string;
    category?: string;
    difficulty?: DifficultyLevelType;
    period?: string;
    page?: string;
  };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q ? `"${searchParams.q}"` : 'All Discoveries';
  return {
    title: `Search: ${query} — Hidden India`,
    description: 'Search India’s verified hidden forts, ancient ruins, and lesser-known historical sites.',
    robots: {
      index: false, // Prevent infinite search parameter indexing
      follow: true,
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q?.trim() || '';
  const state = searchParams.state?.trim() || '';
  const categorySlug = searchParams.category?.trim() || '';
  const difficulty = searchParams.difficulty;
  const historicalPeriod = searchParams.period?.trim() || '';
  const currentPage = parseInt(searchParams.page || '1', 10) || 1;
  const pageSize = 12;

  const [searchResult, allCategories] = await Promise.all([
    discoveryService.searchDestinations({
      query,
      state,
      categorySlug,
      difficulty,
      historicalPeriod,
      page: currentPage,
      pageSize,
    }),
    discoveryService.getAllCategories(),
  ]);

  const { items, totalCount, totalPages } = searchResult;

  // Build helper URL for pagination preserving all existing filters
  const buildPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (state) params.set('state', state);
    if (categorySlug) params.set('category', categorySlug);
    if (difficulty) params.set('difficulty', difficulty);
    if (historicalPeriod) params.set('period', historicalPeriod);
    params.set('page', pageNumber.toString());
    return `/search?${params.toString()}`;
  };

  return (
    <div className="search-discovery-page">
      {/* Search Header & Filter Bar */}
      <header className="search-hero-section section-subtle">
        <Container>
          <div className="search-header-content">
            <h1 className="text-h2">Search Published Discoveries</h1>
            <p className="text-small" style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
              Search verified forts, ruins, rock shelters, and shrines across Punjab, Haryana,
              Himachal Pradesh, Chandigarh, and Delhi.
            </p>

            {/* Primary Search Form */}
            <form action="/search" method="GET" className="search-page-form" role="search">
              <div className="search-bar search-bar-lg">
                <input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Search by destination name, era, town, or feature (e.g. fort, Kushan, Bathinda)..."
                  aria-label="Search query"
                  autoComplete="off"
                />
                <button type="submit" className="btn btn-primary" aria-label="Submit search">
                  Search
                </button>
              </div>

              {/* Granular Filters Grid */}
              <div className="search-filters-grid" style={{ marginTop: '1.25rem' }}>
                {/* State Filter */}
                <div className="filter-select-group">
                  <label htmlFor="state-select" className="filter-label">
                    State / Territory
                  </label>
                  <select
                    id="state-select"
                    name="state"
                    defaultValue={state}
                    className="input-text filter-select"
                  >
                    <option value="">All States</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                    <option value="Chandigarh">Chandigarh</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div className="filter-select-group">
                  <label htmlFor="category-select" className="filter-label">
                    Category
                  </label>
                  <select
                    id="category-select"
                    name="category"
                    defaultValue={categorySlug}
                    className="input-text filter-select"
                  >
                    <option value="">All Categories</option>
                    {allCategories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div className="filter-select-group">
                  <label htmlFor="difficulty-select" className="filter-label">
                    Terrain Difficulty
                  </label>
                  <select
                    id="difficulty-select"
                    name="difficulty"
                    defaultValue={difficulty || ''}
                    className="input-text filter-select"
                  >
                    <option value="">Any Difficulty</option>
                    <option value="easy">Easy (Flat / Paved)</option>
                    <option value="moderate">Moderate (Incline / Steps)</option>
                    <option value="challenging">Challenging (Rough / Trail)</option>
                    <option value="strenuous">Strenuous (Long Hike)</option>
                  </select>
                </div>

                {/* Submit & Reset actions */}
                <div className="filter-actions-group">
                  <button type="submit" className="btn btn-secondary btn-sm">
                    Apply Filters
                  </button>
                  {(query || state || categorySlug || difficulty || historicalPeriod) && (
                    <Link href="/search" className="btn btn-ghost btn-sm">
                      Clear Filters
                    </Link>
                  )}
                </div>
              </div>
            </form>
          </div>
        </Container>
      </header>

      {/* Results Section */}
      <main className="search-results-section">
        <Container>
          {/* Results Summary Bar */}
          <div className="results-summary-bar">
            <p className="results-count-text">
              Showing <strong>{items.length}</strong> of <strong>{totalCount}</strong> published{' '}
              {totalCount === 1 ? 'discovery' : 'discoveries'}
              {query && <span> for &ldquo;{query}&rdquo;</span>}
              {state && <span> in {state}</span>}
              {categorySlug && (
                <span> in category &ldquo;{allCategories.find((c) => c.slug === categorySlug)?.name || categorySlug}&rdquo;</span>
              )}
            </p>

            <Link href="/map" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>🗺️ Explore on Map</span>
            </Link>
          </div>

          {/* Results Grid or Empty State */}
          {items.length === 0 ? (
            <EmptyState
              title="No published discoveries matched your search"
              description="Try adjusting your keyword query, clearing state filters, or browsing our standardized categories. Only independently verified records are published."
              action={
                <Link href="/search" className="btn btn-secondary">
                  Reset Search &rarr;
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 grid-cols-2-sm grid-cols-3 gap-6" style={{ marginTop: '1.5rem' }}>
              {items.map(({ destination, categories, primaryImage }) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  categories={categories}
                  primaryImage={primaryImage}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <nav className="pagination-bar" aria-label="Search Results Pagination">
              {currentPage > 1 ? (
                <Link href={buildPageUrl(currentPage - 1)} className="btn btn-secondary btn-sm">
                  &larr; Previous Page
                </Link>
              ) : (
                <span className="btn btn-secondary btn-sm disabled">&larr; Previous</span>
              )}

              <span className="pagination-page-indicator text-small">
                Page {currentPage} of {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link href={buildPageUrl(currentPage + 1)} className="btn btn-secondary btn-sm">
                  Next Page &rarr;
                </Link>
              ) : (
                <span className="btn btn-secondary btn-sm disabled">Next &rarr;</span>
              )}
            </nav>
          )}
        </Container>
      </main>
    </div>
  );
}
