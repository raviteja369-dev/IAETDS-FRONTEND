"use client";

import * as React from "react";
import { useSecurityOverview } from "@/hooks/use-analytics";
import { useResourceList } from "@/hooks/use-resource";
import { useDebounce } from "@/hooks/use-debounce";
import type { SecurityEvent } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { ChartCard } from "@/components/charts/chart-card";
import { AreaTrend, BarSeries, Donut } from "@/components/charts/charts";
import { Toolbar } from "@/components/shared/toolbar";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { titleCase, timeAgo } from "@/lib/utils";
import {
  ShieldAlert,
  ShieldX,
  Activity,
  KeyRound,
  Bug,
  Radar,
} from "lucide-react";

const FILTERS = [
  {
    key: "severity",
    placeholder: "Severity",
    options: ["critical", "high", "medium", "low", "info"].map((v) => ({ value: v, label: titleCase(v) })),
  },
  {
    key: "status",
    placeholder: "Status",
    options: ["new", "triaging", "investigating", "contained", "resolved", "false_positive"].map((v) => ({ value: v, label: titleCase(v) })),
  },
  {
    key: "type",
    placeholder: "Type",
    options: ["intrusion_attempt", "malware", "phishing", "brute_force", "vulnerability", "anomaly", "failed_login"].map((v) => ({ value: v, label: titleCase(v) })),
  },
];

export default function SecurityPage() {
  const { data: overview, isLoading } = useSecurityOverview();
  const [search, setSearch] = React.useState("");
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [page, setPage] = React.useState(1);
  const debounced = useDebounce(search);
  const { data: events } = useResourceList<SecurityEvent>("security-events", {
    page,
    limit: 10,
    search: debounced,
    ...filters,
  });

  if (isLoading || !overview)
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-72" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );

  const { summary, byType, bySeverity, threatTrend, topRisks } = overview;
  const trendData = threatTrend.map((v: number, i: number) => ({
    label: `D${i + 1}`,
    threats: v,
  }));
  const typeData = byType
    .map((d: any) => ({ label: titleCase(d.key), value: d.value }))
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 7);
  const sevData = bySeverity.map((d: any) => ({ label: titleCase(d.key), value: d.value }));

  const stats = [
    { label: "Open Threats", value: summary.openThreats, icon: ShieldAlert, accent: "#ef4444" },
    { label: "Critical", value: summary.criticalThreats, icon: ShieldX, accent: "#f59e0b" },
    { label: "Avg Risk Score", value: summary.avgRiskScore, icon: Activity, accent: "#a855f7" },
    { label: "Failed Logins", value: summary.failedLogins, icon: KeyRound, accent: "#0ea5e9" },
    { label: "Vulnerabilities", value: summary.vulnerabilities, icon: Bug, accent: "#14b8a6" },
  ];

  return (
    <div>
      <PageHeader
        title="Security Operations Center"
        description="Real-time threat detection, triage, and response across the enterprise."
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
          <Radar className="size-3.5 animate-pulse" /> Live monitoring
        </span>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="animate-fade-in rounded-xl border border-border bg-card p-5 shadow-soft"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div
              className="mb-3 grid size-9 place-items-center rounded-lg"
              style={{ backgroundColor: `${s.accent}1a`, color: s.accent }}
            >
              <s.icon className="size-4" />
            </div>
            <div className="text-2xl font-bold tabular-nums">{s.value}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Threat Activity"
          description="Detected events over 14 days"
          className="lg:col-span-2"
        >
          <AreaTrend data={trendData} keys={["threats"]} labels={["Threats"]} height={260} />
        </ChartCard>
        <ChartCard title="By Severity" description="Event severity mix">
          <Donut data={sevData} height={260} />
        </ChartCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Top Attack Vectors" description="Most frequent event types">
          <BarSeries data={typeData} horizontal height={280} color="#ef4444" />
        </ChartCard>

        <div className="rounded-xl border border-border bg-card shadow-soft lg:col-span-2">
          <div className="border-b border-border px-5 py-4">
            <h3 className="font-semibold tracking-tight">Highest Risk Events</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Prioritized by risk score
            </p>
          </div>
          <div className="divide-y divide-border">
            {topRisks.map((e: SecurityEvent) => (
              <div key={e._id} className="flex items-center gap-3 px-5 py-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive">
                  <ShieldAlert className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{e.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {e.mitreTactic} · {e.sourceIp} · {e.geoLocation}
                  </p>
                </div>
                <RiskMeter score={e.riskScore} />
                <StatusBadge value={e.severity} dot={false} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card shadow-soft">
        <div className="p-5 pb-0">
          <h3 className="mb-4 font-semibold tracking-tight">Security Event Log</h3>
          <Toolbar
            search={search}
            onSearch={(v) => {
              setSearch(v);
              setPage(1);
            }}
            searchPlaceholder="Search events, IPs, users…"
            filters={FILTERS}
            values={filters}
            onFilterChange={(k, v) => {
              setFilters((f) => ({ ...f, [k]: v }));
              setPage(1);
            }}
          />
        </div>
        {events && (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Event</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Detected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.data.map((e) => (
                  <TableRow key={e._id}>
                    <TableCell>
                      <div className="font-medium">{e.title}</div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {e.eventId} · {e.detectionSource}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{titleCase(e.type)}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {e.sourceIp}
                    </TableCell>
                    <TableCell>
                      <RiskMeter score={e.riskScore} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={e.severity} dot={false} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={e.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {timeAgo(e.occurredAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination pagination={events.pagination} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  );
}

function RiskMeter({ score }: { score: number }) {
  const color = score > 75 ? "#ef4444" : score > 50 ? "#f59e0b" : "#10b981";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-6 text-xs font-semibold tabular-nums" style={{ color }}>
        {score}
      </span>
    </div>
  );
}
