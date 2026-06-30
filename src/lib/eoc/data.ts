import type {
  AccessMember,
  AIInsight,
  ActivityEvent,
  Application,
  ComplianceFramework,
  ComponentHealth,
  Deployment,
  Invoice,
  MaintenanceTask,
  MonitoringService,
  NotificationItem,
  PerfMetric,
  ScoreCard,
  SecurityFinding,
  Subscription,
  Transaction,
  UsageMetric,
} from "./types";

const spark = (base: number, n = 16, jitter = 8) =>
  Array.from({ length: n }, (_, i) =>
    Math.max(0, Math.round(base + Math.sin(i / 2) * jitter + (Math.random() - 0.5) * jitter)),
  );

export const workspace = {
  name: "Northwind Industries",
  plan: "Enterprise",
  region: "EU-West",
  members: 1284,
};

export const currentUser = {
  name: "Riya Kapoor",
  email: "riya.kapoor@northwind.io",
  role: "Platform Administrator",
  initials: "RK",
};

export const workspaces = [
  { id: "nw", name: "Northwind Industries", plan: "Enterprise" },
  { id: "ac", name: "Acme Robotics", plan: "Business" },
  { id: "hl", name: "Helios Labs", plan: "Professional" },
];

export const dashboardScores: ScoreCard[] = [
  { key: "health", label: "System Health", value: 98.4, unit: "%", delta: 0.6, spark: spark(96), tone: "success" },
  { key: "security", label: "Security Score", value: 94, unit: "/100", delta: 2.1, spark: spark(90), tone: "success" },
  { key: "performance", label: "Performance", value: 91, unit: "/100", delta: -1.2, spark: spark(92), tone: "warning" },
  { key: "availability", label: "Availability", value: 99.98, unit: "%", delta: 0.02, spark: spark(99), tone: "success" },
];

export const dashboardStats: ScoreCard[] = [
  { key: "apps", label: "Applications Running", value: 42, delta: 4, spark: spark(40) },
  { key: "updates", label: "Updates Required", value: 7, delta: -3, spark: spark(9), tone: "warning" },
  { key: "maint", label: "Maintenance Tasks", value: 12, delta: 2, spark: spark(11) },
  { key: "users", label: "Active Users", value: 1284, delta: 8, spark: spark(1200, 16, 60) },
  { key: "ai", label: "AI Agents Online", value: 9, delta: 1, spark: spark(8), tone: "success" },
  { key: "storage", label: "Storage Used", value: 4.2, unit: "TB", delta: 6, spark: spark(38) },
  { key: "cost", label: "Monthly Cost", value: 48250, unit: "₹", delta: -3.4, spark: spark(50000, 16, 1500) },
  { key: "automation", label: "Automation Success", value: 99.2, unit: "%", delta: 0.4, spark: spark(98), tone: "success" },
];

