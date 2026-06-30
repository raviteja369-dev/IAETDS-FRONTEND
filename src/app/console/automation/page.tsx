"use client";

import * as React from "react";
import { Plus, Workflow, Zap } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import {
  IconTile,
  SectionHeader,
  StatusPill,
  Surface,
  type Tone,
} from "@/components/eoc/primitives";
import { BarSeries } from "@/components/eoc/charts";
import { Modal, Field, TextInput } from "@/components/eoc/modal";

type Flow = { name: string; trigger: string; runs: string; success: number; status: string };

const initialFlows: Flow[] = [
  { name: "Auto-remediate degraded apps", trigger: "Health < 80%", runs: "1,204", success: 99.4, status: "active" },
  { name: "Onboard new employee", trigger: "HR: new hire", runs: "318", success: 100, status: "active" },
  { name: "Invoice overdue escalation", trigger: "Invoice overdue", runs: "92", success: 98.9, status: "active" },
  { name: "Security incident response", trigger: "Critical finding", runs: "47", success: 100, status: "active" },
  { name: "Scale on traffic spike", trigger: "CPU > 75%", runs: "612", success: 99.8, status: "active" },
  { name: "Nightly backup verification", trigger: "Schedule 03:00", runs: "180", success: 100, status: "paused" },
];

const runSeries = Array.from({ length: 7 }, (_, i) => ({
  m: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
  success: 1200 + Math.round(Math.random() * 600),
  failed: Math.round(Math.random() * 30),
}));

export default function AutomationPage() {
  const [flows, setFlows] = React.useState<Flow[]>(initialFlows);

  const toggle = (name: string) =>
    setFlows((prev) =>
      prev.map((f) => {
        if (f.name !== name) return f;
        const status = f.status === "active" ? "paused" : "active";
        toast.success(`${f.name} ${status === "active" ? "activated" : "paused"}`);
        return { ...f, status };
      }),
    );

  const run = (name: string) =>
    setFlows((prev) =>
      prev.map((f) => {
        if (f.name !== name) return f;
        const runs = (parseInt(f.runs.replace(/,/g, ""), 10) + 1).toLocaleString("en-IN");
        toast.success(`${f.name} executed`, { description: "Run completed successfully." });
        return { ...f, runs };
      }),
    );

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [trigger, setTrigger] = React.useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !trigger.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setFlows((prev) => [{ name: name.trim(), trigger: trigger.trim(), runs: "0", success: 100, status: "active" }, ...prev]);
    toast.success("Workflow created", { description: `${name.trim()} is now active.` });
    setName("");
    setTrigger("");
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workflow engine"
        title="Automation"
        description="Trigger-based workflows, approvals and AI actions that run your operations automatically — with full execution history."
        actions={<EButton variant="primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New workflow</EButton>}
      />

      <Modal open={open} onOpenChange={setOpen} title="New workflow" description="Define what triggers this workflow.">
        <form onSubmit={submit} className="space-y-4 p-5">
          <Field label="Workflow name" htmlFor="wf-name">
            <TextInput id="wf-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Auto-scale on traffic spike" autoFocus />
          </Field>
          <Field label="Trigger" htmlFor="wf-trigger" hint="The condition or event that starts this workflow.">
            <TextInput id="wf-trigger" value={trigger} onChange={(e) => setTrigger(e.target.value)} placeholder="e.g. CPU > 75%" />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <EButton type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</EButton>
            <EButton type="submit" variant="primary">Create workflow</EButton>
          </div>
        </form>
      </Modal>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Active workflows" value="24" tone="info" />
        <Stat label="Runs this week" value="9,142" tone="neutral" />
        <Stat label="Success rate" value="99.2%" tone="success" />
        <Stat label="Hours saved (mo)" value="1,180" tone="success" />
      </div>

      <Surface className="p-5">
        <SectionHeader title="Execution volume" description="Successful vs failed runs over the last 7 days" />
        <div className="mt-4">
          <BarSeries data={runSeries} xKey="m" height={220} bars={[{ key: "success", color: "#22C55E", name: "Success" }, { key: "failed", color: "#EF4444", name: "Failed" }]} />
        </div>
      </Surface>

      <Surface className="p-5">
        <SectionHeader title="Workflows" />
        <div className="mt-4 space-y-2.5">
          {flows.map((f) => (
            <div key={f.name} className="flex items-center gap-3 rounded-xl border border-eoc-border bg-white/[0.02] p-3.5">
              <IconTile icon={Workflow} accent="#4F7CFF" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-eoc-fg">{f.name}</p>
                <p className="flex items-center gap-1 text-[11px] text-eoc-muted"><Zap className="h-3 w-3" /> {f.trigger}</p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-sm text-eoc-fg">{f.runs}</p>
                <p className="text-[11px] text-eoc-muted">runs</p>
              </div>
              <div className="hidden text-right md:block">
                <p className="text-sm text-eoc-success">{f.success}%</p>
                <p className="text-[11px] text-eoc-muted">success</p>
              </div>
              <StatusPill tone={f.status === "active" ? "success" : "warning"} dot={f.status === "active"}>{f.status}</StatusPill>
              <div className="flex items-center gap-1.5">
                <EButton size="sm" variant="secondary" onClick={() => run(f.name)}>Run</EButton>
                <EButton size="sm" variant="ghost" onClick={() => toggle(f.name)}>{f.status === "active" ? "Pause" : "Activate"}</EButton>
              </div>
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  const map: Record<string, string> = { success: "text-eoc-success", warning: "text-eoc-warning", info: "text-eoc-info", danger: "text-eoc-danger", neutral: "text-eoc-fg" };
  return (
    <Surface hover className="p-5">
      <p className="text-xs text-eoc-muted">{label}</p>
      <p className={`mt-1.5 text-2xl font-semibold ${map[tone]}`}>{value}</p>
    </Surface>
  );
}
