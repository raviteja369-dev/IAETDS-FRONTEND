"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";

export type SearchResultType =
  | "asset"
  | "incident"
  | "maintenance"
  | "user"
  | "report";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  href: string;
  label: string;
  identifier: string;
  subtitle: string;
  meta?: string;
}

interface SearchResponse {
  success: boolean;
  data: SearchResult[];
  meta: { query: string; total: number };
}

/**
 * Live global search backed by the `/search` endpoint. Debounces the raw
 * input so results stream in as the user types without flooding the API.
 */
export function useGlobalSearch(query: string) {
  const debounced = useDebounce(query.trim(), 200);
  const enabled = debounced.length >= 1;

  const result = useQuery<SearchResult[]>({
    queryKey: ["global-search", debounced],
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    queryFn: async () => {
      const { data } = await api.get<SearchResponse>("/search", {
        params: { q: debounced, limit: 6 },
      });
      return data.data;
    },
  });

  return {
    results: enabled ? result.data ?? [] : [],
    isLoading: enabled && result.isFetching && !result.data,
    isFetching: result.isFetching,
    hasQuery: enabled,
  };
}
