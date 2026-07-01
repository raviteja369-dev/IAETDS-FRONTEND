"use client";

import * as React from "react";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import { SectionHeader, StatusPill, Surface, type Tone } from "@/components/eoc/primitives";
import { downloadText } from "@/lib/eoc/export";
import { selectAuditEvents } from "@/lib/eoc/selectors";
import { useEocStore } from "@/lib/eoc/store";
import { cn } from "@/lib/utils";

const catTone: Record<string, Tone> = { deploy: "info", security: "danger", billing: "success", maintenance: "warning", access: "info", system: "neutral" };
const FILTERS = ["all", "security", "billing", "access", "system", "deploy", "maintenance"] as const;

export default function AuditPage() {
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("all");
  const [query, setQuery] = React.useState("");
  const auditEvents = useEocStore(selectAuditEvents);
  const rows = auditEvents.filter((e) => {
    const mc = filter === "all" || e.category === filter;
    const mq = !query || `${e.actor} ${e.action} ${e.target}`.toLowerCase().includes(query.toLowerCase());
    return mc && mq;
  });

  const exportLogs = () => {
    const csv = ["actor,action,target,category,at", ...rows.map((e) => `"${e.actor}","${e.action}","${e.target}","${e.category}","${e.at}"`)].join("\n");
    downloadText(`audit-logs-${Date.now()}.csv`, csv, "text/csv");
    toast.success("Audit logs exported", { description: `${rows.length} events downloaded.` });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Compliance & governance"
        title="Audit Logs"
        description="An immutable, searchable timeline of every action across users, applications, security, and billing."
        actions={<EButton variant="secondary" onClick={exportLogs}><Download className="h-4 w-4" /> Export logs</EButton>}
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
            {rows.length === 0 ? (
              <li className="pl-6 text-sm text-eoc-muted">No audit events match your filters.</li>
            ) : rows.map((e) => (
              <li key={e.id} className="relative flex items-start gap-4 pl-6">
                <span className={cn("absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-eoc-card", {
                  "bg-eoc-info": catTone[e.category] === "info",
                  "bg-eoc-danger": catTone[e.category] === "danger",
                  "bg-eoc-success": catTone[e.category] === "success",
                  "bg-eoc-warning": catTone[e.category] === "warning",
                  "bg-eoc-muted": catTone[e.category] === "neutral",
                })} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-eoc-fg">
                    <span className="font-medium">{e.actor}</span> {e.action} <span className="text-eoc-fg2">{e.target}</span>
                  </p>
                  <p className="mt-1 text-[11px] text-eoc-muted">{e.at}</p>
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
