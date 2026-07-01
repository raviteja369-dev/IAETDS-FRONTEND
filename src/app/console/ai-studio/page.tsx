"use client";

import * as React from "react";
import { Bot, KeyRound, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import {
  IconTile,
  ProgressBar,
  SectionHeader,
  StatusPill,
  Surface,
} from "@/components/eoc/primitives";
import { AreaTrend } from "@/components/eoc/charts";
import { Modal, Field, TextInput, SelectInput } from "@/components/eoc/modal";
import { costSeries } from "@/lib/eoc/data";
import { useEocStore } from "@/lib/eoc/store";
import { formatCurrency } from "@/lib/eoc/format";

const models = [
  { name: "GPT-4o", usage: 64, tokens: "1.2B" },
  { name: "Claude 3.5 Sonnet", usage: 22, tokens: "412M" },
  { name: "Llama 3.1 70B", usage: 14, tokens: "264M" },
];

export default function AIStudioPage() {
  const agents = useEocStore((s) => s.agents);
  const addAgent = useEocStore((s) => s.addAgent);
  const activeCount = agents.filter((a) => a.status === "active").length;

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [model, setModel] = React.useState("GPT-4o");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter an agent name");
      return;
    }
    addAgent({ name: name.trim(), model });
    toast.success("Agent created", { description: `${name.trim()} (${model}) is now active.` });
    setName("");
    setModel("GPT-4o");
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Central intelligence"
        title="AI Studio"
        description="Build, deploy and govern AI agents, prompts, knowledge sources and workflows from a single intelligent platform."
        actions={
          <>
            <EButton variant="secondary" onClick={() => toast.info("API keys", { description: "Manage and rotate workspace API keys." })}><KeyRound className="h-4 w-4" /> API keys</EButton>
            <EButton variant="primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New agent</EButton>
          </>
        }
      />

      <Modal open={open} onOpenChange={setOpen} title="New agent" description="Deploy a new AI agent to your workspace.">
        <form onSubmit={submit} className="space-y-4 p-5">
          <Field label="Agent name" htmlFor="ag-name">
            <TextInput id="ag-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Contract Reviewer" autoFocus />
          </Field>
          <Field label="Model" htmlFor="ag-model">
            <SelectInput id="ag-model" value={model} onChange={(e) => setModel(e.target.value)}>
              <option>GPT-4o</option>
              <option>GPT-4o-mini</option>
              <option>Claude 3.5</option>
              <option>Llama 3.1</option>
            </SelectInput>
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <EButton type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</EButton>
            <EButton type="submit" variant="primary">Create agent</EButton>
          </div>
        </form>
      </Modal>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Active agents" value={String(activeCount)} />
        <Stat label="Total agents" value={String(agents.length)} />
        <Stat label="Avg success" value={agents.length ? `${Math.round(agents.reduce((s, a) => s + a.success, 0) / agents.length)}%` : "—"} />
        <Stat label="AI spend (mo)" value="₹6,300" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <SectionHeader title="AI agents" description="Autonomous agents deployed across your workspace" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {agents.map((a) => (
              <Surface key={a.name} hover className="p-4">
                <div className="flex items-start gap-3">
                  <IconTile icon={Bot} accent="#A855F7" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-eoc-fg">{a.name}</p>
                    <p className="text-xs text-eoc-muted">{a.model} · {a.calls} calls</p>
                  </div>
                  <StatusPill tone={a.status === "active" ? "success" : "neutral"} dot={a.status === "active"}>{a.status}</StatusPill>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-[11px] text-eoc-muted"><span>Success rate</span><span>{a.success}%</span></div>
                  <ProgressBar value={a.success} tone="success" />
                </div>
              </Surface>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Surface className="p-5">
            <SectionHeader title="Model usage" description="Token share this month" />
            <div className="mt-4 space-y-4">
              {models.map((m) => (
                <div key={m.name}>
                  <div className="mb-1 flex justify-between text-xs"><span className="text-eoc-fg">{m.name}</span><span className="text-eoc-muted">{m.tokens}</span></div>
                  <ProgressBar value={m.usage} tone="info" />
                </div>
              ))}
            </div>
          </Surface>
          <Surface className="p-5">
            <SectionHeader title="AI spend trend" />
            <div className="mt-3"><AreaTrend data={costSeries.slice(6)} dataKey="cost" xKey="m" color="#A855F7" height={150} formatter={(v) => formatCurrency(v)} /></div>
          </Surface>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Surface hover className="p-5">
      <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-eoc-accent" /><p className="text-xs text-eoc-muted">{label}</p></div>
      <p className="mt-2 text-2xl font-semibold text-eoc-fg">{value}</p>
    </Surface>
  );
}
