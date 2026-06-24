"use client";

import * as React from "react";
import { Command } from "cmdk";
import { Check, ChevronsUpDown, Boxes, Search, Loader2 } from "lucide-react";
import { cn, titleCase } from "@/lib/utils";
import { toneClass } from "@/lib/status";
import { useAssetOptions } from "@/hooks/use-assets";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { AssetRef } from "@/lib/types";

export function AssetSelect({
  value,
  onChange,
  placeholder = "Select an asset from the registry…",
}: {
  value?: string | null;
  onChange: (asset: AssetRef | null) => void;
  placeholder?: string;
}) {
  const { data: assets = [], isLoading } = useAssetOptions();
  const [open, setOpen] = React.useState(false);
  const selected = assets.find((a) => a._id === value) || null;

  return (
    <div className="space-y-2.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-sm shadow-soft transition-colors hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <span className="flex items-center gap-2 truncate">
              <Boxes className="size-4 shrink-0 text-muted-foreground" />
              {selected ? (
                <span className="truncate">
                  <span className="font-mono text-xs text-muted-foreground">
                    {selected.assetTag}
                  </span>{" "}
                  · {selected.name}
                </span>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </span>
            {isLoading ? (
              <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
            ) : (
              <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[18rem]">
          <Command
            filter={(value, search) =>
              value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
            }
          >
            <div className="flex items-center gap-2 border-b border-border px-3">
              <Search className="size-4 text-muted-foreground" />
              <Command.Input
                placeholder="Search assets…"
                className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Command.List className="max-h-64 overflow-y-auto scrollbar-thin p-1">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                No assets found.
              </Command.Empty>
              {assets.map((a) => (
                <Command.Item
                  key={a._id}
                  value={`${a.assetTag} ${a.name} ${a.ipAddress} ${a.category}`}
                  onSelect={() => {
                    onChange(a._id === value ? null : a);
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <Check
                    className={cn(
                      "size-4 shrink-0",
                      value === a._id ? "opacity-100 text-primary" : "opacity-0",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{a.name}</div>
                    <div className="truncate font-mono text-[11px] text-muted-foreground">
                      {a.assetTag} · {titleCase(a.category)} · {a.ipAddress}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "rounded border px-1.5 py-0.5 text-[10px] font-medium capitalize",
                      toneClass(a.criticality),
                    )}
                  >
                    {a.criticality}
                  </span>
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </PopoverContent>
      </Popover>

      {selected && <AssetDetailCard asset={selected} />}
    </div>
  );
}

function AssetDetailCard({ asset }: { asset: AssetRef }) {
  const rows: { label: string; value: string; mono?: boolean }[] = [
    { label: "Asset Name", value: asset.name },
    { label: "Category", value: titleCase(asset.category) },
    { label: "Criticality", value: titleCase(asset.criticality) },
    { label: "Environment", value: titleCase(asset.environment) },
    { label: "IP Address", value: asset.ipAddress || "—", mono: true },
    { label: "Location", value: asset.location || "—" },
    { label: "Operating System", value: asset.os || "—" },
  ];
  return (
    <div className="animate-fade-in rounded-lg border border-border bg-muted/30 p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-md bg-primary/10 text-primary">
          <Boxes className="size-3.5" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Linked Asset · {asset.assetTag}
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-col">
            <dt className="text-muted-foreground">{r.label}</dt>
            <dd className={cn("font-medium", r.mono && "font-mono")}>{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
