"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Activity, Cloud, Cog, Webhook, ListChecks, Timer, Bot, type LucideIcon } from "lucide-react";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import {
  IconTile,
  SectionHeader,
  StatusPill,
  Surface,
  type Tone,
} from "@/components/eoc/primitives";
import { MultiLine } from "@/components/eoc/charts";
import { monitoringServices, responseSeries } from "@/lib/eoc/data";
import { selectActiveApps } from "@/lib/eoc/selectors";
import { useEocStore } from "@/lib/eoc/store";
import { cn } from "@/lib/utils";

const typeIcon: Record<string, LucideIcon> = {
  api: Cloud, job: Cog, queue: ListChecks, cron: Timer, webhook: Webhook, agent: Bot,
};
const statusTone: Record<string, Tone> = { operational: "success", degraded: "warning", down: "danger" };

export default function MonitoringPage() {
  const router = useRouter();
  const apps = useEocStore(selectActiveApps);
  const operational = monitoringServices.filter((s) => s.status === "operational").length;
  const degradedApps = apps.filter((a) => a.health < 90 || a.status !== "running").length;
  const avgHealth = apps.length ? Math.round(apps.reduce((s, a) => s + a.health, 0) / apps.length) : 100;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Live observability"
        title="Monitoring"
        description="Real-time health of services, jobs, queues, webhooks and AI agents — with alerting and historical timelines."
        actions={<EButton variant="secondary" onClick={() => router.push("/console/notifications")}><Activity className="h-4 w-4" /> Alert center</EButton>}
      />

      <Surface className="flex flex-wrap items-center gap-x-8 gap-y-3 p-5">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            {degradedApps === 0 && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-eoc-success opacity-75" />}
            <span className={cn("relative inline-flex h-3 w-3 rounded-full", degradedApps ? "bg-eoc-warning" : "bg-eoc-success")} />
          </span>
          <div>
            <p className="text-sm font-semibold text-eoc-fg">{degradedApps ? `${degradedApps} apps need attention` : "All systems operational"}</p>
            <p className="text-xs text-eoc-muted">{operational} of {monitoringServices.length} services healthy · {apps.length} apps monitored</p>
          </div>
        </div>
        <div className="ml-auto flex gap-6 text-sm">
          <div><p className="text-eoc-muted text-xs">Avg app health</p><p className="font-semibold text-eoc-fg">{avgHealth}%</p></div>
          <div><p className="text-eoc-muted text-xs">Incidents</p><p className="font-semibold text-eoc-fg">{degradedApps} active</p></div>
          <div><p className="text-eoc-muted text-xs">Avg latency</p><p className="font-semibold text-eoc-fg">182ms</p></div>
        </div>
      </Surface>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {monitoringServices.map((s) => {
          const Icon = typeIcon[s.type] ?? Cloud;
          return (
            <Surface key={s.name} hover className="p-4">
              <div className="flex items-start justify-between">
                <IconTile icon={Icon} accent={s.status === "degraded" ? "#F59E0B" : "#22C55E"} />
                <StatusPill tone={statusTone[s.status]} dot>{s.status}</StatusPill>
              </div>
              <p className="mt-3 text-sm font-medium text-eoc-fg">{s.name}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-eoc-muted">
                <span className="uppercase">{s.type}</span>
                <span>{s.latency} · {s.uptime}%</span>
              </div>
            </Surface>
          );
        })}
      </div>

      <Surface className="p-5">
        <SectionHeader title="Application health" description="Live health from your workspace applications" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {apps.slice(0, 6).map((a) => (
            <div key={a.id} className="rounded-xl border border-eoc-border bg-white/[0.02] p-3">
              <div className="flex items-center justify-between">
                <p className="truncate text-sm font-medium text-eoc-fg">{a.name}</p>
                <StatusPill tone={a.health >= 90 ? "success" : a.health >= 80 ? "warning" : "danger"}>{a.health}%</StatusPill>
              </div>
              <p className="mt-1 text-xs text-eoc-muted">{a.status} · CPU {a.cpu}%</p>
            </div>
          ))}
        </div>
      </Surface>

      <Surface className="p-5">
        <SectionHeader title="Service latency" description="API response times across the last 24 hours" />
        <div className="mt-4">
          <MultiLine data={responseSeries} xKey="t" height={240} formatter={(v) => `${v}ms`} lines={[{ key: "p50", color: "#22C55E", name: "REST" }, { key: "p95", color: "#4F7CFF", name: "GraphQL" }]} />
        </div>
      </Surface>
    </div>
  );
}
