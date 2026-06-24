"use client";

import { motion } from "framer-motion";
import { useDashboard } from "@/hooks/use-analytics";
import { useAuthStore } from "@/store/auth";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { ChartCard } from "@/components/charts/chart-card";
import { AreaTrend, Donut, MultiBar } from "@/components/charts/charts";
import { IncidentFeed, SecurityFeed } from "@/components/dashboard/activity-feed";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { titleCase } from "@/lib/utils";
import { exportToCsv } from "@/lib/export";
import { toast } from "sonner";
import {
  Boxes,
  ServerCog,
  Siren,
  Ticket,
  ShieldCheck,
  HeartPulse,
  Gauge,
  Activity,
  Download,
  RefreshCw,
} from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading, refetch, isFetching } = useDashboard() as any;
  const user = useAuthStore((s) => s.user);

  if (isLoading || !data) return <DashboardSkeleton />;

  const { kpis, trends, distribution, recentIncidents, recentSecurity } = data;

  const trendData = trends.requestsPerSec.map((_: number, i: number) => ({
    label: `${String(i).padStart(2, "0")}:00`,
    requests: trends.requestsPerSec[i],
    latency: trends.latencyMs[i],
  }));

  const kpiCards = [
    { label: "Total Assets", value: kpis.totalAssets, icon: Boxes, delta: "4.2%", deltaPositive: true, accent: "#6366f1", spark: trends.requestsPerSec.slice(0, 12) },
    { label: "Active Systems", value: kpis.activeSystems, icon: ServerCog, delta: "1.8%", deltaPositive: true, accent: "#10b981", spark: trends.uptime.slice(0, 12).map((v: number) => v) },
    { label: "Critical Incidents", value: kpis.criticalIncidents, icon: Siren, delta: "2", deltaPositive: false, accent: "#ef4444", spark: trends.incidents },
    { label: "Open Tickets", value: kpis.openTickets, icon: Ticket, delta: "6.1%", deltaPositive: false, accent: "#f59e0b", spark: trends.incidents.map((v: number) => v + 3) },
    { label: "Security Score", value: kpis.securityScore, suffix: "/100", icon: ShieldCheck, delta: "3 pts", deltaPositive: true, accent: "#0ea5e9", spark: trends.uptime.slice(0, 12) },
    { label: "Infra Health", value: kpis.infrastructureHealth, suffix: "%", icon: HeartPulse, delta: "0.5%", deltaPositive: true, accent: "#a855f7", spark: trends.uptime.slice(6, 18) },
    { label: "SLA Compliance", value: kpis.slaCompliance, suffix: "%", icon: Gauge, delta: "1.2%", deltaPositive: true, accent: "#14b8a6", spark: trends.uptime.slice(0, 12) },
    { label: "Uptime (30d)", value: kpis.uptime, suffix: "%", icon: Activity, delta: "0.01%", deltaPositive: true, accent: "#6366f1", spark: trends.uptime },
  ];

  const categoryDist = distribution.assetsByCategory.map((d: any) => ({
    label: titleCase(d.key),
    value: d.value,
  }));
  const severityDist = distribution.incidentsBySeverity.map((d: any) => ({
    label: d.key.toUpperCase(),
    value: d.value,
  }));

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "Operator"}`}
        description="Real-time operational intelligence across your entire technology estate."
      >
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Button
          variant="gradient"
          size="sm"
          onClick={() => {
            exportToCsv(
              "iaetds-dashboard-kpis",
              Object.entries(kpis).map(([metric, value]) => ({ metric: titleCase(metric), value })),
            );
            toast.success("Dashboard exported", { description: "KPI summary downloaded." });
          }}
        >
          <Download className="size-4" /> Export
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((k, i) => (
          <KpiCard key={k.label} index={i} {...(k as any)} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Traffic & Latency"
          description="Requests/sec and response time over the last 24 hours"
          className="lg:col-span-2"
        >
          <AreaTrend
            data={trendData}
            keys={["requests", "latency"]}
            labels={["Requests/sec", "Latency (ms)"]}
          />
        </ChartCard>

        <ChartCard
          title="Asset Distribution"
          description="By category"
        >
          <Donut data={categoryDist} />
        </ChartCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Incident Severity"
          description="Distribution across all incidents"
        >
          <MultiBar data={severityDist} height={260} />
        </ChartCard>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card shadow-soft"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h3 className="font-semibold tracking-tight">Active Incidents</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Latest declared incidents
              </p>
            </div>
          </div>
          <IncidentFeed items={recentIncidents.slice(0, 5)} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card shadow-soft"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h3 className="font-semibold tracking-tight">Security Alerts</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Highest-risk events
              </p>
            </div>
          </div>
          <SecurityFeed items={recentSecurity.slice(0, 6)} />
        </motion.div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div>
      <Skeleton className="mb-6 h-9 w-72" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}