export const applications: Application[] = [
  {
    id: "erp-core", name: "Atlas ERP", category: "ERP", icon: "Boxes", accent: "#4F7CFF",
    owner: "Operations", environment: "production", status: "running", health: 99, version: "4.12.0",
    availability: 99.99, security: "A+", performance: "A", compliance: "compliant",
    lastMaintenance: "Jun 12, 2026", nextMaintenance: "Jul 04, 2026", cpu: 38, memory: 54,
    monthlyCost: 12400, licenses: { used: 820, total: 1000 }, uptime: 99.99,
    dependencies: ["Identity", "Finance Ledger", "Storage"],
    aiSummary: "Operating nominally. Memory trending up 4% WoW — consider scaling before quarter close.",
    updateAvailable: null,
  },
  {
    id: "crm-cloud", name: "Helio CRM", category: "CRM", icon: "Users", accent: "#22C55E",
    owner: "Revenue", environment: "production", status: "running", health: 96, version: "8.3.1",
    availability: 99.95, security: "A", performance: "A", compliance: "compliant",
    lastMaintenance: "Jun 18, 2026", nextMaintenance: "Jul 10, 2026", cpu: 44, memory: 61,
    monthlyCost: 8600, licenses: { used: 540, total: 600 }, uptime: 99.95,
    dependencies: ["Identity", "Analytics", "Email"],
    aiSummary: "Healthy. Lead pipeline sync latency improved 12% after last patch.",
    updateAvailable: "8.4.0",
  },
  {
    id: "itsm", name: "Servora ITSM", category: "ITSM", icon: "LifeBuoy", accent: "#F59E0B",
    owner: "IT Operations", environment: "production", status: "updating", health: 92, version: "6.0.2",
    availability: 99.9, security: "A", performance: "B", compliance: "review",
    lastMaintenance: "Jun 20, 2026", nextMaintenance: "Jun 30, 2026", cpu: 51, memory: 48,
    monthlyCost: 5200, licenses: { used: 310, total: 400 }, uptime: 99.9,
    dependencies: ["Identity", "Knowledge", "Automation"],
    aiSummary: "Rolling update in progress (6.1.0). No customer impact detected.",
    updateAvailable: "6.1.0",
  },
  {
    id: "finance-ledger", name: "Ledgerline Finance", category: "Finance", icon: "Landmark", accent: "#4F7CFF",
    owner: "Finance", environment: "production", status: "running", health: 98, version: "3.7.4",
    availability: 99.98, security: "A+", performance: "A", compliance: "compliant",
    lastMaintenance: "Jun 09, 2026", nextMaintenance: "Jul 01, 2026", cpu: 29, memory: 42,
    monthlyCost: 9800, licenses: { used: 120, total: 150 }, uptime: 99.98,
    dependencies: ["Identity", "Atlas ERP", "Tax Engine"],
    aiSummary: "Quarter-close workloads stable. Reconciliation jobs completing 8% faster.",
    updateAvailable: null,
  },
  {
    id: "hr-suite", name: "Peoplehub HR", category: "HR", icon: "UserCog", accent: "#A855F7",
    owner: "People", environment: "production", status: "running", health: 94, version: "5.1.0",
    availability: 99.92, security: "A", performance: "A", compliance: "compliant",
    lastMaintenance: "Jun 15, 2026", nextMaintenance: "Jul 14, 2026", cpu: 33, memory: 39,
    monthlyCost: 4300, licenses: { used: 1100, total: 1300 }, uptime: 99.92,
    dependencies: ["Identity", "Payroll"],
    aiSummary: "Open enrollment traffic peaked without degradation. No action required.",
    updateAvailable: null,
  },
  {
    id: "marketing", name: "Beacon Marketing", category: "Marketing", icon: "Megaphone", accent: "#EC4899",
    owner: "Growth", environment: "staging", status: "degraded", health: 78, version: "2.9.0",
    availability: 99.1, security: "B", performance: "C", compliance: "review",
    lastMaintenance: "Jun 22, 2026", nextMaintenance: "Jun 29, 2026", cpu: 72, memory: 81,
    monthlyCost: 3100, licenses: { used: 60, total: 100 }, uptime: 99.1,
    dependencies: ["Helio CRM", "Analytics"],
    aiSummary: "Elevated memory pressure on campaign engine. Predictive maintenance recommended.",
    updateAvailable: "3.0.0",
  },
  {
    id: "support", name: "Resolve Support", category: "Support", icon: "Headset", accent: "#22C55E",
    owner: "Customer Success", environment: "production", status: "running", health: 95, version: "7.2.2",
    availability: 99.94, security: "A", performance: "A", compliance: "compliant",
    lastMaintenance: "Jun 17, 2026", nextMaintenance: "Jul 08, 2026", cpu: 41, memory: 47,
    monthlyCost: 2800, licenses: { used: 95, total: 120 }, uptime: 99.94,
    dependencies: ["Identity", "Knowledge", "AI Agents"],
    aiSummary: "CSAT-impacting latency resolved. Agent deflection up 6% via AI assist.",
    updateAvailable: null,
  },
  {
    id: "analytics", name: "Insight Analytics", category: "Analytics", icon: "BarChart3", accent: "#4F7CFF",
    owner: "Data", environment: "production", status: "running", health: 97, version: "9.0.1",
    availability: 99.96, security: "A", performance: "A", compliance: "compliant",
    lastMaintenance: "Jun 11, 2026", nextMaintenance: "Jul 05, 2026", cpu: 58, memory: 63,
    monthlyCost: 6700, licenses: { used: 220, total: 250 }, uptime: 99.96,
    dependencies: ["Storage", "Atlas ERP", "Helio CRM"],
    aiSummary: "Query engine warm. Materialized views cut dashboard load times by 19%.",
    updateAvailable: null,
  },
  {
    id: "ai-agents", name: "Cortex AI Agents", category: "AI Agents", icon: "Bot", accent: "#A855F7",
    owner: "AI Platform", environment: "production", status: "running", health: 99, version: "1.8.0",
    availability: 99.97, security: "A+", performance: "A", compliance: "compliant",
    lastMaintenance: "Jun 19, 2026", nextMaintenance: "Jul 12, 2026", cpu: 47, memory: 52,
    monthlyCost: 11200, licenses: { used: 9, total: 12 }, uptime: 99.97,
    dependencies: ["Knowledge", "Insight Analytics", "Storage"],
    aiSummary: "All 9 agents healthy. Token spend optimized 14% via response caching.",
    updateAvailable: null,
  },
  {
    id: "knowledge", name: "Codex Knowledge", category: "Knowledge", icon: "BookOpen", accent: "#F59E0B",
    owner: "Enablement", environment: "production", status: "maintenance", health: 88, version: "4.4.0",
    availability: 99.8, security: "A", performance: "B", compliance: "compliant",
    lastMaintenance: "Jun 24, 2026", nextMaintenance: "Jul 02, 2026", cpu: 36, memory: 44,
    monthlyCost: 1900, licenses: { used: 900, total: 1300 }, uptime: 99.8,
    dependencies: ["Storage", "Cortex AI Agents"],
    aiSummary: "Index rebuild underway to improve semantic search recall. Read-only window active.",
    updateAvailable: null,
  },
];

