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
import { downloadJson } from "@/lib/eoc/export";
import { selectSecurityScore } from "@/lib/eoc/selectors";
import { useEocStore } from "@/lib/eoc/store";

const sevTone: Record<string, Tone> = { critical: "danger", high: "danger", medium: "warning", low: "neutral" };
const statusTone: Record<string, Tone> = { open: "danger", investigating: "warning", mitigated: "info", resolved: "success" };
const fwTone: Record<string, Tone> = { certified: "success", in_progress: "warning", gap: "danger" };

export default function SecurityPage() {
  const state = useEocStore();
  const securityFindings = useEocStore((s) => s.securityFindings);
  const setFindingStatus = useEocStore((s) => s.setFindingStatus);
  const runSecurityScan = useEocStore((s) => s.runSecurityScan);
  const [scanning, setScanning] = React.useState(false);

  const openCount = securityFindings.filter((f) => f.status === "open" || f.status === "investigating").length;
  const criticalCount = securityFindings.filter((f) => f.severity === "critical" && f.status !== "resolved").length;
  const score = selectSecurityScore(state);

  const runScan = () => {
    setScanning(true);
    const id = toast.loading("Running security scan…");
    setTimeout(() => {
      const result = runSecurityScan();
      setScanning(false);
      toast.success(
        result.added ? "New finding detected" : "Scan advanced investigation",
        { id, description: result.added ? "A low-severity configuration drift was flagged." : "An open finding was moved to investigating." },
      );
    }, 1400);
  };

  const exportReport = () => {
    downloadJson(`security-report-${Date.now()}.json`, { score, findings: securityFindings });
    toast.success("Risk report exported", { description: "Security findings downloaded as JSON." });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Security command center"
        title="Security Center"
        description="Threat detection, identity protection, vulnerability management, and compliance — a zero-trust view of your entire estate."
        actions={
          <>
            <EButton variant="secondary" onClick={exportReport}>Risk report</EButton>
            <EButton variant="primary" onClick={runScan} disabled={scanning}><ShieldCheck className="h-4 w-4" /> {scanning ? "Scanning…" : "Run scan"}</EButton>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Surface className="flex items-center gap-5 p-6">
          <ScoreRing value={score} label="Secure" sub="/100" color="#22C55E" />
          <div>
            <p className="text-sm font-semibold text-eoc-fg">Security score</p>
            <p className="mt-1 text-xs text-eoc-fg2">Based on open and critical findings</p>
            <div className="mt-3 space-y-1.5 text-xs">
              <Row label="Open findings" value={String(openCount)} />
              <Row label="Critical" value={String(criticalCount)} />
            </div>
          </div>
        </Surface>

        <Surface className="p-6 lg:col-span-2">
          <SectionHeader title="Findings" description="Active security issues across your estate" />
          <div className="mt-4 space-y-3">
            {securityFindings.map((f) => (
              <div key={f.id} className="flex flex-col gap-3 rounded-xl border border-eoc-border bg-white/[0.02] p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-eoc-danger" />
                    <p className="truncate text-sm font-medium text-eoc-fg">{f.title}</p>
                    <StatusPill tone={sevTone[f.severity]}>{f.severity}</StatusPill>
                    <StatusPill tone={statusTone[f.status]}>{f.status}</StatusPill>
                  </div>
                  <p className="mt-1 text-xs text-eoc-muted">{f.app} · {f.type} · {f.detected}</p>
                </div>
                {f.status !== "resolved" && (
                  <EButton
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const next = f.status === "open" ? "investigating" : "resolved";
                      setFindingStatus(f.id, next);
                      toast.success(next === "investigating" ? "Investigation started" : `${f.title} resolved`);
                    }}
                  >
                    {f.status === "open" ? "Investigate" : "Resolve"}
                  </EButton>
                )}
              </div>
            ))}
          </div>
        </Surface>
      </div>

      <Surface className="p-5">
        <SectionHeader title="Compliance frameworks" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {complianceFrameworks.map((fw) => (
            <div key={fw.name} className="rounded-xl border border-eoc-border bg-white/[0.02] p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-eoc-fg">{fw.name}</p>
                <StatusPill tone={fwTone[fw.status]}>{fw.status.replace("_", " ")}</StatusPill>
              </div>
              <ProgressBar value={fw.score} tone={fw.score >= 90 ? "success" : fw.score >= 75 ? "warning" : "danger"} className="mt-3" />
              <p className="mt-2 text-xs text-eoc-muted">{fw.score}% compliant</p>
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-eoc-muted">{label}</span>
      <span className="font-medium text-eoc-fg">{value}</span>
    </div>
  );
}
