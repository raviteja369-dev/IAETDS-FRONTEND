"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useResourceList } from "@/hooks/use-resource";
import { useDebounce } from "@/hooks/use-debounce";
import type { Report } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { Toolbar } from "@/components/shared/toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FormDialog } from "@/components/shared/form-dialog";
import { exportToCsv } from "@/lib/export";
import { formatDate, titleCase } from "@/lib/utils";
import {
  FileBarChart,
  Download,
  ShieldCheck,
  Boxes,
  Activity,
  FileCheck,
  Siren,
  Wrench,
  Plus,
} from "lucide-react";

const REPORT_FIELDS = [
  { name: "name", label: "Report Name", required: true, placeholder: "e.g. Monthly Security Posture", colSpan: 2 as const },
  {
    name: "type",
    label: "Type",
    type: "select" as const,
    options: ["security", "asset", "performance", "compliance", "incident", "maintenance"].map((v) => ({ value: v, label: titleCase(v) })),
  },
  {
    name: "format",
    label: "Format",
    type: "select" as const,
    options: ["pdf", "csv", "xlsx", "json"].map((v) => ({ value: v, label: v.toUpperCase() })),
    default: "pdf",
  },
  {
    name: "period",
    label: "Period",
    type: "select" as const,
    options: ["Last 30 days", "Last 90 days", "Q2 2026", "June 2026"].map((v) => ({ value: v, label: v })),
  },
  { name: "framework", label: "Framework (optional)", placeholder: "SOC 2 / GDPR / PCI-DSS" },
  { name: "scopedAsset", label: "Scope to Asset (optional)", type: "asset" as const },
  { name: "description", label: "Description", type: "textarea" as const, placeholder: "What does this report cover?" },
];

const TYPE_META: Record<string, { icon: any; accent: string }> = {
  security: { icon: ShieldCheck, accent: "#ef4444" },
  asset: { icon: Boxes, accent: "#6366f1" },
  performance: { icon: Activity, accent: "#10b981" },
  compliance: { icon: FileCheck, accent: "#0ea5e9" },
  incident: { icon: Siren, accent: "#f59e0b" },
  maintenance: { icon: Wrench, accent: "#a855f7" },
};

const FILTERS = [
  {
    key: "type",
    placeholder: "Type",
    options: ["security", "asset", "performance", "compliance", "incident", "maintenance"].map((v) => ({ value: v, label: titleCase(v) })),
  },
];

export default function ReportsPage() {
  const [search, setSearch] = React.useState("");
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [createOpen, setCreateOpen] = React.useState(false);
  const debounced = useDebounce(search);

  const { data, isLoading } = useResourceList<Report>("reports", {
    limit: 50,
    search: debounced,
    ...filters,
  });

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        description="Generate, schedule, and export compliance, security, and operational reports."
      >
        <Button variant="gradient" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" /> Generate Report
        </Button>
      </PageHeader>

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Generate Report"
        description="Create a new report entry for export and audit."
        resource="reports"
        submitLabel="Generate"
        successMessage="Report generated"
        fields={REPORT_FIELDS}
        transform={(v, { assets }) => {
          const { scopedAsset, ...rest } = v;
          return {
            ...rest,
            relatedAssets: assets.scopedAsset ? [assets.scopedAsset._id] : [],
            reportId: `RPT-${Date.now().toString().slice(-6)}`,
            status: "generated",
            fileSize: `${(Math.random() * 4 + 0.6).toFixed(1)} MB`,
          };
        }}
      />

      <Toolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search reports…"
        filters={FILTERS}
        values={filters}
        onFilterChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((r, i) => {
            const meta = TYPE_META[r.type] ?? TYPE_META.asset;
            return (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group flex flex-col rounded-xl border border-border bg-card p-5 shadow-soft transition-all hover:shadow-elevated"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="grid size-11 place-items-center rounded-xl"
                    style={{ backgroundColor: `${meta.accent}1a`, color: meta.accent }}
                  >
                    <meta.icon className="size-5" />
                  </div>
                  <StatusBadge value={r.status} />
                </div>

                <h3 className="mt-4 font-semibold tracking-tight">{r.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {r.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>{r.period}</span>
                  {r.framework && (
                    <span className="font-medium text-foreground">{r.framework}</span>
                  )}
                  <span className="uppercase">{r.format}</span>
                  <span>{r.fileSize}</span>
                  {r.relatedAssets && r.relatedAssets.length > 0 && (
                    <span className="inline-flex items-center gap-1 font-medium text-primary">
                      <Boxes className="size-3" /> {r.relatedAssets.length} asset
                      {r.relatedAssets.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {typeof r.score === "number" && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${r.score}%`,
                          backgroundColor: r.score > 85 ? "#10b981" : r.score > 70 ? "#f59e0b" : "#ef4444",
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold tabular-nums">{r.score}%</span>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(r.createdAt)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      exportToCsv(`${r.reportId}-${r.name}`.replace(/\s+/g, "-"), [
                        {
                          reportId: r.reportId,
                          name: r.name,
                          type: r.type,
                          framework: r.framework ?? "",
                          period: r.period,
                          score: r.score ?? "",
                          status: r.status,
                          generatedBy: r.generatedByName ?? "",
                          generatedAt: r.createdAt ?? "",
                        },
                      ]);
                      toast.success("Report exported", {
                        description: `${r.name} downloaded.`,
                      });
                    }}
                  >
                    <Download className="size-4" /> Export
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={FileBarChart} title="No reports found" />
      )}
    </div>
  );
}
