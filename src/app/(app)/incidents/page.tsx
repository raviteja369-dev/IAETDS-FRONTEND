"use client";

import * as React from "react";
import { useResourceList } from "@/hooks/use-resource";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuthStore } from "@/store/auth";
import type { Incident } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { Toolbar } from "@/components/shared/toolbar";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { formatDateTime, timeAgo, titleCase } from "@/lib/utils";
import { Siren, Plus, ArrowUpRight, Clock, User, Boxes } from "lucide-react";

const INCIDENT_FIELDS = [
  { name: "title", label: "Title", required: true, placeholder: "Short incident summary", colSpan: 2 as const },
  {
    name: "severity",
    label: "Severity",
    type: "select" as const,
    options: ["sev1", "sev2", "sev3", "sev4"].map((v) => ({ value: v, label: v.toUpperCase() })),
    default: "sev3",
  },
  {
    name: "priority",
    label: "Priority",
    type: "select" as const,
    options: ["critical", "high", "medium", "low"].map((v) => ({ value: v, label: titleCase(v) })),
    default: "high",
  },
  {
    name: "category",
    label: "Category",
    type: "select" as const,
    options: ["security", "infrastructure", "application", "network", "database"].map((v) => ({ value: v, label: titleCase(v) })),
    default: "infrastructure",
  },
  {
    name: "impact",
    label: "Impact",
    type: "select" as const,
    options: [
      { value: "site_down", label: "Site Down" },
      { value: "major_degradation", label: "Major Degradation" },
      { value: "partial", label: "Partial" },
      { value: "minor", label: "Minor" },
    ],
    default: "partial",
  },
  { name: "commanderName", label: "Incident Commander", placeholder: "Assigned lead", colSpan: 2 as const },
  { name: "summary", label: "Summary", type: "textarea" as const, placeholder: "What is happening and what's affected?" },
];

const FILTERS = [
  {
    key: "severity",
    placeholder: "Severity",
    options: ["sev1", "sev2", "sev3", "sev4"].map((v) => ({ value: v, label: v.toUpperCase() })),
  },
  {
    key: "status",
    placeholder: "Status",
    options: ["detected", "investigating", "identified", "monitoring", "resolved"].map((v) => ({ value: v, label: titleCase(v) })),
  },
  {
    key: "category",
    placeholder: "Category",
    options: ["security", "infrastructure", "application", "network", "database"].map((v) => ({ value: v, label: titleCase(v) })),
  },
];

export default function IncidentsPage() {
  const can = useAuthStore((s) => s.can);
  const [search, setSearch] = React.useState("");
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Incident | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const debounced = useDebounce(search);

  const { data, isLoading } = useResourceList<Incident>("incidents", {
    page,
    limit: 12,
    search: debounced,
    ...filters,
  });

  return (
    <div>
      <PageHeader
        title="Incident Management"
        description="Full incident lifecycle — detection, escalation, resolution, and root cause."
      >
        {can("incidents:write") && (
          <Button variant="gradient" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Declare Incident
          </Button>
        )}
      </PageHeader>

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Declare Incident"
        description="Open a new incident and engage the response process."
        resource="incidents"
        submitLabel="Declare Incident"
        successMessage="Incident declared"
        fields={INCIDENT_FIELDS}
        transform={(v) => ({
          ...v,
          incidentId: `INC-${Date.now().toString().slice(-6)}`,
          status: "detected",
          detectedAt: new Date().toISOString(),
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
            searchPlaceholder="Search incidents…"
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
                  <TableHead>Incident</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Commander</TableHead>
                  <TableHead>Detected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((inc) => (
                  <TableRow
                    key={inc._id}
                    className="cursor-pointer"
                    onClick={() => setSelected(inc)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-lg bg-destructive/10 text-destructive">
                          <Siren className="size-4" />
                        </div>
                        <div>
                          <div className="font-medium">{inc.title}</div>
                          <div className="font-mono text-xs text-muted-foreground">
                            {inc.incidentId} · {titleCase(inc.category)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={inc.severity} label={inc.severity.toUpperCase()} dot={false} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={inc.priority} dot={false} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={inc.status} />
                    </TableCell>
                    <TableCell className="text-sm">{inc.commanderName ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {timeAgo(inc.detectedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination pagination={data.pagination} onPage={setPage} />
          </>
        ) : (
          <EmptyState icon={Siren} title="No incidents found" description="Adjust filters or declare a new incident." />
        )}
      </div>

      <IncidentDetail incident={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function IncidentDetail({
  incident,
  onClose,
}: {
  incident: Incident | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!incident} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        {incident && (
          <>
            <DialogHeader>
              <div className="flex items-start gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-destructive/10 text-destructive">
                  <Siren className="size-5" />
                </div>
                <div className="flex-1">
                  <DialogTitle>{incident.title}</DialogTitle>
                  <DialogDescription className="font-mono">
                    {incident.incidentId}
                  </DialogDescription>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <StatusBadge value={incident.severity} label={incident.severity.toUpperCase()} dot={false} />
                  <StatusBadge value={incident.status} />
                </div>
              </div>
            </DialogHeader>

            <p className="text-sm text-muted-foreground">{incident.summary}</p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <KV icon={User} label="Commander" value={incident.commanderName ?? "—"} />
              <KV icon={Boxes} label="Impact" value={titleCase(incident.impact)} />
              <KV icon={ArrowUpRight} label="Escalation" value={`L${incident.escalationLevel}`} />
              <KV icon={Clock} label="Detected" value={formatDateTime(incident.detectedAt)} />
            </div>

            {incident.affectedServices?.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Affected Services
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {incident.affectedServices.map((s) => (
                    <span key={s} className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {incident.rootCause && (
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground">Root Cause</p>
                <p className="mt-1 text-sm">{incident.rootCause}</p>
              </div>
            )}

            {incident.timeline && incident.timeline.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-medium text-muted-foreground">Timeline</p>
                <ol className="relative space-y-4 border-l border-border pl-5">
                  {incident.timeline.map((t, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[1.45rem] top-1 size-2.5 rounded-full bg-primary ring-4 ring-card" />
                      <div className="flex items-center gap-2">
                        <StatusBadge value={t.status} dot={false} />
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(t.at)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm">{t.note}</p>
                      <p className="text-xs text-muted-foreground">— {t.actorName}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function KV({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <div className="mt-1 truncate text-sm font-medium">{value}</div>
    </div>
  );
}
