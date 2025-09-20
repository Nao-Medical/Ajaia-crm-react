import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  apiService,
  type DataSource,
  type EnhancedSearchResult,
  type Suggestion,
} from './apiService';

/** Query keys */
const suggestionKey = (source: DataSource, q: string) =>
  ['suggestions', source, q] as const;
const enhancedKey = (source: DataSource, q: string) =>
  ['enhancedSearch', source, q] as const;

/** Suggestions query (enabled flag controls when it runs) */
export function useSuggestions(source: DataSource, query: string, enabled = true) {
  return useQuery<Suggestion[]>({
    queryKey: suggestionKey(source, query),
    queryFn: ({ signal }) => apiService.getSuggestions(source, query, signal),
    enabled: enabled && query.length >= 2,
    staleTime: 30_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
  });
}

/** Optional: enhanced search as a *query* (you can keep your parent call if you prefer) */
export function useEnhancedQuery(source: DataSource, query: string, enabled = false) {
  return useQuery<EnhancedSearchResult>({
    queryKey: enhancedKey(source, query),
    queryFn: ({ signal }) => apiService.searchEnhanced(source, query, signal),
    enabled,
    staleTime: 0,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
  });
}

/** Helper to cancel in-flight suggestion queries for a source */
export function useCancelSuggestions() {
  const qc = useQueryClient();
  return (source: DataSource) => qc.cancelQueries({ queryKey: ['suggestions', source] });
}
