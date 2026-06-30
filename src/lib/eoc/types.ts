// ── Enterprise Operations Cloud — domain models ──

export type AppStatus =
  | "running"
  | "updating"
  | "maintenance"
  | "degraded"
  | "stopped"
  | "retired";

export type Environment = "production" | "staging" | "development";

export type Rating = "A+" | "A" | "B" | "C" | "D";

export type AppCategory =
  | "ERP"
  | "CRM"
  | "ITSM"
  | "Finance"
  | "HR"
  | "Marketing"
  | "Support"
  | "Analytics"
  | "AI Agents"
  | "Knowledge"
  | "Custom";

export interface Application {
  id: string;
  name: string;
  category: AppCategory;
  icon: string; // lucide icon key
  accent: string; // hex tint
  owner: string;
  environment: Environment;
  status: AppStatus;
  health: number; // 0-100
  version: string;
  availability: number; // %
  security: Rating;
  performance: Rating;
  compliance: "compliant" | "review" | "at_risk";
  lastMaintenance: string;
  nextMaintenance: string;
  cpu: number; // % usage
  memory: number; // % usage
  monthlyCost: number;
  licenses: { used: number; total: number };
  uptime: number; // %
  dependencies: string[];
  aiSummary: string;
  updateAvailable?: string | null;
}

export interface ScoreCard {
  key: string;
  label: string;
  value: number;
  unit?: string;
  delta: number; // % change
  spark: number[];
  tone?: "default" | "success" | "warning" | "danger";
}

export interface ActivityEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  category: "deploy" | "security" | "billing" | "maintenance" | "access" | "system";
  at: string;
}

export interface Deployment {
  id: string;
  app: string;
  version: string;
  status: "succeeded" | "in_progress" | "failed" | "rolled_back";
  by: string;
  at: string;
  duration: string;
  environment: Environment;
}

export interface AIInsight {
  id: string;
  title: string;
  detail: string;
  impact: "high" | "medium" | "low";
  category: "performance" | "security" | "cost" | "maintenance" | "reliability";
  action: string;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  app: string;
  type: "scheduled" | "predictive" | "patch" | "upgrade" | "backup";
  status: "scheduled" | "in_progress" | "completed" | "at_risk";
  window: string;
  risk: "critical" | "high" | "medium" | "low";
  owner: string;
  progress: number;
}

export interface ComponentHealth {
  name: string;
  app: string;
  health: number;
  trend: "up" | "down" | "flat";
  lastChecked: string;
}

export interface SecurityFinding {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  app: string;
  type: "vulnerability" | "threat" | "misconfig" | "identity" | "data";
  status: "open" | "investigating" | "mitigated" | "resolved";
  detected: string;
  cve?: string;
}

export interface ComplianceFramework {
  key: string;
  name: string;
  score: number;
  controls: { passed: number; total: number };
  status: "certified" | "in_progress" | "gap";
}

export interface PerfMetric {
  key: string;
  label: string;
  value: string;
  delta: number;
  series: number[];
  unit?: string;
  tone?: "success" | "warning" | "danger" | "default";
}

export interface Subscription {
  id: string;
  app: string;
  plan: "Free" | "Trial" | "Professional" | "Business" | "Enterprise" | "Custom";
  status: "active" | "trialing" | "past_due" | "paused" | "canceled";
  seats: number;
  amount: number;
  cycle: "monthly" | "annual";
  renews: string;
}

export interface Invoice {
  id: string;
  number: string;
  org: string;
  amount: number;
  tax: number;
  status: "paid" | "due" | "overdue" | "processing";
  issued: string;
  due: string;
  method: string;
  items: { label: string; qty: number; amount: number }[];
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "charge" | "refund" | "credit" | "payout";
  status: "succeeded" | "pending" | "failed";
  method: string;
  at: string;
}

export interface UsageMetric {
  key: string;
  label: string;
  used: number;
  included: number;
  unit: string;
  cost: number;
  series: number[];
  forecast: number;
}

export interface MonitoringService {
  name: string;
  type: "api" | "job" | "queue" | "cron" | "webhook" | "agent";
  status: "operational" | "degraded" | "down";
  latency: string;
  uptime: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  tone: "info" | "success" | "warning" | "danger";
  at: string;
  read: boolean;
}

export interface AccessMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "active" | "invited" | "suspended";
  mfa: boolean;
  lastActive: string;
}
