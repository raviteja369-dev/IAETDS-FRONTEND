"use client";

import * as React from "react";
import { BookOpen, FileText, Plus, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import { IconTile, SectionHeader, StatusPill, Surface } from "@/components/eoc/primitives";
import { Modal, Field, TextInput } from "@/components/eoc/modal";
import { useEocStore } from "@/lib/eoc/store";

const collections = [
  { name: "Engineering Runbooks", docs: 142, updated: "2h ago", accent: "#4F7CFF" },
  { name: "Security Policies", docs: 68, updated: "1d ago", accent: "#EF4444" },
  { name: "Onboarding Playbooks", docs: 54, updated: "3d ago", accent: "#22C55E" },
  { name: "Finance Procedures", docs: 39, updated: "5d ago", accent: "#F59E0B" },
  { name: "Product Wiki", docs: 211, updated: "6h ago", accent: "#A855F7" },
  { name: "Compliance Library", docs: 87, updated: "Yesterday", accent: "#3B82F6" },
];

export default function KnowledgePage() {
  const [query, setQuery] = React.useState("");
  const recent = useEocStore((s) => s.docs);
  const addDoc = useEocStore((s) => s.addDoc);
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a document title");
      return;
    }
    addDoc({ title: title.trim(), author: "You", at: "just now" });
    toast.success("Document created", { description: `${title.trim()} added to the library.` });
    setTitle("");
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Knowledge hub"
        title="Knowledge"
        description="Documentation, policies, playbooks and runbooks with AI search and version history."
        actions={<EButton variant="primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New document</EButton>}
      />

      <Modal open={open} onOpenChange={setOpen} title="New document" description="Create a new knowledge document.">
        <form onSubmit={submit} className="space-y-4 p-5">
          <Field label="Document title" htmlFor="doc-title">
            <TextInput id="doc-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Disaster recovery runbook" autoFocus />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <EButton type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</EButton>
            <EButton type="submit" variant="primary">Create document</EButton>
          </div>
        </form>
      </Modal>

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