export const deployments: Deployment[] = [
  { id: "d1", app: "Helio CRM", version: "8.4.0", status: "succeeded", by: "Aarav Mehta", at: "12m ago", duration: "3m 21s", environment: "production" },
  { id: "d2", app: "Servora ITSM", version: "6.1.0", status: "in_progress", by: "CI Pipeline", at: "now", duration: "2m 04s", environment: "production" },
  { id: "d3", app: "Insight Analytics", version: "9.0.1", status: "succeeded", by: "Diya Sharma", at: "1h ago", duration: "5m 47s", environment: "production" },
  { id: "d4", app: "Beacon Marketing", version: "3.0.0", status: "failed", by: "CI Pipeline", at: "2h ago", duration: "1m 12s", environment: "staging" },
  { id: "d5", app: "Atlas ERP", version: "4.12.0", status: "succeeded", by: "Kabir Singh", at: "5h ago", duration: "8m 30s", environment: "production" },
  { id: "d6", app: "Resolve Support", version: "7.2.2", status: "rolled_back", by: "On-call", at: "Yesterday", duration: "—", environment: "production" },
];

export const activity: ActivityEvent[] = [
  { id: "a1", actor: "Aarav Mehta", action: "deployed", target: "Helio CRM 8.4.0", category: "deploy", at: "12m ago" },
  { id: "a2", actor: "Security Engine", action: "mitigated threat on", target: "API Gateway", category: "security", at: "38m ago" },
  { id: "a3", actor: "Riya Kapoor", action: "approved budget for", target: "AI Platform", category: "billing", at: "1h ago" },
  { id: "a4", actor: "Auto-Scaler", action: "scaled up", target: "Insight Analytics", category: "system", at: "2h ago" },
  { id: "a5", actor: "Predictive AI", action: "scheduled maintenance for", target: "Beacon Marketing", category: "maintenance", at: "3h ago" },
  { id: "a6", actor: "Kabir Singh", action: "granted access to", target: "Finance workspace", category: "access", at: "5h ago" },
  { id: "a7", actor: "Cortex AI", action: "optimized token spend for", target: "Support agents", category: "system", at: "6h ago" },
];

export const aiInsights: AIInsight[] = [
  { id: "i1", title: "Scale Beacon Marketing before campaign launch", detail: "Memory at 81% with a 40% traffic spike forecast for the Q3 launch. Add 1 capacity unit to avoid degradation.", impact: "high", category: "performance", action: "Apply recommendation" },
  { id: "i2", title: "Reduce idle AI agent spend", detail: "2 agents idle >70% of the time. Switching to on-demand could save ~₹1,240/mo.", impact: "medium", category: "cost", action: "Review agents" },
  { id: "i3", title: "Patch Servora ITSM CVE-2026-1187", detail: "Medium-severity dependency vulnerability detected. Patch available in 6.1.0 (already rolling out).", impact: "medium", category: "security", action: "View finding" },
  { id: "i4", title: "Consolidate underused CRM licenses", detail: "60 of 600 seats inactive for 30+ days. Right-size to save ~₹840/mo at renewal.", impact: "low", category: "cost", action: "Open licenses" },
];

