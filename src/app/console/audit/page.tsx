"use client";

import * as React from "react";
import { Download, Search } from "lucide-react";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import { SectionHeader, StatusPill, Surface, type Tone } from "@/components/eoc/primitives";
import { activity } from "@/lib/eoc/data";
import { cn } from "@/lib/utils";

const extended = [
  ...activity,
  { id: "x1", actor: "Diya Sharma", action: "exported dataset from", target: "Insight Analytics", category: "system" as const, at: "7h ago" },
  { id: "x2", actor: "System", action: "rotated API key for", target: "Stripe integration", category: "security" as const, at: "8h ago" },
  { id: "x3", actor: "Kabir Singh", action: "downloaded invoice", target: "INV-2026-0612", category: "billing" as const, at: "Yesterday" },
  { id: "x4", actor: "Meera Iyer", action: "updated role for", target: "Vivaan Rao", category: "access" as const, at: "Yesterday" },
  { id: "x5", actor: "Auto-Scaler", action: "scaled down", target: "Beacon Marketing", category: "system" as const, at: "2d ago" },
];

const catTone: Record<string, Tone> = { deploy: "info", security: "danger", billing: "success", maintenance: "warning", access: "info", system: "neutral" };
const FILTERS = ["all", "security", "billing", "access", "system", "deploy"] as const;

export default function AuditPage() {
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("all");
  const [query, setQuery] = React.useState("");
  const rows = extended.filter((e) => {
    const mc = filter === "all" || e.category === filter;
    const mq = !query || `${e.actor} ${e.action} ${e.target}`.toLowerCase().includes(query.toLowerCase());
    return mc && mq;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Compliance & governance"
        title="Audit Logs"
        description="An immutable, searchable timeline of every action across users, applications, security, and billing."
        actions={<EButton variant="secondary"><Download className="h-4 w-4" /> Export logs</EButton>}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-eoc-border bg-white/[0.03] px-3">
          <Search className="h-4 w-4 text-eoc-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search audit events…" className="flex-1 bg-transparent text-sm text-eoc-fg outline-none placeholder:text-eoc-muted" />
        </div>
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-eoc-border bg-white/[0.03] p-1">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn("rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors", filter === f ? "bg-white/10 text-eoc-fg" : "text-eoc-muted hover:text-eoc-fg2")}>{f}</button>
          ))}
        </div>
      </div>

      <Surface className="p-5">
        <SectionHeader title="Event timeline" description={`${rows.length} events`} />
        <div className="relative mt-5">
          <div className="absolute bottom-2 left-[7px] top-2 w-px bg-eoc-border" />
          <ul className="space-y-5">
            {rows.map((e) => (
              <li key={e.id} className="relative flex items-start gap-4 pl-6">
                <span className={cn("absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-eoc-card", {
                  "bg-eoc-info": catTone[e.category] === "info",
                  "bg-eoc-danger": catTone[e.category] === "danger",
                  "bg-eoc-success": catTone[e.category] === "success",
                  "bg-eoc-warning": catTone[e.category] === "warning",
                  "bg-eoc-muted": catTone[e.category] === "neutral",
                })} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-eoc-fg2">
                    <span className="font-medium text-eoc-fg">{e.actor}</span> {e.action}{" "}
                    <span className="font-medium text-eoc-fg">{e.target}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-eoc-muted">{e.at}</p>
                </div>
                <StatusPill tone={catTone[e.category]}>{e.category}</StatusPill>
              </li>
            ))}
          </ul>
        </div>
      </Surface>
    </div>
  );
}
