"use client";

import * as React from "react";
import { Download, TrendingUp } from "lucide-react";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import { KpiCard } from "@/components/eoc/cards";
import {
  DonutChart,
  AreaTrend,
  BarSeries,
} from "@/components/eoc/charts";
import { SectionHeader, Surface } from "@/components/eoc/primitives";
import { financeKpis, revenueSeries } from "@/lib/eoc/data";
import { formatCurrency } from "@/lib/eoc/format";

const segments = [
  { name: "Enterprise", value: 58, color: "#4F7CFF" },
  { name: "Business", value: 26, color: "#22C55E" },
  { name: "Professional", value: 12, color: "#F59E0B" },
  { name: "Trial", value: 4, color: "#71717A" },
];

const mrrTrend = revenueSeries.map((r) => ({ m: r.m, cost: r.mrr }));

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Executive finance"
        title="Finance"
        description="Revenue, growth, retention and collections — interactive financial intelligence for leadership."
        actions={<EButton variant="secondary"><Download className="h-4 w-4" /> Export</EButton>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {financeKpis.map((k, i) => (
          <KpiCard key={k.key} stat={k} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Surface className="p-5 xl:col-span-2">
          <SectionHeader title="MRR growth" description="Monthly recurring revenue, trailing 12 months" action={<span className="flex items-center gap-1 text-xs text-eoc-success"><TrendingUp className="h-3.5 w-3.5" /> +6.2%</span>} />
          <div className="mt-4">
            <AreaTrend data={mrrTrend} dataKey="cost" xKey="m" color="#22C55E" height={240} formatter={(v) => formatCurrency(v)} />
          </div>
        </Surface>

        <Surface className="p-5">
          <SectionHeader title="Revenue by segment" description="Share of MRR" />
          <div className="mt-4">
            <DonutChart data={segments} height={200} />
          </div>
          <div className="mt-4 space-y-2">
            {segments.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-eoc-fg2">{s.name}</span>
                <span className="ml-auto font-medium text-eoc-fg">{s.value}%</span>
              </div>
            ))}
          </div>
        </Surface>
      </div>

      <Surface className="p-5">
        <SectionHeader title="Expansion vs churn" description="Net revenue movement by month" />
        <div className="mt-4">
          <BarSeries
            data={revenueSeries}
            xKey="m"
            stacked
            height={260}
            formatter={(v) => formatCurrency(v)}
            bars={[
              { key: "expansion", color: "#22C55E", name: "Expansion" },
              { key: "churn", color: "#EF4444", name: "Churn" },
            ]}
          />
        </div>
      </Surface>
    </div>
  );
}