export const maintenanceTasks: MaintenanceTask[] = [
  { id: "m1", title: "Index rebuild & semantic re-embed", app: "Codex Knowledge", type: "scheduled", status: "in_progress", window: "Jun 24, 02:00–04:00", risk: "low", owner: "Enablement", progress: 64 },
  { id: "m2", title: "Predictive scale-out (memory pressure)", app: "Beacon Marketing", type: "predictive", status: "scheduled", window: "Jun 29, 01:00–02:00", risk: "high", owner: "Growth", progress: 0 },
  { id: "m3", title: "Apply security patch 6.1.0", app: "Servora ITSM", type: "patch", status: "in_progress", window: "Jun 30, 00:00–00:30", risk: "medium", owner: "IT Operations", progress: 42 },
  { id: "m4", title: "Quarter-close ledger maintenance", app: "Ledgerline Finance", type: "scheduled", status: "scheduled", window: "Jul 01, 22:00–23:30", risk: "medium", owner: "Finance", progress: 0 },
  { id: "m5", title: "Full backup + restore drill", app: "Atlas ERP", type: "backup", status: "scheduled", window: "Jul 04, 03:00–05:00", risk: "low", owner: "Operations", progress: 0 },
  { id: "m6", title: "Upgrade to 8.4.0", app: "Helio CRM", type: "upgrade", status: "completed", window: "Jun 24, 01:00–01:20", risk: "low", owner: "Revenue", progress: 100 },
];

export const componentHealth: ComponentHealth[] = [
  { name: "API Gateway", app: "Platform", health: 99, trend: "up", lastChecked: "1m ago" },
  { name: "Event Bus", app: "Platform", health: 98, trend: "flat", lastChecked: "1m ago" },
  { name: "Campaign Engine", app: "Beacon Marketing", health: 74, trend: "down", lastChecked: "2m ago" },
  { name: "Reconciliation Worker", app: "Ledgerline Finance", health: 97, trend: "up", lastChecked: "1m ago" },
  { name: "Search Indexer", app: "Codex Knowledge", health: 85, trend: "up", lastChecked: "3m ago" },
  { name: "Inference Pool", app: "Cortex AI Agents", health: 99, trend: "flat", lastChecked: "1m ago" },
];

export const securityFindings: SecurityFinding[] = [
  { id: "s1", title: "Dependency vulnerability in ITSM bundle", severity: "medium", app: "Servora ITSM", type: "vulnerability", status: "mitigated", detected: "2h ago", cve: "CVE-2026-1187" },
  { id: "s2", title: "Anomalous login pattern blocked", severity: "high", app: "Identity", type: "threat", status: "resolved", detected: "5h ago" },
  { id: "s3", title: "Public storage bucket misconfiguration", severity: "high", app: "Storage", type: "misconfig", status: "investigating", detected: "1h ago" },
  { id: "s4", title: "Over-privileged service account", severity: "medium", app: "Atlas ERP", type: "identity", status: "open", detected: "Yesterday" },
  { id: "s5", title: "Unencrypted field detected in export", severity: "low", app: "Helio CRM", type: "data", status: "resolved", detected: "2d ago" },
  { id: "s6", title: "Brute-force attempt on API key", severity: "critical", app: "API Gateway", type: "threat", status: "mitigated", detected: "30m ago" },
];

export const complianceFrameworks: ComplianceFramework[] = [
  { key: "soc2", name: "SOC 2 Type II", score: 98, controls: { passed: 116, total: 118 }, status: "certified" },
  { key: "iso", name: "ISO 27001", score: 96, controls: { passed: 112, total: 117 }, status: "certified" },
  { key: "gdpr", name: "GDPR", score: 99, controls: { passed: 73, total: 74 }, status: "certified" },
  { key: "hipaa", name: "HIPAA", score: 91, controls: { passed: 54, total: 60 }, status: "in_progress" },
  { key: "pci", name: "PCI DSS", score: 88, controls: { passed: 78, total: 90 }, status: "in_progress" },
];

