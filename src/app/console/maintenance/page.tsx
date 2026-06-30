"use client";

import * as React from "react";
import { CalendarClock, Sparkles, Wrench } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import {
  ProgressBar,
  SectionHeader,
  StatusPill,
  Surface,
  type Tone,
} from "@/components/eoc/primitives";
import { AreaTrend } from "@/components/eoc/charts";
import { componentHealth, healthSeries } from "@/lib/eoc/data";
import { useEocStore } from "@/lib/eoc/store";
import { formatCurrency } from "@/lib/eoc/format";
import { cn } from "@/lib/utils";

const riskTone: Record<string, Tone> = { critical: "danger", high: "danger", medium: "warning", low: "neutral" };
const statusTone: Record<string, Tone> = { scheduled: "info", in_progress: "warning", completed: "success", at_risk: "danger" };
const typeTone: Record<string, Tone> = { scheduled: "info", predictive: "warning", patch: "danger", upgrade: "success", backup: "neutral" };

export default function MaintenancePage() {
  const [tab, setTab] = React.useState<"all" | "scheduled" | "predictive">("all");
  const maintenanceTasks = useEocStore((s) => s.maintenanceTasks);
  const advanceTask = useEocStore((s) => s.advanceTask);
  const completeTask = useEocStore((s) => s.completeTask);
  const scheduleTask = useEocStore((s) => s.scheduleTask);

  const tasks = maintenanceTasks.filter((t) =>
    tab === "all" ? true : tab === "predictive" ? t.type === "predictive" : t.status !== "completed",
  );
  const openCount = maintenanceTasks.filter((t) => t.status !== "completed").length;
  const predictiveCount = maintenanceTasks.filter((t) => t.type === "predictive" && t.status !== "completed").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI operations center"
        title="Maintenance Center"
        description="Predictive, scheduled, and automated maintenance with AI root-cause analysis — keep every capability healthy before issues surface."
        actions={
          <>
            <EButton variant="secondary" onClick={() => toast.info("Maintenance calendar", { description: "All scheduled and predictive windows for the next 30 days." })}><CalendarClock className="h-4 w-4" /> Calendar</EButton>
            <EButton
              variant="primary"
              onClick={() => {
                scheduleTask({ title: "Ad-hoc maintenance window", app: "Platform", type: "scheduled", risk: "low" });
                toast.success("Maintenance scheduled", { description: "A new window was added to the queue." });
              }}
            >
              <Wrench className="h-4 w-4" /> Schedule
            </EButton>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Mini label="Open tasks" value={String(openCount)} tone="info" />
        <Mini label="Predictive alerts" value={String(predictiveCount)} tone="warning" />
        <Mini label="Avg downtime" value="2.1m" tone="success" />
        <Mini label="Maintenance cost" value={formatCurrency(420000, true)} tone="neutral" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Surface className="p-5 xl:col-span-2">
          <SectionHeader title="Maintenance timeline & downtime forecast" description="30-day health with predictive maintenance windows" />
          <div className="mt-4">
            <AreaTrend data={healthSeries} dataKey="health" xKey="d" color="#F59E0B" height={220} formatter={(v) => `${v}%`} />
          </div>
        </Surface>

        <Surface className="border-eoc-accent/30 bg-eoc-accent/[0.05] p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-eoc-accent" />
            <p className="text-xs font-semibold uppercase tracking-wider text-eoc-accent">AI Root-Cause Analysis</p>
          </div>
          <p className="mt-3 text-sm font-medium text-eoc-fg">Beacon Marketing — memory pressure</p>
          <p className="mt-1.5 text-xs leading-relaxed text-eoc-fg2">
            Campaign engine is retaining audience segments in memory after batch completion. Predicted to exceed
            capacity within 72h under launch load. Recommended: scheduled scale-out + cache TTL patch in 3.0.0.
          </p>
          <EButton
            size="sm"
            variant="primary"
            className="mt-4"
            onClick={() => {
              scheduleTask({ title: "Predictive scale-out + cache TTL patch", app: "Beacon Marketing", type: "predictive", risk: "high" });
              toast.success("Recommendation applied", { description: "Predictive scale-out scheduled for Beacon Marketing." });
            }}
          >
            Apply recommendation
          </EButton>
        </Surface>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Surface className="p-5 xl:col-span-2">
          <SectionHeader
            title="Maintenance tasks"
            action={
              <div className="flex items-center gap-1 rounded-lg border border-eoc-border bg-white/[0.03] p-1">
                {(["all", "scheduled", "predictive"] as const).map((t) => (
                  <button key={t} onClick={() => setTab(t)} className={cn("rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors", tab === t ? "bg-white/10 text-eoc-fg" : "text-eoc-muted hover:text-eoc-fg2")}>
                    {t}
                  </button>
                ))}
              </div>
            }
          />
          <div className="mt-4 space-y-3">
            {tasks.map((t) => (
              <div key={t.id} className="rounded-xl border border-eoc-border bg-white/[0.02] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-eoc-fg">{t.title}</p>
                    <p className="text-xs text-eoc-muted">{t.app} · {t.window} · {t.owner}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusPill tone={typeTone[t.type]}>{t.type}</StatusPill>
                    <StatusPill tone={riskTone[t.risk]}>{t.risk}</StatusPill>
                  </div>
                </div>
                {t.status === "in_progress" && (
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-[11px] text-eoc-muted">
                      <span>In progress</span><span>{t.progress}%</span>
                    </div>
                    <ProgressBar value={t.progress} tone="warning" />
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <StatusPill tone={statusTone[t.status]}>{t.status.replace("_", " ")}</StatusPill>
                  {t.status !== "completed" && (
                    <div className="flex items-center gap-1.5">
                      <EButton size="sm" variant="secondary" onClick={() => advanceTask(t.id)}>
                        {t.status === "scheduled" ? "Start" : "Advance"}
                      </EButton>
                      <EButton size="sm" variant="ghost" onClick={() => { completeTask(t.id); toast.success(`${t.title} completed`); }}>
                        Complete
                      </EButton>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Surface>

        <Surface className="p-5">
          <SectionHeader title="Component health" description="Live dependency monitoring" />
          <div className="mt-4 space-y-3">
            {componentHealth.map((c) => (
              <div key={c.name}>
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-eoc-fg">{c.name}</p>
                    <p className="text-[11px] text-eoc-muted">{c.app} · {c.lastChecked}</p>
                  </div>
                  <span className={cn("text-sm font-semibold", c.health >= 90 ? "text-eoc-success" : c.health >= 80 ? "text-eoc-warning" : "text-eoc-danger")}>
                    {c.health}%
                  </span>
                </div>
                <ProgressBar value={c.health} tone={c.health >= 90 ? "success" : c.health >= 80 ? "warning" : "danger"} />
              </div>
            ))}
          </div>
        </Surface>
      </div>
    </div>
  );
}

function Mini({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  const ring: Record<string, string> = {
    info: "before:bg-eoc-info", warning: "before:bg-eoc-warning", success: "before:bg-eoc-success", danger: "before:bg-eoc-danger", neutral: "before:bg-eoc-muted",
  };
  return (
    <Surface hover className={cn("relative overflow-hidden p-5 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:content-['']", ring[tone])}>
      <p className="text-xs text-eoc-muted">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold text-eoc-fg">{value}</p>
    </Surface>
  );
}
