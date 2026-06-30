"use client";

import * as React from "react";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import {
  ProgressBar,
  ScoreRing,
  SectionHeader,
  StatusPill,
  Surface,
  type Tone,
} from "@/components/eoc/primitives";
import { complianceFrameworks } from "@/lib/eoc/data";
import { useEocStore } from "@/lib/eoc/store";
import { cn } from "@/lib/utils";

const sevTone: Record<string, Tone> = { critical: "danger", high: "danger", medium: "warning", low: "neutral" };
const statusTone: Record<string, Tone> = { open: "danger", investigating: "warning", mitigated: "info", resolved: "success" };
const fwTone: Record<string, Tone> = { certified: "success", in_progress: "warning", gap: "danger" };

const heat = [
  ["Identity", 2, 1, 0, 0],
  ["Network", 0, 1, 1, 0],
  ["Data", 1, 0, 2, 0],
  ["Application", 0, 2, 1, 1],
  ["Endpoint", 0, 0, 1, 0],
];
const heatColor = (v: number) =>
  v === 0 ? "bg-white/[0.03]" : v === 1 ? "bg-eoc-warning/25" : v === 2 ? "bg-eoc-warning/50" : "bg-eoc-danger/60";

export default function SecurityPage() {
  const securityFindings = useEocStore((s) => s.securityFindings);
  const setFindingStatus = useEocStore((s) => s.setFindingStatus);

  const openCount = securityFindings.filter((f) => f.status === "open" || f.status === "investigating").length;
  const criticalCount = securityFindings.filter((f) => f.severity === "critical" && f.status !== "resolved").length;

  const runScan = () => {
    const id = toast.loading("Running security scan…");
    setTimeout(() => toast.success("Scan complete — no new critical findings", { id }), 1400);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Security command center"
        title="Security Center"
        description="Threat detection, identity protection, vulnerability management, and compliance — a zero-trust view of your entire estate."
        actions={
          <>
            <EButton variant="secondary" onClick={() => toast.success("Risk report generated", { description: "Exported to your downloads." })}>Risk report</EButton>
            <EButton variant="primary" onClick={runScan}><ShieldCheck className="h-4 w-4" /> Run scan</EButton>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Surface className="flex items-center gap-5 p-6">
          <ScoreRing value={94} label="Secure" sub="/100" color="#22C55E" />
          <div>
            <p className="text-sm font-semibold text-eoc-fg">Security score</p>
            <p className="mt-1 text-xs text-eoc-fg2">Up 2.1 points this week</p>
            <div className="mt-3 space-y-1.5 text-xs">
              <Row label="Threats blocked (24h)" value="318" />
              <Row label="Open findings" value={String(openCount)} />
              <Row label="Critical" value={String(criticalCount)} />
            </div>
          </div>
        </Surface>

        <Surface className="p-6 lg:col-span-2">
          <SectionHeader title="Risk heatmap" description="Findings by domain and severity" />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-eoc-muted">
                  <th className="pb-2 text-left font-medium">Domain</th>
                  <th className="pb-2 font-medium">Critical</th>
                  <th className="pb-2 font-medium">High</th>
                  <th className="pb-2 font-medium">Medium</th>
                  <th className="pb-2 font-medium">Low</th>
                </tr>
              </thead>
              <tbody>
                {heat.map(([name, ...vals]) => (
                  <tr key={name as string}>
                    <td className="py-1.5 pr-3 text-left text-eoc-fg2">{name}</td>
                    {(vals as number[]).map((v, i) => (
                      <td key={i} className="px-1 py-1.5">
                        <div className={cn("mx-auto flex h-9 w-full items-center justify-center rounded-lg font-semibold text-eoc-fg", heatColor(v))}>
                          {v || ""}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Surface>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Surface className="p-5 xl:col-span-2">
          <SectionHeader title="Active findings" description="Detected threats, vulnerabilities and misconfigurations" action={<StatusPill tone="success" dot>Auto-protected</StatusPill>} />
          <div className="mt-4 space-y-2.5">
            {securityFindings.map((f) => (
              <div key={f.id} className="flex items-center gap-3 rounded-xl border border-eoc-border bg-white/[0.02] p-3.5">
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", f.severity === "critical" || f.severity === "high" ? "bg-eoc-danger/12 text-eoc-danger" : "bg-eoc-warning/12 text-eoc-warning")}>
                  <ShieldAlert className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-eoc-fg">{f.title}</p>
                  <p className="text-[11px] text-eoc-muted">
                    {f.app} · {f.type} · {f.detected}{f.cve ? ` · ${f.cve}` : ""}
                  </p>
                </div>
                <StatusPill tone={sevTone[f.severity]}>{f.severity}</StatusPill>
                <StatusPill tone={statusTone[f.status]}>{f.status}</StatusPill>
                {f.status !== "resolved" && (
                  <EButton
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setFindingStatus(f.id, f.status === "open" ? "investigating" : "resolved");
                      toast.success(f.status === "open" ? "Investigation started" : `${f.title} resolved`);
                    }}
                  >
                    {f.status === "open" ? "Investigate" : "Resolve"}
                  </EButton>
                )}
              </div>
            ))}
          </div>
        </Surface>

        <Surface className="p-5">
          <SectionHeader title="Compliance frameworks" description="Continuous control monitoring" />
          <div className="mt-4 space-y-4">
            {complianceFrameworks.map((fw) => (
              <div key={fw.key}>
                <div className="mb-1.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-eoc-fg">{fw.name}</p>
                    <p className="text-[11px] text-eoc-muted">{fw.controls.passed}/{fw.controls.total} controls</p>
                  </div>
                  <StatusPill tone={fwTone[fw.status]}>{fw.status.replace("_", " ")}</StatusPill>
                </div>
                <ProgressBar value={fw.score} tone={fw.score >= 95 ? "success" : "warning"} />
              </div>
            ))}
          </div>
        </Surface>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-eoc-muted">{label}</span>
      <span className="font-medium text-eoc-fg">{value}</span>
    </div>
  );
}