export const perfMetrics: PerfMetric[] = [
  { key: "rt", label: "Avg Response Time", value: "182", unit: "ms", delta: -8, series: spark(190, 20, 30), tone: "success" },
  { key: "p99", label: "P99 Latency", value: "640", unit: "ms", delta: 3, series: spark(620, 20, 60), tone: "warning" },
  { key: "err", label: "Error Rate", value: "0.12", unit: "%", delta: -22, series: spark(0.3, 20, 0.2), tone: "success" },
  { key: "thru", label: "Throughput", value: "48.2k", unit: "req/m", delta: 11, series: spark(44000, 20, 4000) },
];

export const responseSeries = Array.from({ length: 24 }, (_, i) => ({
  t: `${i}:00`,
  p50: 120 + Math.round(Math.sin(i / 3) * 30 + Math.random() * 20),
  p95: 320 + Math.round(Math.sin(i / 3) * 70 + Math.random() * 40),
  p99: 560 + Math.round(Math.sin(i / 3) * 110 + Math.random() * 60),
}));

export const healthSeries = Array.from({ length: 30 }, (_, i) => ({
  d: `${i + 1}`,
  health: 95 + Math.round(Math.sin(i / 4) * 3 + Math.random() * 2),
  incidents: Math.max(0, Math.round(2 + Math.sin(i / 2) * 2 + (Math.random() - 0.6) * 3)),
}));

export const costSeries = Array.from({ length: 12 }, (_, i) => ({
  m: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"][i],
  cost: 38000 + Math.round(Math.sin(i / 2) * 4000 + i * 900 + Math.random() * 1500),
  forecast: 40000 + i * 1000,
}));

export const monitoringServices: MonitoringService[] = [
  { name: "REST API", type: "api", status: "operational", latency: "164ms", uptime: 99.99 },
  { name: "GraphQL Gateway", type: "api", status: "operational", latency: "210ms", uptime: 99.97 },
  { name: "Billing Webhooks", type: "webhook", status: "operational", latency: "—", uptime: 99.95 },
  { name: "Nightly ETL", type: "job", status: "operational", latency: "—", uptime: 99.9 },
  { name: "Email Queue", type: "queue", status: "degraded", latency: "1.8s", uptime: 99.4 },
  { name: "Invoice Cron", type: "cron", status: "operational", latency: "—", uptime: 100 },
  { name: "Cortex Inference", type: "agent", status: "operational", latency: "320ms", uptime: 99.97 },
  { name: "Reindex Worker", type: "job", status: "degraded", latency: "—", uptime: 99.2 },
];

// ── Billing & Finance ──
export const subscriptions: Subscription[] = [
  { id: "sub1", app: "Atlas ERP", plan: "Enterprise", status: "active", seats: 1000, amount: 12400, cycle: "monthly", renews: "Jul 15, 2026" },
  { id: "sub2", app: "Helio CRM", plan: "Business", status: "active", seats: 600, amount: 8600, cycle: "monthly", renews: "Jul 22, 2026" },
  { id: "sub3", app: "Cortex AI Agents", plan: "Enterprise", status: "active", seats: 12, amount: 11200, cycle: "monthly", renews: "Jul 12, 2026" },
  { id: "sub4", app: "Beacon Marketing", plan: "Professional", status: "trialing", seats: 100, amount: 0, cycle: "monthly", renews: "Jul 06, 2026" },
  { id: "sub5", app: "Resolve Support", plan: "Business", status: "past_due", seats: 120, amount: 2800, cycle: "monthly", renews: "Jun 28, 2026" },
];

export const invoices: Invoice[] = [
  {
    id: "inv1", number: "INV-2026-0612", org: "Northwind Industries", amount: 48250, tax: 8685, status: "paid",
    issued: "Jun 01, 2026", due: "Jun 15, 2026", method: "Visa •• 4242",
    items: [
      { label: "Atlas ERP — Enterprise", qty: 1, amount: 12400 },
      { label: "Cortex AI Agents", qty: 1, amount: 11200 },
      { label: "Ledgerline Finance", qty: 1, amount: 9800 },
    ],
  },
  {
    id: "inv2", number: "INV-2026-0601", org: "Northwind Industries", amount: 47100, tax: 8478, status: "paid",
    issued: "May 01, 2026", due: "May 15, 2026", method: "Visa •• 4242",
    items: [{ label: "Platform subscription", qty: 1, amount: 47100 }],
  },
  {
    id: "inv3", number: "INV-2026-0701", org: "Acme Robotics", amount: 9200, tax: 1656, status: "due",
    issued: "Jun 20, 2026", due: "Jul 04, 2026", method: "ACH Transfer",
    items: [{ label: "Helio CRM — Business", qty: 1, amount: 8600 }],
  },
  {
    id: "inv4", number: "INV-2026-0588", org: "Helios Labs", amount: 2800, tax: 504, status: "overdue",
    issued: "May 28, 2026", due: "Jun 11, 2026", method: "Card on file",
    items: [{ label: "Resolve Support — Business", qty: 1, amount: 2800 }],
  },
  {
    id: "inv5", number: "INV-2026-0699", org: "Northwind Industries", amount: 11200, tax: 2016, status: "processing",
    issued: "Jun 22, 2026", due: "Jul 06, 2026", method: "Wire",
    items: [{ label: "AI credits top-up", qty: 1, amount: 11200 }],
  },
];

