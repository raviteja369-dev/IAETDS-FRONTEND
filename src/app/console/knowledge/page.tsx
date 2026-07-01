"use client";

import * as React from "react";
import { BookOpen, FileText, Plus, Search, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import { IconTile, SectionHeader, StatusPill, Surface } from "@/components/eoc/primitives";
import { Modal, Field, TextInput } from "@/components/eoc/modal";
import { useEocStore } from "@/lib/eoc/store";
import { knowledgeDocSchema, type KnowledgeDocInput } from "@/lib/eoc/validation";

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
  const deleteDoc = useEocStore((s) => s.deleteDoc);
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const filtered = recent.filter((d) =>
    !query.trim() || d.title.toLowerCase().includes(query.toLowerCase()) || d.author.toLowerCase().includes(query.toLowerCase()),
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm<KnowledgeDocInput>({
    resolver: zodResolver(knowledgeDocSchema),
    defaultValues: { title: "" },
  });

  const onSubmit = handleSubmit((data) => {
    setSubmitting(true);
    const result = addDoc({ title: data.title, author: "You", at: "just now" });
    setSubmitting(false);
    if (!result.ok) {
      toast.error(result.error ?? "Could not create document");
      return;
    }
    toast.success("Document created", { description: `${data.title} added to the library.` });
    reset();
    setOpen(false);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Knowledge hub"
        title="Knowledge"
        description="Documentation, policies, playbooks and runbooks with AI search and version history."
        actions={<EButton variant="primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New document</EButton>}
      />

      <Modal open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }} title="New document" description="Create a new knowledge document.">
        <form onSubmit={onSubmit} className="space-y-4 p-5">
          <Field label="Document title" htmlFor="doc-title" error={errors.title?.message}>
            <TextInput id="doc-title" {...register("title")} placeholder="e.g. Disaster recovery runbook" autoFocus />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <EButton type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</EButton>
            <EButton type="submit" variant="primary" disabled={submitting}>{submitting ? "Creating…" : "Create document"}</EButton>
          </div>
        </form>
      </Modal>

      <Surface className="flex items-center gap-3 border-eoc-accent/30 bg-eoc-accent/[0.05] p-4">
        <Sparkles className="h-5 w-5 shrink-0 text-eoc-accent" />
        <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-eoc-border bg-eoc-bg/40 px-3">
          <Search className="h-4 w-4 text-eoc-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search documents by title or author…" className="flex-1 bg-transparent text-sm text-eoc-fg outline-none placeholder:text-eoc-muted" />
        </div>
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
        <SectionHeader title="Recently updated" description={`${filtered.length} documents`} />
        <ul className="mt-4 space-y-2.5">
          {filtered.length === 0 ? (
            <li className="py-6 text-center text-sm text-eoc-muted">No documents match your search.</li>
          ) : filtered.map((r) => (
            <li key={r.id} className="flex items-center gap-3 rounded-xl border border-eoc-border bg-white/[0.02] p-3.5">
              <FileText className="h-4 w-4 text-eoc-muted" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-eoc-fg">{r.title}</p>
                <p className="text-[11px] text-eoc-muted">{r.author} · {r.at}</p>
              </div>
              <StatusPill tone="neutral">Doc</StatusPill>
              <button onClick={() => { deleteDoc(r.id); toast.success("Document deleted"); }} className="text-xs text-eoc-danger hover:text-eoc-fg">Delete</button>
            </li>
          ))}
        </ul>
      </Surface>
    </div>
  );
}
