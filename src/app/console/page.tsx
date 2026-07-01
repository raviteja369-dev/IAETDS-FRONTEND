"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock, Loader2, RotateCcw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import {
  ScoreRing,
  SectionHeader,
  StatusPill,
  Surface,
  type Tone,
} from "@/components/eoc/primitives";
import { KpiCard, AIInsightCard, ActivityFeed } from "@/components/eoc/cards";
import { AreaTrend, BarSeries } from "@/components/eoc/charts";
import { aiInsights, dashboardScores, healthSeries } from "@/lib/eoc/data";
import { downloadJson } from "@/lib/eoc/export";
import { formatCurrency } from "@/lib/eoc/format";
import {
  selectAuditEvents,
  selectDashboardStats,
  selectOpenMaintenance,
  selectRecentDeployments,
  selectSecurityScore,
  selectSpendByApp,
} from "@/lib/eoc/selectors";
import { useEocStore } from "@/lib/eoc/store";

const deployIcon = {
  succeeded: { icon: CheckCircle2, tone: "success" as Tone, bg: "bg-eoc-success/10", fg: "text-eoc-success" },
  in_progress: { icon: Loader2, tone: "info" as Tone, bg: "bg-eoc-info/10", fg: "text-eoc-info" },
  failed: { icon: XCircle, tone: "danger" as Tone, bg: "bg-eoc-danger/10", fg: "text-eoc-danger" },
  rolled_back: { icon: RotateCcw, tone: "warning" as Tone, bg: "bg-eoc-warning/10", fg: "text-eoc-warning" },
};

export default function DashboardPage() {
  const router = useRouter();
  const state = useEocStore();
  const settings = useEocStore((s) => s.settings);
  const scheduleTask = useEocStore((s) => s.scheduleTask);

  const stats = selectDashboardStats(state);
  const spendByApp = selectSpendByApp(state);
  const deployments = selectRecentDeployments(state);
  const maintenance = selectOpenMaintenance(state);
  const activity = selectAuditEvents(state);
  const securityScore = selectSecurityScore(state);

  const scores = dashboardScores.map((s) =>
    s.key === "security" ? { ...s, value: securityScore } : s,
  );

  const exportReport = () => {
    downloadJson(`atlas-operations-report-${Date.now()}.json`, {
      workspace: settings,
      stats,
      applications: state.applications,
      maintenance: state.maintenanceTasks,
      security: state.securityFindings,
      billing: { invoices: state.invoices, walletBalance: state.walletBalance },
    });
    toast.success("Report exported", { description: "Operations snapshot downloaded as JSON." });
  };

  const onInsight = (insight: (typeof aiInsights)[0]) => {
    if (insight.category === "maintenance") {
      scheduleTask({ title: insight.title, app: "Platform", type: "predictive", risk: "medium" });
      toast.success("Recommendation scheduled", { description: insight.title });
      router.push("/console/maintenance");
      return;
    }
    if (insight.category === "cost") {
      router.push("/console/billing");
      return;
    }
    if (insight.category === "security") {
      router.push("/console/security");
      return;
    }
    router.push("/console/applications");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${settings.workspaceName} · ${settings.workspaceRegion}`}
        title="Operations Center"
        description="A real-time, executive view of everything running across your enterprise — health, security, performance, and spend."
        actions={
          <>
            <EButton variant="secondary" onClick={exportReport}>Export report</EButton>
            <EButton variant="primary" asChild>
              <Link href="/console/applications">
                View applications <ArrowRight className="h-4 w-4" />
              </Link>
            </EButton>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {scores.map((s) => (
          <Surface key={s.key} hover className="flex items-center gap-4 p-5">
            <ScoreRing
              value={s.value}
              size={92}
              stroke={8}
              color={s.tone === "success" ? "#22C55E" : s.tone === "warning" ? "#F59E0B" : "#4F7CFF"}
            />
            <div>
              <p className="text-sm font-medium text-eoc-fg">{s.label}</p>
              <p className="mt-1 text-xs text-eoc-muted">
                {s.delta >= 0 ? "▲" : "▼"} {Math.abs(s.delta)}
                {s.unit === "%" ? "pp" : "%"} vs last week
              </p>
            </div>
          </Surface>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s, i) => (
          <KpiCard key={s.key} stat={s} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Surface className="p-5 xl:col-span-2">
          <SectionHeader
            title="Health & incident timeline"
            description="30-day platform health vs incident volume"
            action={<StatusPill tone="success" dot>Stable</StatusPill>}
          />
          <div className="mt-4">
            <AreaTrend data={healthSeries} dataKey="health" xKey="d" color="#4F7CFF" height={220} formatter={(v) => `${v}%`} />
          </div>
        </Surface>

        <Surface className="flex flex-col p-5">
          <SectionHeader title="Recent deployments" action={<Link href="/console/applications" className="text-xs text-eoc-accent hover:text-eoc-fg">All</Link>} />
          <ul className="mt-4 flex-1 space-y-3">
            {deployments.length === 0 ? (
              <li className="text-sm text-eoc-muted">No deployments yet.</li>
            ) : (
              deployments.slice(0, 5).map((d) => {
                const meta = deployIcon[d.status];
                const Icon = meta.icon;
                return (
                  <li key={d.id} className="flex items-center gap-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${meta.bg}`}>
                      <Icon className={`h-4 w-4 ${meta.fg} ${d.status === "in_progress" ? "animate-spin" : ""}`} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-eoc-fg">
                        {d.app} <span className="font-mono text-xs text-eoc-muted">v{d.version}</span>
                      </p>
                      <p className="text-[11px] text-eoc-muted">{d.by} · {d.at}</p>
                    </div>
                    <StatusPill tone={meta.tone}>{d.status.replace("_", " ")}</StatusPill>
                  </li>
                );
              })
            )}
          </ul>
        </Surface>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <SectionHeader title="AI insights & recommendations" description="Proactive opportunities detected across your workspace" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {aiInsights.map((insight) => (
              <AIInsightCard key={insight.id} insight={insight} onAction={onInsight} />
            ))}
          </div>

          <Surface className="p-5">
            <SectionHeader title="Spend by category" description="Current month, top applications" />
            <div className="mt-4">
              <BarSeries
                data={spendByApp}
                bars={[{ key: "cost", color: "#4F7CFF", name: "Monthly cost" }]}
                formatter={(v) => formatCurrency(v)}
              />
            </div>
          </Surface>
        </div>

        <div className="space-y-4">
          <Surface className="p-5">
            <SectionHeader title="Upcoming maintenance" action={<Link href="/console/maintenance" className="text-xs text-eoc-accent hover:text-eoc-fg">Center</Link>} />
            <ul className="mt-4 space-y-3">
              {maintenance.slice(0, 4).map((m) => (
                <li key={m.id} className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-eoc-muted" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-eoc-fg">{m.title}</p>
                    <p className="text-[11px] text-eoc-muted">{m.app} · {m.window}</p>
                  </div>
                  <StatusPill tone={m.risk === "high" ? "danger" : m.risk === "medium" ? "warning" : "neutral"}>
                    {m.risk}
                  </StatusPill>
                </li>
              ))}
              {maintenance.length === 0 && <li className="text-sm text-eoc-muted">No open maintenance tasks.</li>}
            </ul>
          </Surface>

          <Surface className="p-5">
            <SectionHeader title="Recent activity" action={<Link href="/console/audit" className="text-xs text-eoc-accent hover:text-eoc-fg">Audit</Link>} />
            <div className="mt-4">
              <ActivityFeed events={activity.slice(0, 6)} />
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}
