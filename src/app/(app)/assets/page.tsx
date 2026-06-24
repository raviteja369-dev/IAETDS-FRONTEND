"use client";

import * as React from "react";
import { useResourceList } from "@/hooks/use-resource";
import type { Asset } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { Toolbar } from "@/components/shared/toolbar";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FormDialog } from "@/components/shared/form-dialog";
import { formatDate, titleCase } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuthStore } from "@/store/auth";
import { exportToCsv } from "@/lib/export";
import { toast } from "sonner";
import { Boxes, Download, Plus, Cpu, MapPin, Network, ShieldCheck } from "lucide-react";

const ASSET_FIELDS = [
  { name: "name", label: "Asset Name", required: true, placeholder: "e.g. srv-prod-01", colSpan: 2 as const },
  {
    name: "category",
    label: "Category",
    type: "select" as const,
    options: ["server", "network", "storage", "endpoint", "database", "application", "cloud", "security_appliance"].map((v) => ({ value: v, label: titleCase(v) })),
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: ["operational", "degraded", "maintenance", "offline", "retired"].map((v) => ({ value: v, label: titleCase(v) })),
  },
  {
    name: "criticality",
    label: "Criticality",
    type: "select" as const,
    options: ["critical", "high", "medium", "low"].map((v) => ({ value: v, label: titleCase(v) })),
    default: "medium",
  },
  {
    name: "environment",
    label: "Environment",
    type: "select" as const,
    options: ["production", "staging", "development", "dr"].map((v) => ({ value: v, label: titleCase(v) })),
  },
  { name: "manufacturer", label: "Manufacturer", placeholder: "e.g. Dell" },
  { name: "model", label: "Model", placeholder: "e.g. R760" },
  { name: "ipAddress", label: "IP Address", placeholder: "10.0.0.1" },
  { name: "location", label: "Location", placeholder: "Primary Datacenter" },
  { name: "os", label: "Operating System", placeholder: "Ubuntu 22.04 LTS", colSpan: 2 as const },
];

const FILTERS = [
  {
    key: "category",
    placeholder: "Category",
    options: [
      "server", "network", "storage", "endpoint", "database", "application", "cloud", "security_appliance",
    ].map((v) => ({ value: v, label: titleCase(v) })),
  },
  {
    key: "status",
    placeholder: "Status",
    options: ["operational", "degraded", "maintenance", "offline", "retired"].map((v) => ({ value: v, label: titleCase(v) })),
  },
  {
    key: "criticality",
    placeholder: "Criticality",
    options: ["critical", "high", "medium", "low"].map((v) => ({ value: v, label: titleCase(v) })),
  },
];