export const transactions: Transaction[] = [
  { id: "t1", description: "Subscription — Atlas ERP", amount: 12400, type: "charge", status: "succeeded", method: "Visa •• 4242", at: "Jun 15, 2026" },
  { id: "t2", description: "AI credits top-up", amount: 5000, type: "charge", status: "succeeded", method: "Wire", at: "Jun 14, 2026" },
  { id: "t3", description: "Refund — duplicate seat", amount: -240, type: "refund", status: "succeeded", method: "Visa •• 4242", at: "Jun 12, 2026" },
  { id: "t4", description: "Promo credit applied", amount: -1000, type: "credit", status: "succeeded", method: "Wallet", at: "Jun 10, 2026" },
  { id: "t5", description: "Subscription — Helio CRM", amount: 8600, type: "charge", status: "pending", method: "ACH Transfer", at: "Jun 22, 2026" },
  { id: "t6", description: "Subscription — Resolve Support", amount: 2800, type: "charge", status: "failed", method: "Card on file", at: "Jun 28, 2026" },
];

export const usageMetrics: UsageMetric[] = [
  { key: "ai", label: "AI Requests", used: 8420000, included: 10000000, unit: "req", cost: 6300, series: spark(7800000, 16, 600000), forecast: 9600000 },
  { key: "storage", label: "Storage", used: 4.2, included: 5, unit: "TB", cost: 840, series: spark(38, 16, 4), forecast: 4.8 },
  { key: "api", label: "API Calls", used: 142000000, included: 200000000, unit: "calls", cost: 2840, series: spark(132000000, 16, 9000000), forecast: 168000000 },
  { key: "bw", label: "Bandwidth", used: 18.4, included: 25, unit: "TB", cost: 1280, series: spark(16, 16, 3), forecast: 21 },
  { key: "auto", label: "Automation Runs", used: 312000, included: 500000, unit: "runs", cost: 620, series: spark(290000, 16, 30000), forecast: 360000 },
  { key: "compute", label: "Compute Credits", used: 72000, included: 100000, unit: "cr", cost: 4320, series: spark(66000, 16, 8000), forecast: 86000 },
];

export const revenueSeries = Array.from({ length: 12 }, (_, i) => ({
  m: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"][i],
  mrr: 180000 + i * 9000 + Math.round(Math.random() * 6000),
  expansion: 12000 + Math.round(Math.random() * 8000),
  churn: 4000 + Math.round(Math.random() * 3000),
}));

export const financeKpis: ScoreCard[] = [
  { key: "mrr", label: "MRR", value: 284000, unit: "₹", delta: 6.2, spark: spark(260000, 16, 10000), tone: "success" },
  { key: "arr", label: "ARR", value: 3408000, unit: "₹", delta: 5.8, spark: spark(3200000, 16, 80000), tone: "success" },
  { key: "ltv", label: "Avg LTV", value: 42800, unit: "₹", delta: 3.1, spark: spark(40000, 16, 2000) },
  { key: "arpu", label: "ARPU", value: 221, unit: "₹", delta: 1.4, spark: spark(210) },
  { key: "churn", label: "Net Churn", value: 1.8, unit: "%", delta: -0.3, spark: spark(2), tone: "success" },
  { key: "outstanding", label: "Outstanding", value: 12000, unit: "₹", delta: -14, spark: spark(16000, 16, 2000), tone: "warning" },
];

