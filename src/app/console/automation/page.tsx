"use client";

import * as React from "react";
import { Plus, Workflow, Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { selectFlowSuccessRate } from "@/lib/eoc/selectors";
import { useEocStore } from "@/lib/eoc/store";
import { workflowSchema, type WorkflowInput } from "@/lib/eoc/validation";

const runSeries = Array.from({ length: 7 }, (_, i) => ({
  m: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
  success: 1200 + Math.round(Math.random() * 600),
  failed: Math.round(Math.random() * 30),
}));

export default function AutomationPage() {
  const flows = useEocStore((s) => s.flows);
  const addFlow = useEocStore((s) => s.addFlow);
  const toggleFlow = useEocStore((s) => s.toggleFlow);
  const runFlow = useEocStore((s) => s.runFlow);
  const deleteFlow = useEocStore((s) => s.deleteFlow);
  const successRate = selectFlowSuccessRate({ flows } as Parameters<typeof selectFlowSuccessRate>[0]);

  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<WorkflowInput>({
    resolver: zodResolver(workflowSchema),
    defaultValues: { name: "", trigger: "" },
  });

  const onSubmit = handleSubmit((data) => {
    setSubmitting(true);
    const result = addFlow(data);
    setSubmitting(false);
    if (!result.ok) {
      toast.error(result.error ?? "Could not create workflow");
      return;
    }
    toast.success("Workflow created", { description: `${data.name} is now active.` });
    reset();
    setOpen(false);
  });

  const toggle = (name: string) => {
    const flow = flows.find((f) => f.name === name);
    toggleFlow(name);
    toast.success(`${name} ${flow?.status === "active" ? "paused" : "activated"}`);
  };

  const run = (name: string) => {
    const flow = flows.find((f) => f.name === name);
    if (flow?.status !== "active") {
      toast.error("Activate the workflow before running it");
      return;
    }
    runFlow(name);
    toast.success(`${name} executed`, { description: "Run completed successfully." });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workflow engine"
        title="Automation"
        description="Trigger-based workflows, approvals and AI actions that run your operations automatically — with full execution history."
        actions={<EButton variant="primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New workflow</EButton>}
      />

      <Modal open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }} title="New workflow" description="Define what triggers this workflow.">
        <form onSubmit={onSubmit} className="space-y-4 p-5">
          <Field label="Workflow name" htmlFor="wf-name" error={errors.name?.message}>
            <TextInput id="wf-name" {...register("name")} placeholder="e.g. Auto-scale on traffic spike" autoFocus />
          </Field>
          <Field label="Trigger" htmlFor="wf-trigger" hint="The condition or event that starts this workflow." error={errors.trigger?.message}>
            <TextInput id="wf-trigger" {...register("trigger")} placeholder="e.g. CPU > 75%" />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <EButton type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</EButton>
            <EButton type="submit" variant="primary" disabled={submitting}>{submitting ? "Creating…" : "Create workflow"}</EButton>
          </div>
        </form>
      </Modal>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Active workflows" value={String(flows.filter((f) => f.status === "active").length)} tone="info" />
        <Stat label="Total workflows" value={String(flows.length)} tone="neutral" />
        <Stat label="Success rate" value={`${successRate}%`} tone="success" />
        <Stat label="Total runs" value={flows.reduce((s, f) => s + parseInt(f.runs.replace(/,/g, "") || "0", 10), 0).toLocaleString("en-IN")} tone="success" />
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
                <EButton size="sm" variant="ghost" className="text-eoc-danger" onClick={() => { deleteFlow(f.name); toast.success("Workflow deleted"); }}>Delete</EButton>
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