export default function AssetsPage() {
  const [search, setSearch] = React.useState("");
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Asset | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const can = useAuthStore((s) => s.can);

  const debounced = useDebounce(search, 300);
  const { data, isLoading } = useResourceList<Asset>("assets", {
    page,
    limit: 12,
    search: debounced,
    ...filters,
  });

  return (
    <div>
      <PageHeader
        title="Asset Management"
        description="Unified inventory and lifecycle management across your infrastructure estate."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (!data?.data.length) {
              toast.info("Nothing to export");
              return;
            }
            exportToCsv("iaetds-assets", data.data, [
              { key: "assetTag", label: "Asset Tag" },
              { key: "name", label: "Name" },
              { key: "category", label: "Category" },
              { key: "status", label: "Status" },
              { key: "criticality", label: "Criticality" },
              { key: "environment", label: "Environment" },
              { key: "ipAddress", label: "IP Address" },
              { key: "healthScore", label: "Health" },
              { key: "location", label: "Location" },
            ]);
            toast.success("Assets exported", { description: "CSV downloaded." });
          }}
        >
          <Download className="size-4" /> Export
        </Button>
        {can("assets:write") && (
          <Button variant="gradient" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Register Asset
          </Button>
        )}
      </PageHeader>

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Register Asset"
        description="Add a new asset to the inventory."
        resource="assets"
        submitLabel="Register Asset"
        successMessage="Asset registered"
        fields={ASSET_FIELDS}
        transform={(v) => ({
          ...v,
          assetTag: `AST-${Date.now().toString().slice(-6)}`,
          healthScore: 95,
        })}
      />

      <div className="rounded-xl border border-border bg-card shadow-soft">
        <div className="p-5 pb-0">
          <Toolbar
            search={search}
            onSearch={(v) => {
              setSearch(v);
              setPage(1);
            }}
            searchPlaceholder="Search by name, tag, IP, serial…"
            filters={FILTERS}
            values={filters}
            onFilterChange={(k, v) => {
              setFilters((f) => ({ ...f, [k]: v }));
              setPage(1);
            }}
          />
        </div>

        {isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : data && data.data.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Asset</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criticality</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead className="w-40">Health</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((a) => (
                  <TableRow
                    key={a._id}
                    className="cursor-pointer"
                    onClick={() => setSelected(a)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                          <Boxes className="size-4" />
                        </div>
                        <div>
                          <div className="font-medium">{a.name}</div>
                          <div className="font-mono text-xs text-muted-foreground">
                            {a.assetTag} · {a.ipAddress}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{titleCase(a.category)}</TableCell>
                    <TableCell>
                      <StatusBadge value={a.status} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={a.criticality} dot={false} />
                    </TableCell>
                    <TableCell className="text-sm capitalize">{a.environment}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={a.healthScore}
                          className="h-1.5"
                          indicatorClassName={
                            a.healthScore > 80
                              ? "bg-success"
                              : a.healthScore > 50
                                ? "bg-warning"
                                : "bg-destructive"
                          }
                        />
                        <span className="w-8 text-xs font-medium tabular-nums">
                          {a.healthScore}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {a.location}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination pagination={data.pagination} onPage={setPage} />
          </>
        ) : (
          <EmptyState
            icon={Boxes}
            title="No assets found"
            description="Try adjusting your search or filters."
          />
        )}
      </div>

      <AssetDetail asset={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function AssetDetail({
  asset,
  onClose,
}: {
  asset: Asset | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!asset} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        {asset && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Boxes className="size-5" />
                </div>
                <div>
                  <DialogTitle>{asset.name}</DialogTitle>
                  <DialogDescription className="font-mono">
                    {asset.assetTag}
                  </DialogDescription>
                </div>
                <div className="ml-auto flex gap-2">
                  <StatusBadge value={asset.status} />
                  <StatusBadge value={asset.criticality} dot={false} />
                </div>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Metric icon={Cpu} label="Manufacturer" value={`${asset.manufacturer} ${asset.model}`} />
              <Metric icon={Network} label="IP Address" value={asset.ipAddress} mono />
              <Metric icon={MapPin} label="Region" value={asset.region} />
              <Metric icon={ShieldCheck} label="OS" value={asset.os} />
              <Metric icon={Cpu} label="Serial" value={asset.serialNumber} mono />
              <Metric icon={MapPin} label="Location" value={asset.location} />
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">Health Score</span>
                <span className="font-semibold tabular-nums">{asset.healthScore}/100</span>
              </div>
              <Progress
                value={asset.healthScore}
                indicatorClassName={
                  asset.healthScore > 80 ? "bg-success" : asset.healthScore > 50 ? "bg-warning" : "bg-destructive"
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <KV label="Environment" value={titleCase(asset.environment)} />
              <KV label="Lifecycle" value={titleCase(asset.lifecycleStage)} />
              <KV label="Monthly Cost" value={`$${asset.costMonthly.toLocaleString()}`} />
              <KV label="Warranty" value={formatDate(asset.warrantyExpiry)} />
            </div>

            {asset.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {asset.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium uppercase text-secondary-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: any;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <div className={`mt-1 truncate text-sm font-medium ${mono ? "font-mono" : ""}`}>
        {value || "—"}
      </div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-medium">{value}</div>
    </div>
  );
}