export const notifications: NotificationItem[] = [
  { id: "n1", title: "Deployment succeeded", detail: "Helio CRM 8.4.0 is live in production.", tone: "success", at: "12m ago", read: false },
  { id: "n2", title: "Critical threat mitigated", detail: "Brute-force attempt on API key was auto-blocked.", tone: "danger", at: "30m ago", read: false },
  { id: "n3", title: "Maintenance scheduled", detail: "Beacon Marketing scale-out planned for Jun 29.", tone: "info", at: "3h ago", read: false },
  { id: "n4", title: "Invoice overdue", detail: "INV-2026-0588 for Helios Labs is past due.", tone: "warning", at: "5h ago", read: true },
  { id: "n5", title: "License threshold reached", detail: "Atlas ERP at 82% of seat capacity.", tone: "warning", at: "Yesterday", read: true },
];

export const accessMembers: AccessMember[] = [
  { id: "u1", name: "Riya Kapoor", email: "riya.kapoor@northwind.io", role: "Platform Admin", department: "Platform", status: "active", mfa: true, lastActive: "Online" },
  { id: "u2", name: "Aarav Mehta", email: "aarav.mehta@northwind.io", role: "DevOps Lead", department: "Engineering", status: "active", mfa: true, lastActive: "12m ago" },
  { id: "u3", name: "Diya Sharma", email: "diya.sharma@northwind.io", role: "Data Engineer", department: "Data", status: "active", mfa: true, lastActive: "1h ago" },
  { id: "u4", name: "Kabir Singh", email: "kabir.singh@northwind.io", role: "Finance Manager", department: "Finance", status: "active", mfa: false, lastActive: "3h ago" },
  { id: "u5", name: "Meera Iyer", email: "meera.iyer@northwind.io", role: "Security Analyst", department: "Security", status: "active", mfa: true, lastActive: "Online" },
  { id: "u6", name: "Vivaan Rao", email: "vivaan.rao@contractor.io", role: "Support Agent", department: "Customer Success", status: "invited", mfa: false, lastActive: "Pending" },
  { id: "u7", name: "Ananya Nair", email: "ananya.nair@northwind.io", role: "Marketing Ops", department: "Growth", status: "suspended", mfa: true, lastActive: "5d ago" },
];

export const marketplaceApps = [
  { id: "mk1", name: "Sentinel SIEM", category: "Security", icon: "ShieldCheck", accent: "#EF4444", rating: 4.9, installs: "12k", price: "From ₹1,200/mo", verified: true, featured: true, description: "Real-time threat detection and security analytics with AI correlation." },
  { id: "mk2", name: "FlowForge Automation", category: "Automation", icon: "Workflow", accent: "#4F7CFF", rating: 4.8, installs: "9.4k", price: "From ₹400/mo", verified: true, featured: true, description: "Visual workflow builder with 300+ enterprise connectors." },
  { id: "mk3", name: "PulseBI", category: "Analytics", icon: "BarChart3", accent: "#22C55E", rating: 4.7, installs: "18k", price: "From ₹600/mo", verified: true, featured: false, description: "Self-serve analytics and embedded dashboards for every team." },
  { id: "mk4", name: "Vault Secrets", category: "Security", icon: "KeyRound", accent: "#F59E0B", rating: 4.9, installs: "7.1k", price: "From ₹300/mo", verified: true, featured: false, description: "Centralized secrets management with automatic rotation." },
  { id: "mk5", name: "Ledger Tax Engine", category: "Finance", icon: "Receipt", accent: "#4F7CFF", rating: 4.6, installs: "5.3k", price: "From ₹250/mo", verified: true, featured: false, description: "Global tax and GST compliance with multi-currency support." },
  { id: "mk6", name: "Helpdesk AI", category: "Support", icon: "Bot", accent: "#A855F7", rating: 4.8, installs: "14k", price: "From ₹500/mo", verified: true, featured: true, description: "Autonomous support agents trained on your knowledge base." },
  { id: "mk7", name: "DataLake Storage", category: "Storage", icon: "Database", accent: "#3B82F6", rating: 4.5, installs: "6.8k", price: "From ₹1.6/GB", verified: true, featured: false, description: "Scalable object storage with lifecycle and retention policies." },
  { id: "mk8", name: "Compass CRM", category: "CRM", icon: "Users", accent: "#22C55E", rating: 4.4, installs: "11k", price: "From ₹450/mo", verified: false, featured: false, description: "Pipeline management for high-velocity revenue teams." },
];
