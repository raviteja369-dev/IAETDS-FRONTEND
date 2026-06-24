"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DashboardData } from "@/lib/types";

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ["analytics", "dashboard"],
    queryFn: async () => {
      const { data } = await api.get("/analytics/dashboard");
      return data.data;
    },
    refetchInterval: 20_000,
  });
}

export function usePerformance() {
  return useQuery({
    queryKey: ["analytics", "performance"],
    queryFn: async () => {
      const { data } = await api.get("/analytics/performance");
      return data.data;
    },
    refetchInterval: 15_000,
  });
}

export function useSecurityOverview() {
  return useQuery({
    queryKey: ["analytics", "security"],
    queryFn: async () => {
      const { data } = await api.get("/analytics/security");
      return data.data;
    },
    refetchInterval: 20_000,
  });
}
