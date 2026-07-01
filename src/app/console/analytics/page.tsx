"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import { KpiCard } from "@/components/eoc/cards";
import { AreaTrend, BarSeries, DonutChart } from "@/components/eoc/charts";
import { SectionHeader, Surface } from "@/components/eoc/primitives";
import { downloadJson } from "@/lib/eoc/export";
import { selectActiveApps, selectFlowSuccessRate } from "@/lib/eoc/selectors";
import { useEocStore } from "@/lib/eoc/store";
import type { ScoreCard } from "@/lib/eoc/types";

const adoption = Array.from({ length: 12 }, (_, i) => ({
  m: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"][i],
  users: 600 + i * 58,
}));

export default function AnalyticsPage() {
  const state = useEocStore();
  const members = useEocStore((s) => s.members);
  const integrations = useEocStore((s) => s.integrations);
  const agents = useEocStore((s) => s.agents);
  const apps = selectActiveApps(state);
  const flowRate = selectFlowSuccessRate(state);
  const connected = integrations.filter((i) => i.connected).length;

  const spark = (b: number) => Array.from({ length: 16 }, (_, i) => Math.round(b + Math.sin(i / 2) * 8));

  const kpis: ScoreCard[] = [
    { key: "growth", label: "Business Growth", value: Math.round((apps.length / Math.max(1, apps.length - 1)) * 18) || 18, unit: "%", delta: 3.2, spark: spark(16), tone: "success" },
    { key: "active", label: "Active Users", value: members.filter((m) => m.status === "active").length, delta: 8, spark: spark(members.length) },
    { key: "adoption", label: "Integrations", value: Math.round((connected / Math.max(1, integrations.length)) * 100), unit: "%", delta: 5, spark: spark(connected * 10), tone: "success" },
    { key: "roi", label: "Automation ROI", value: flowRate * 3, unit: "%", delta: 11, spark: spark(flowRate * 3), tone: "success" },
  ];

  const departments = [
    { name: "Engineering", value: 32, color: "#4F7CFF" },
    { name: "Sales", value: 24, color: "#22C55E" },
    { name: "Finance", value: 18, color: "#F59E0B" },
    { name: "Support", value: 14, color: "#A855F7" },
    { name: "Other", value: 12, color: "#71717A" },
  ];

  const features = [
    { m: "Applications", adoption: Math.min(100, apps.length * 8) },
    { m: "AI Agents", adoption: Math.min(100, agents.length * 12) },
    { m: "Automation", adoption: Math.min(100, state.flows.length * 10) },
    { m: "Integrations", adoption: Math.round((connected / Math.max(1, integrations.length)) * 100) },
    { m: "Storage", adoption: 68 },
    { m: "Security", adoption: Math.max(0, 100 - state.securityFindings.filter((f) => f.status !== "resolved").length * 5) },
  ];

  const exportAnalytics = () => {
    downloadJson(`analytics-export-${Date.now()}.json`, { kpis, features, members: members.length, apps: apps.length, agents: agents.length });
    toast.success("Analytics exported", { description: "Platform usage summary downloaded." });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Executive analytics"
        title="Analytics"
        description="Business growth, adoption, usage and ROI across the platform — build custom dashboards and export anywhere."
        actions={<EButton variant="secondary" onClick={exportAnalytics}><Download className="h-4 w-4" /> Export center</EButton>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k, i) => <KpiCard key={k.key} stat={k} index={i} />)}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Surface className="p-5 xl:col-span-2">
          <SectionHeader title="Active user growth" description={`${members.length} members in workspace`} />
          <div className="mt-4"><AreaTrend data={adoption.map((a, i) => ({ ...a, users: Math.round(members.length * (0.6 + i * 0.03)) }))} dataKey="users" xKey="m" color="#4F7CFF" height={240} /></div>
        </Surface>
        <Surface className="p-5">
          <SectionHeader title="Usage by department" />
          <div className="mt-4"><DonutChart data={departments} height={200} /></div>
          <div className="mt-4 space-y-2">
            {departments.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-eoc-fg2">{d.name}</span>
                <span className="ml-auto font-medium text-eoc-fg">{d.value}%</span>
              </div>
            ))}
          </div>
        </Surface>
      </div>

      <Surface className="p-5">
        <SectionHeader title="Feature adoption" description="Share of workspace engaging with each capability" />
        <div className="mt-4"><BarSeries data={features} xKey="m" height={240} bars={[{ key: "adoption", color: "#22C55E", name: "Adoption %" }]} formatter={(v) => `${v}%`} /></div>
      </Surface>
    </div>
  );
}
