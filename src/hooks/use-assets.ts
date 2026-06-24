"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AssetRef } from "@/lib/types";

/** Fetches the centralized Asset Registry feed used by all module pickers. */
export function useAssetOptions() {
  return useQuery<AssetRef[]>({
    queryKey: ["assets", "registry-options"],
    queryFn: async () => {
      const { data } = await api.get("/assets/options");
      return data.data as AssetRef[];
    },
    staleTime: 60_000,
  });
}
