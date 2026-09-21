import { DifficultyLevelType, EvidenceClassificationType } from '../types/enums';

/**
 * Filter parameters for searching destinations.
 */
export interface DestinationSearchParams {
  query?: string;
  state?: string;
  district?: string;
  category?: string;
  historicalPeriod?: string;
  difficulty?: DifficultyLevelType;
  evidenceStatus?: EvidenceClassificationType;
  maxVisitDurationHours?: number;
  limit?: number;
  offset?: number;
}

/**
 * Normalized search result item.
 */
export interface DestinationSearchResult {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  state: string;
  district: string;
  category: string;
  historicalPeriod: string | null;
  difficulty: DifficultyLevelType;
  estimatedVisitDuration: string;
  evidenceStatus: EvidenceClassificationType;
  matchHighlights?: {
    field: string;
    matchedText: string;
  }[];
}

/**
 * Search response container.
 */
export interface SearchResponse<T> {
  results: T[];
  total: number;
  offset: number;
  limit: number;
  query: string;
}

/**
 * Search Provider Interface for future search backends (Postgres FTS, Meilisearch, etc.)
 */
export interface ISearchService {
  searchDestinations(
    params: DestinationSearchParams
  ): Promise<SearchResponse<DestinationSearchResult>>;
}
