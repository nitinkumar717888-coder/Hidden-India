import {
  DestinationSearchParams,
  DestinationSearchResult,
  ISearchService,
  SearchResponse,
} from './types';
import { db } from '../db';

/**
 * Baseline Search Service implementation.
 * Connects to PostgreSQL full-text / ILIKE queries, with fallback when DB is disconnected.
 */
export class SearchService implements ISearchService {
  async searchDestinations(
    params: DestinationSearchParams
  ): Promise<SearchResponse<DestinationSearchResult>> {
    const query = params.query?.trim() || '';
    const limit = params.limit ?? 20;
    const offset = params.offset ?? 0;

    // When the database connection is not yet configured or during initial setup,
    // gracefully return an empty result structure.
    if (!db) {
      return {
        results: [],
        total: 0,
        offset,
        limit,
        query,
      };
    }

    // Phase 2 will plug in compiled Drizzle ILIKE / tsvector queries here
    return {
      results: [],
      total: 0,
      offset,
      limit,
      query,
    };
  }
}

export const searchService = new SearchService();
