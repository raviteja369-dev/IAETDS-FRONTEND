import type { ActivityEvent, Deployment, ScoreCard } from "./types";
import type { EocState } from "./store";

type Slice = Pick<
  EocState,
  | "applications"
  | "maintenanceTasks"
  | "securityFindings"
  | "members"
  | "flows"
  | "agents"
  | "invoices"
  | "subscriptions"
  | "walletBalance"
  | "transactions"
  | "deployments"
  | "settings"
  | "storageAdditions"
  | "integrations"
>;

export function selectActiveApps(s: Slice) {
  return s.applications.filter((a) => a.status !== "retired");
}

export function selectMonthlySpend(s: Slice) {
  const fromSubs = s.subscriptions.filter((x) => x.status === "active").reduce((sum, x) => sum + x.amount, 0);
  if (fromSubs > 0) return fromSubs;
  return selectActiveApps(s).reduce((sum, a) => sum + a.monthlyCost, 0);
}

export function selectOutstanding(s: Slice) {
  return s.invoices.filter((i) => i.status !== "paid").reduce((sum, i) => sum + i.amount, 0);
}

export function selectOpenMaintenance(s: Slice) {
  return s.maintenanceTasks.filter((t) => t.status !== "completed");
}

export function selectOpenFindings(s: Slice) {
  return s.securityFindings.filter((f) => f.status === "open" || f.status === "investigating");
}

export function selectSecurityScore(s: Slice) {
  const open = selectOpenFindings(s).length;
  const critical = s.securityFindings.filter((f) => f.severity === "critical" && f.status !== "resolved").length;
  return Math.max(0, Math.min(100, 100 - open * 2 - critical * 8));
}

export function selectSpendByApp(s: Slice) {
  return [...selectActiveApps(s)]
    .sort((a, b) => b.monthlyCost - a.monthlyCost)
    .slice(0, 6)
    .map((a) => ({ m: a.name, cost: a.monthlyCost }));
}

export function selectDashboardStats(s: Slice): ScoreCard[] {
  const apps = selectActiveApps(s);
  const openMaint = selectOpenMaintenance(s).length;
  const openSec = selectOpenFindings(s).length;
  const spend = selectMonthlySpend(s);
  return [
    { key: "apps", label: "Active applications", value: apps.length, delta: 0, spark: apps.map((a) => a.health) },
    { key: "maint", label: "Open maintenance", value: openMaint, delta: 0, spark: [openMaint, openMaint, openMaint], tone: openMaint > 3 ? "warning" : "default" },
    { key: "sec", label: "Open findings", value: openSec, delta: 0, spark: [openSec, openSec, openSec], tone: openSec > 0 ? "warning" : "success" },
    { key: "spend", label: "Monthly spend", value: spend, unit: "₹", delta: -2.1, spark: [spend * 0.9, spend * 0.95, spend], tone: "default" },
  ];
}

export function selectRecentDeployments(s: Slice): Deployment[] {
  return s.deployments.slice(0, 8);
}

export function selectAuditEvents(s: { auditEvents: ActivityEvent[] }): ActivityEvent[] {
  return s.auditEvents;
}

export function selectFlowSuccessRate(s: Slice) {
  if (!s.flows.length) return 0;
  return Math.round(s.flows.reduce((sum, f) => sum + f.success, 0) / s.flows.length);
}

export function selectStorageUsedTb(s: Slice) {
  const base = 4.2;
  const added = s.storageAdditions.reduce((sum, a) => sum + a.amount * 0.05, 0);
  return Math.round((base + added) * 10) / 10;
}
