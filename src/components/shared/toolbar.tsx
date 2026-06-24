"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterDef {
  key: string;
  placeholder: string;
  options: { value: string; label: string }[];
}

export function Toolbar({
  search,
  onSearch,
  searchPlaceholder = "Search…",
  filters = [],
  values,
  onFilterChange,
  children,
}: {
  search: string;
  onSearch: (v: string) => void;
  searchPlaceholder?: string;
  filters?: FilterDef[];
  values?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-9 pl-9"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <Select
            key={f.key}
            value={values?.[f.key] ?? "all"}
            onValueChange={(v) => onFilterChange?.(f.key, v)}
          >
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue placeholder={f.placeholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{f.placeholder}</SelectItem>
              {f.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>
      {children && <div className="sm:ml-auto flex items-center gap-2">{children}</div>}
    </div>
  );
}
