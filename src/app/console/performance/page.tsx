"use client";

import * as React from "react";
import { Gauge, Sparkles, Zap } from "lucide-react";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import {
  Delta,
  ProgressBar,
  SectionHeader,
  Sparkline,
  StatusPill,
  Surface,
} from "@/components/eoc/primitives";
import { MultiLine } from "@/components/eoc/charts";
import { applications, perfMetrics, responseSeries } from "@/lib/eoc/data";

const toneColor: Record<string, string> = { success: "#22C55E", warning: "#F59E0B", danger: "#EF4444", default: "#4F7CFF" };

export default function PerformancePage() {
  const slow = [...applications].sort((a, b) => b.cpu - a.cpu).slice(0, 5);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Application intelligence"
        title="Performance Center"
        description="Latency, throughput, error rates and capacity forecasting with AI-driven bottleneck detection and cost optimization."
        actions={<EButton variant="primary"><Gauge className="h-4 w-4" /> Optimize</EButton>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {perfMetrics.map((m) => (
          <Surface key={m.key} hover className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-eoc-fg2">{m.label}</p>
              <Delta value={m.delta} />
            </div>
            <p className="mt-2 text-2xl font-semibold text-eoc-fg">
              {m.value}<span className="ml-1 text-sm font-normal text-eoc-muted">{m.unit}</span>
            </p>
            <div className="mt-2 opacity-80">
              <Sparkline data={m.series} color={toneColor[m.tone ?? "default"]} height={32} />
            </div>
          </Surface>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Surface className="p-5 xl:col-span-2">
          <SectionHeader title="Latency distribution" description="P50 / P95 / P99 response time over 24h" action={<StatusPill tone="success" dot>Healthy</StatusPill>} />
          <div className="mt-4">
            <MultiLine
              data={responseSeries}
              xKey="t"
              height={260}
              formatter={(v) => `${v}ms`}
              lines={[
                { key: "p50", color: "#22C55E", name: "P50" },
                { key: "p95", color: "#F59E0B", name: "P95" },
                { key: "p99", color: "#EF4444", name: "P99" },
              ]}
            />
          </div>
        </Surface>

        <Surface className="border-eoc-accent/30 bg-eoc-accent/[0.05] p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-eoc-accent" />
            <p className="text-xs font-semibold uppercase tracking-wider text-eoc-accent">AI Performance Insights</p>
          </div>
          <ul className="mt-3 space-y-3 text-sm text-eoc-fg2">
            <li className="flex gap-2"><Zap className="mt-0.5 h-4 w-4 shrink-0 text-eoc-warning" /> Insight Analytics P99 driven by 3 unindexed queries — adding a composite index could cut latency ~34%.</li>
            <li className="flex gap-2"><Zap className="mt-0.5 h-4 w-4 shrink-0 text-eoc-success" /> Helio CRM throughput headroom is 62% — safe to consolidate one capacity unit, saving ~₹420/mo.</li>
            <li className="flex gap-2"><Zap className="mt-0.5 h-4 w-4 shrink-0 text-eoc-danger" /> Beacon Marketing approaching memory limit — forecast breach in 72h under launch load.</li>
          </ul>
          <EButton size="sm" variant="primary" className="mt-4">View all 8 insights</EButton>
        </Surface>
      </div>

      <Surface className="p-5">
        <SectionHeader title="Resource utilization by application" description="Highest CPU consumers — bottleneck candidates" />
        <div className="mt-4 space-y-4">
          {slow.map((a) => (
            <div key={a.id} className="grid grid-cols-12 items-center gap-3">
              <p className="col-span-4 truncate text-sm text-eoc-fg sm:col-span-3">{a.name}</p>
              <div className="col-span-5 sm:col-span-7">
                <ProgressBar value={a.cpu} tone={a.cpu > 70 ? "danger" : a.cpu > 50 ? "warning" : "success"} />
              </div>
              <p className="col-span-3 text-right text-xs text-eoc-fg2 sm:col-span-2">{a.cpu}% CPU · {a.memory}% MEM</p>
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}
