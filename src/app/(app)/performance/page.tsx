"use client";

import { usePerformance } from "@/hooks/use-analytics";
import { PageHeader } from "@/components/shared/page-header";
import { ChartCard } from "@/components/charts/chart-card";
import { AreaTrend, LineTrend } from "@/components/charts/charts";
import { KpiCard } from "@/components/shared/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Cpu, MemoryStick, HardDrive, Network, Timer, Activity } from "lucide-react";

export default function PerformancePage() {
  const { data, isLoading } = usePerformance();

  if (isLoading || !data)
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-72" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );

  const { series, current, thresholds, nodes } = data;
  const hours = series.cpu.map((_: number, i: number) => `${String(i).padStart(2, "0")}:00`);
  const resourceData = hours.map((label: string, i: number) => ({
    label,
    cpu: series.cpu[i],
    memory: series.memory[i],
    storage: series.storage[i],
  }));
  const latencyData = hours.map((label: string, i: number) => ({
    label,
    responseTime: series.responseTime[i],
    network: series.network[i],
  }));

  const cards = [
    { label: "CPU Utilization", value: current.cpu, suffix: "%", icon: Cpu, accent: "#6366f1", spark: series.cpu },
    { label: "Memory Usage", value: current.memory, suffix: "%", icon: MemoryStick, accent: "#0ea5e9", spark: series.memory },
    { label: "Storage", value: current.storage, suffix: "%", icon: HardDrive, accent: "#f59e0b", spark: series.storage },
    { label: "Availability", value: current.availability, suffix: "%", icon: Activity, accent: "#10b981", spark: series.availability },
  ];

  return (
    <div>
      <PageHeader
        title="Performance Monitoring"
        description="Real-time infrastructure telemetry, resource utilization, and availability."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c, i) => (
          <KpiCard key={c.label} index={i} {...(c as any)} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Resource Utilization"
          description="CPU, memory, and storage over 24h"
        >
          <AreaTrend
            data={resourceData}
            keys={["cpu", "memory", "storage"]}
            labels={["CPU %", "Memory %", "Storage %"]}
          />
        </ChartCard>
        <ChartCard
          title="Latency & Network"
          description="Response time (ms) and throughput (Mbps)"
        >
          <LineTrend
            data={latencyData}
            keys={["responseTime", "network"]}
            labels={["Response (ms)", "Network (Mbps)"]}
          />
        </ChartCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <h3 className="font-semibold tracking-tight">Alert Thresholds</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Current vs configured limits
          </p>
          <div className="mt-5 space-y-4">
            {[
              { label: "CPU", value: current.cpu, limit: thresholds.cpu, icon: Cpu },
              { label: "Memory", value: current.memory, limit: thresholds.memory, icon: MemoryStick },
              { label: "Storage", value: current.storage, limit: thresholds.storage, icon: HardDrive },
              { label: "Response Time", value: current.responseTime, limit: thresholds.responseTime, icon: Timer, unit: "ms" },
            ].map((t) => {
              const pct = Math.min(100, (t.value / t.limit) * 100);
              const danger = pct > 85;
              return (
                <div key={t.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <t.icon className="size-3.5" /> {t.label}
                    </span>
                    <span className="font-medium tabular-nums">
                      {t.value}
                      {t.unit ?? "%"} / {t.limit}
                      {t.unit ?? "%"}
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    indicatorClassName={danger ? "bg-destructive" : pct > 65 ? "bg-warning" : "bg-success"}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-soft lg:col-span-2">
          <div className="border-b border-border px-5 py-4">
            <h3 className="font-semibold tracking-tight">Compute Nodes</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Live health across the cluster fleet
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Node</TableHead>
                <TableHead>Region</TableHead>
                <TableHead className="w-36">CPU</TableHead>
                <TableHead className="w-36">Memory</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nodes.map((n: any) => (
                <TableRow key={n.name}>
                  <TableCell className="font-mono text-sm font-medium">{n.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{n.region}</TableCell>
                  <TableCell>
                    <NodeBar value={n.cpu} />
                  </TableCell>
                  <TableCell>
                    <NodeBar value={n.memory} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={n.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function NodeBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <Progress
        value={value}
        className="h-1.5"
        indicatorClassName={value > 80 ? "bg-destructive" : value > 60 ? "bg-warning" : "bg-success"}
      />
      <span className="w-9 text-xs font-medium tabular-nums">{value}%</span>
    </div>
  );
}
