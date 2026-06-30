"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import { KpiCard } from "@/components/eoc/cards";
import { AreaTrend, BarSeries, DonutChart } from "@/components/eoc/charts";
import { SectionHeader, Surface } from "@/components/eoc/primitives";
import type { ScoreCard } from "@/lib/eoc/types";

const spark = (b: number) => Array.from({ length: 16 }, (_, i) => Math.round(b + Math.sin(i / 2) * 8 + Math.random() * 8));

const kpis: ScoreCard[] = [
  { key: "growth", label: "Business Growth", value: 18.4, unit: "%", delta: 3.2, spark: spark(16), tone: "success" },
  { key: "active", label: "Active Users", value: 1284, delta: 8, spark: spark(1200) },
  { key: "adoption", label: "Feature Adoption", value: 72, unit: "%", delta: 5, spark: spark(68), tone: "success" },
  { key: "roi", label: "Automation ROI", value: 312, unit: "%", delta: 11, spark: spark(290), tone: "success" },
];

const adoption = Array.from({ length: 12 }, (_, i) => ({
  m: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"][i],
  users: 600 + i * 58 + Math.round(Math.random() * 40),
}));

const departments = [
  { name: "Engineering", value: 32, color: "#4F7CFF" },
  { name: "Sales", value: 24, color: "#22C55E" },
  { name: "Finance", value: 18, color: "#F59E0B" },
  { name: "Support", value: 14, color: "#A855F7" },
  { name: "Other", value: 12, color: "#71717A" },
];

const features = Array.from({ length: 6 }, (_, i) => ({
  m: ["Dashboards", "AI Agents", "Automation", "Reports", "Storage", "Integrations"][i],
  adoption: 40 + Math.round(Math.random() * 55),
}));

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Executive analytics"
        title="Analytics"
        description="Business growth, adoption, usage and ROI across the platform — build custom dashboards and export anywhere."
        actions={<EButton variant="secondary"><Download className="h-4 w-4" /> Export center</EButton>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k, i) => <KpiCard key={k.key} stat={k} index={i} />)}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Surface className="p-5 xl:col-span-2">
          <SectionHeader title="Active user growth" description="Monthly active users, trailing 12 months" />
          <div className="mt-4"><AreaTrend data={adoption} dataKey="users" xKey="m" color="#4F7CFF" height={240} /></div>
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
        <SectionHeader title="Feature adoption" description="Share of active users engaging with each capability" />
        <div className="mt-4"><BarSeries data={features} xKey="m" height={240} bars={[{ key: "adoption", color: "#22C55E", name: "Adoption %" }]} formatter={(v) => `${v}%`} /></div>
      </Surface>
    </div>
  );
}
