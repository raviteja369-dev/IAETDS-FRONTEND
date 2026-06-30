"use client";

import * as React from "react";
import { BookOpen, FileText, Plus, Search, Sparkles } from "lucide-react";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import { IconTile, SectionHeader, StatusPill, Surface } from "@/components/eoc/primitives";

const collections = [
  { name: "Engineering Runbooks", docs: 142, updated: "2h ago", accent: "#4F7CFF" },
  { name: "Security Policies", docs: 68, updated: "1d ago", accent: "#EF4444" },
  { name: "Onboarding Playbooks", docs: 54, updated: "3d ago", accent: "#22C55E" },
  { name: "Finance Procedures", docs: 39, updated: "5d ago", accent: "#F59E0B" },
  { name: "Product Wiki", docs: 211, updated: "6h ago", accent: "#A855F7" },
  { name: "Compliance Library", docs: 87, updated: "Yesterday", accent: "#3B82F6" },
];

const recent = [
  { title: "Incident response runbook v4", author: "Meera Iyer", at: "2h ago" },
  { title: "Q3 budget approval workflow", author: "Kabir Singh", at: "5h ago" },
  { title: "Zero-trust access policy", author: "Riya Kapoor", at: "Yesterday" },
  { title: "New hire IT provisioning", author: "People Ops", at: "2d ago" },
];

export default function KnowledgePage() {
  const [query, setQuery] = React.useState("");
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Knowledge hub"
        title="Knowledge"
        description="Documentation, policies, playbooks and runbooks with AI search and version history."
        actions={<EButton variant="primary"><Plus className="h-4 w-4" /> New document</EButton>}
      />

      <Surface className="flex items-center gap-3 border-eoc-accent/30 bg-eoc-accent/[0.05] p-4">
        <Sparkles className="h-5 w-5 shrink-0 text-eoc-accent" />
        <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-eoc-border bg-eoc-bg/40 px-3">
          <Search className="h-4 w-4 text-eoc-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask anything — AI search across all knowledge…" className="flex-1 bg-transparent text-sm text-eoc-fg outline-none placeholder:text-eoc-muted" />
        </div>
        <EButton variant="primary" className="hidden sm:flex">Search</EButton>
      </Surface>

      <div>
        <SectionHeader title="Collections" description="Organized knowledge spaces" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {collections.map((c) => (
            <Surface key={c.name} hover className="flex items-center gap-3 p-4">
              <IconTile icon={BookOpen} accent={c.accent} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-eoc-fg">{c.name}</p>
                <p className="text-xs text-eoc-muted">{c.docs} documents · updated {c.updated}</p>
              </div>
            </Surface>
          ))}
        </div>
      </div>

      <Surface className="p-5">
        <SectionHeader title="Recently updated" />
        <ul className="mt-4 space-y-2.5">
          {recent.map((r) => (
            <li key={r.title} className="flex items-center gap-3 rounded-xl border border-eoc-border bg-white/[0.02] p-3.5">
              <FileText className="h-4 w-4 text-eoc-muted" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-eoc-fg">{r.title}</p>
                <p className="text-[11px] text-eoc-muted">{r.author} · {r.at}</p>
              </div>
              <StatusPill tone="neutral">Doc</StatusPill>
            </li>
          ))}
        </ul>
      </Surface>
    </div>
  );
}
