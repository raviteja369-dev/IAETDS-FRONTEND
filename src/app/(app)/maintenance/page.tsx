"use client";

import * as React from "react";
import { useResourceList } from "@/hooks/use-resource";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuthStore } from "@/store/auth";
import type { MaintenanceTask } from "@/lib/types";
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
import { FormDialog } from "@/components/shared/form-dialog";
import { formatDate, titleCase } from "@/lib/utils";
import { Wrench, Plus, CalendarClock, CircleCheck, Hammer, AlertTriangle } from "lucide-react";

const WO_FIELDS = [
  { name: "title", label: "Title", required: true, placeholder: "e.g. Quarterly firmware update", colSpan: 2 as const },
  {
    name: "type",
    label: "Type",
    type: "select" as const,
    options: ["preventive", "corrective", "predictive", "scheduled", "emergency"].map((v) => ({ value: v, label: titleCase(v) })),
    default: "preventive",
  },
  {
    name: "priority",
    label: "Priority",
    type: "select" as const,
    options: ["critical", "high", "medium", "low"].map((v) => ({ value: v, label: titleCase(v) })),
    default: "medium",
  },
  {
    name: "assignedTeam",
    label: "Assigned Team",
    type: "select" as const,
    options: ["Infrastructure Ops", "Network Team", "Database Team", "Security"].map((v) => ({ value: v, label: v })),
  },
  { name: "assigneeName", label: "Assignee", placeholder: "Engineer name" },
  { name: "assetName", label: "Asset", placeholder: "Related asset name", colSpan: 2 as const },
  { name: "estimatedHours", label: "Estimated Hours", type: "number" as const, default: 2 },
  {
    name: "recurrence",
    label: "Recurrence",
    type: "select" as const,
    options: ["none", "daily", "weekly", "monthly", "quarterly"].map((v) => ({ value: v, label: titleCase(v) })),
    default: "none",
  },
  { name: "description", label: "Description", type: "textarea" as const, placeholder: "Scope of work" },
];

const FILTERS = [
  {
    key: "type",
    placeholder: "Type",
    options: ["preventive", "corrective", "predictive", "scheduled", "emergency"].map((v) => ({ value: v, label: titleCase(v) })),
  },
  {
    key: "status",
    placeholder: "Status",
    options: ["scheduled", "in_progress", "on_hold", "completed", "overdue", "cancelled"].map((v) => ({ value: v, label: titleCase(v) })),
  },
  {
    key: "priority",
    placeholder: "Priority",
    options: ["critical", "high", "medium", "low"].map((v) => ({ value: v, label: titleCase(v) })),
  },
];

export default function MaintenancePage() {
  const can = useAuthStore((s) => s.can);
  const [search, setSearch] = React.useState("");
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [page, setPage] = React.useState(1);
  const [createOpen, setCreateOpen] = React.useState(false);
  const debounced = useDebounce(search);

  const { data, isLoading } = useResourceList<MaintenanceTask>("maintenance", {
    page,
    limit: 12,
    search: debounced,
    ...filters,
  });

  const all = useResourceList<MaintenanceTask>("maintenance", { limit: 100 });
  const tasks = all.data?.data ?? [];
  const stats = {
    scheduled: tasks.filter((t) => t.status === "scheduled").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    overdue: tasks.filter((t) => t.status === "overdue").length,
  };

  return (
    <div>
      <PageHeader
        title="Maintenance Management"
        description="Plan, schedule, and track preventive and corrective work orders."
      >
        {can("maintenance:write") && (
          <Button variant="gradient" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> New Work Order
          </Button>
        )}
      </PageHeader>

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New Work Order"
        description="Schedule a maintenance task against an asset."
        resource="maintenance"
        submitLabel="Create Work Order"
        successMessage="Work order created"
        fields={WO_FIELDS}
        transform={(v) => ({
          ...v,
          workOrderId: `WO-${Date.now().toString().slice(-6)}`,
          status: "scheduled",
          progress: 0,
          scheduledStart: new Date().toISOString(),
        })}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={CalendarClock} label="Scheduled" value={stats.scheduled} accent="#0ea5e9" />
        <StatCard icon={Hammer} label="In Progress" value={stats.inProgress} accent="#6366f1" />
        <StatCard icon={CircleCheck} label="Completed" value={stats.completed} accent="#10b981" />
        <StatCard icon={AlertTriangle} label="Overdue" value={stats.overdue} accent="#ef4444" />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-soft">
        <div className="p-5 pb-0">
          <Toolbar
            search={search}
            onSearch={(v) => {
              setSearch(v);
              setPage(1);
            }}
            searchPlaceholder="Search work orders…"
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
                  <TableHead>Work Order</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-40">Progress</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Scheduled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                          <Wrench className="size-4" />
                        </div>
                        <div>
                          <div className="font-medium">{t.title}</div>
                          <div className="font-mono text-xs text-muted-foreground">
                            {t.workOrderId} · {t.assetName}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{titleCase(t.type)}</TableCell>
                    <TableCell>
                      <StatusBadge value={t.priority} dot={false} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={t.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={t.progress} className="h-1.5" />
                        <span className="w-9 text-xs font-medium tabular-nums">
                          {t.progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {t.assignedTeam}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(t.scheduledStart)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination pagination={data.pagination} onPage={setPage} />
          </>
        ) : (
          <EmptyState icon={Wrench} title="No work orders found" />
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: any;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-soft">
      <div
        className="grid size-11 place-items-center rounded-lg"
        style={{ backgroundColor: `${accent}1a`, color: accent }}
      >
        <Icon className="size-5" />
      </div>
      <div>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
