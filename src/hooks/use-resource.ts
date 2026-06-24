"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiList, Pagination } from "@/lib/types";

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  [key: string]: string | number | undefined;
}

export function useResourceList<T>(resource: string, params: ListParams = {}) {
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== "" && v !== "all",
    ),
  );
  return useQuery<{ data: T[]; pagination: Pagination }>({
    queryKey: [resource, cleaned],
    queryFn: async () => {
      const { data } = await api.get<ApiList<T>>(`/${resource}`, {
        params: cleaned,
      });
      return { data: data.data, pagination: data.pagination };
    },
    placeholderData: keepPreviousData,
  });
}

export function useResourceItem<T>(resource: string, id?: string) {
  return useQuery<T>({
    queryKey: [resource, "item", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get(`/${resource}/${id}`);
      return data.data as T;
    },
  });
}

export function useResourceMutation(resource: string) {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: [resource] });

  const create = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post(`/${resource}`, payload);
      return data.data;
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Record<string, unknown>;
    }) => {
      const { data } = await api.patch(`/${resource}/${id}`, payload);
      return data.data;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/${resource}/${id}`);
      return data.data;
    },
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
