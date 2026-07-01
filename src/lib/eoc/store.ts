"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  accessMembers as seedMembers,
  activity as seedActivity,
  applications as seedApplications,
  currentUser,
  deployments as seedDeployments,
  invoices as seedInvoices,
  maintenanceTasks as seedMaintenance,
  notifications as seedNotifications,
  securityFindings as seedSecurity,
  subscriptions as seedSubscriptions,
  transactions as seedTransactions,
  workspace,
} from "./data";
import type {
  AccessMember,
  ActivityEvent,
  AppCategory,
  Application,
  Deployment,
  Invoice,
  MaintenanceTask,
  NotificationItem,
  SecurityFinding,
  Subscription,
  Transaction,
} from "./types";

export interface PaymentMethod {
  id: string;
  type: string;
  label: string;
  detail: string;
  addedAt: string;
}

export interface AutomationFlow {
  name: string;
  trigger: string;
  runs: string;
  success: number;
  status: string;
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  author: string;
  at: string;
}

export interface AIAgent {
  name: string;
  model: string;
  calls: string;
  success: number;
  status: string;
}

export interface Integration {
  name: string;
  icon: string;
  accent: string;
  category: string;
  connected: boolean;
}

export interface StorageAddition {
  id: string;
  amount: number;
  addedAt: string;
}

export interface WorkspaceSettings {
  profileName: string;
  profileEmail: string;
  profileRole: string;
  workspaceName: string;
  workspacePlan: string;
  workspaceRegion: string;
  mfa: boolean;
  sso: boolean;
  sessionTimeout: boolean;
  securityAlerts: boolean;
  billingNotifications: boolean;
  maintenanceNotifications: boolean;
  productUpdates: boolean;
  reducedMotion: boolean;
  compactDensity: boolean;
}

const seedFlows: AutomationFlow[] = [
  { name: "Auto-remediate degraded apps", trigger: "Health < 80%", runs: "1,204", success: 99.4, status: "active" },
  { name: "Onboard new employee", trigger: "HR: new hire", runs: "318", success: 100, status: "active" },
  { name: "Invoice overdue escalation", trigger: "Invoice overdue", runs: "92", success: 98.9, status: "active" },
  { name: "Security incident response", trigger: "Critical finding", runs: "47", success: 100, status: "active" },
  { name: "Scale on traffic spike", trigger: "CPU > 75%", runs: "612", success: 99.8, status: "active" },
  { name: "Nightly backup verification", trigger: "Schedule 03:00", runs: "180", success: 100, status: "paused" },
];

const seedDocs: KnowledgeDoc[] = [
  { id: "doc-1", title: "Incident response runbook v4", author: "Meera Iyer", at: "2h ago" },
  { id: "doc-2", title: "Q3 budget approval workflow", author: "Kabir Singh", at: "5h ago" },
  { id: "doc-3", title: "Zero-trust access policy", author: "Riya Kapoor", at: "Yesterday" },
  { id: "doc-4", title: "New hire IT provisioning", author: "People Ops", at: "2d ago" },
];

const seedAgents: AIAgent[] = [
  { name: "Support Resolver", model: "GPT-4o", calls: "184k", success: 97, status: "active" },
  { name: "Finance Analyst", model: "Claude 3.5", calls: "62k", success: 99, status: "active" },
  { name: "Ops Copilot", model: "GPT-4o", calls: "210k", success: 98, status: "active" },
  { name: "Security Triage", model: "Llama 3.1", calls: "41k", success: 95, status: "active" },
  { name: "Docs Summarizer", model: "Claude 3.5", calls: "88k", success: 96, status: "idle" },
  { name: "Lead Scorer", model: "GPT-4o-mini", calls: "133k", success: 94, status: "active" },
];

const seedIntegrations: Integration[] = [
  { name: "Slack", icon: "MessageSquare", accent: "#A855F7", category: "Communication", connected: true },
  { name: "GitHub", icon: "Github", accent: "#A1A1AA", category: "Development", connected: true },
  { name: "Stripe", icon: "CreditCard", accent: "#4F7CFF", category: "Payments", connected: true },
  { name: "Salesforce", icon: "Cloud", accent: "#3B82F6", category: "CRM", connected: true },
  { name: "Jira", icon: "ListChecks", accent: "#4F7CFF", category: "Project", connected: false },
  { name: "Google Workspace", icon: "Mail", accent: "#22C55E", category: "Productivity", connected: true },
  { name: "Datadog", icon: "Activity", accent: "#A855F7", category: "Observability", connected: false },
  { name: "Snowflake", icon: "Database", accent: "#3B82F6", category: "Data", connected: true },
  { name: "PagerDuty", icon: "BellRing", accent: "#22C55E", category: "Incident", connected: false },
  { name: "Zoom", icon: "Video", accent: "#3B82F6", category: "Communication", connected: false },
  { name: "Okta", icon: "KeyRound", accent: "#4F7CFF", category: "Identity", connected: true },
  { name: "HubSpot", icon: "Megaphone", accent: "#F59E0B", category: "Marketing", connected: false },
];

const defaultSettings: WorkspaceSettings = {
  profileName: currentUser.name,
  profileEmail: currentUser.email,
  profileRole: currentUser.role,
  workspaceName: workspace.name,
  workspacePlan: workspace.plan,
  workspaceRegion: workspace.region,
  mfa: true,
  sso: true,
  sessionTimeout: false,
  securityAlerts: true,
  billingNotifications: true,
  maintenanceNotifications: true,
  productUpdates: false,
  reducedMotion: false,
  compactDensity: false,
};

function today(): string {
  return new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function bumpVersion(v: string): string {
  const parts = v.split(".").map((n) => parseInt(n, 10) || 0);
  parts[parts.length - 1] += 1;
  return parts.join(".");
}

function priceToCost(price: string): number {
  const m = price.replace(/,/g, "").match(/(\d+(\.\d+)?)/);
  return m ? Math.round(Number(m[1])) : 0;
}

export interface MarketplaceSeed {
  id: string;
  name: string;
  category: string;
  icon: string;
  accent: string;
  price: string;
  description: string;
}

interface EocState {
  applications: Application[];
  maintenanceTasks: MaintenanceTask[];
  securityFindings: SecurityFinding[];
  notifications: NotificationItem[];
  invoices: Invoice[];
  subscriptions: Subscription[];
  transactions: Transaction[];
  auditEvents: ActivityEvent[];
  deployments: Deployment[];
  walletBalance: number;
  paymentMethods: PaymentMethod[];
  flows: AutomationFlow[];
  members: AccessMember[];
  docs: KnowledgeDoc[];
  agents: AIAgent[];
  integrations: Integration[];
  storageTotalTb: number;
  storageAdditions: StorageAddition[];
  settings: WorkspaceSettings;

  // ── Applications ──
  installApp: (mk: MarketplaceSeed) => { created: boolean; id: string };
  deployApp: (id: string) => void;
  restartApp: (id: string) => void;
  updateApp: (
    id: string,
    patch: Partial<Pick<Application, "owner" | "environment" | "licenses" | "monthlyCost" | "aiSummary" | "nextMaintenance">>,
  ) => void;
  openApp: (id: string) => void;
  configureApp: (id: string) => void;
  retireApp: (id: string) => void;
  uninstallApp: (id: string) => void;
  cloneApp: (id: string) => string | null;

  // ── Maintenance ──
  advanceTask: (id: string) => void;
  completeTask: (id: string) => void;
  scheduleTask: (task: Partial<MaintenanceTask>) => void;
  cancelTask: (id: string) => void;

  // ── Security ──
  setFindingStatus: (id: string, status: SecurityFinding["status"]) => void;
  runSecurityScan: () => { added: boolean; findingId?: string };

  // ── Notifications ──
  markRead: (id: string) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  pushNotification: (n: Omit<NotificationItem, "id" | "at" | "read"> & { read?: boolean }) => void;
  pushAudit: (e: Omit<ActivityEvent, "id" | "at" | "actor">) => void;

  // ── Billing ──
  payInvoice: (id: string) => boolean;
  makePayment: (p: { amount: number; method: string; purpose: string; toWallet: boolean }) => boolean;
  addPaymentMethod: (pm: Omit<PaymentMethod, "id" | "addedAt">) => void;
  removePaymentMethod: (id: string) => void;

  // ── Automation ──
  addFlow: (flow: Pick<AutomationFlow, "name" | "trigger">) => { ok: boolean; error?: string };
  toggleFlow: (name: string) => void;
  runFlow: (name: string) => void;
  deleteFlow: (name: string) => void;

  // ── Identity ──
  inviteMember: (member: Omit<AccessMember, "id">) => { ok: boolean; error?: string };
  setMemberStatus: (id: string, status: AccessMember["status"]) => void;
  deleteMember: (id: string) => void;

  // ── Knowledge ──
  addDoc: (doc: Omit<KnowledgeDoc, "id">) => { ok: boolean; error?: string };
  deleteDoc: (id: string) => void;

  // ── AI Studio ──
  addAgent: (agent: Pick<AIAgent, "name" | "model">) => { ok: boolean; error?: string };
  toggleAgent: (name: string) => void;
  deleteAgent: (name: string) => void;

  // ── Integrations ──
  setIntegrationConnected: (name: string, connected: boolean) => void;

  // ── Storage ──
  addStorageCapacity: (amount: number) => void;
  removeStorageAddition: (id: string) => void;

  // ── Settings ──
  updateSettings: (patch: Partial<WorkspaceSettings>) => void;
}

export type { EocState };

export const useEocStore = create<EocState>()(
  persist(
    (set, get) => ({
  applications: [...seedApplications],
  maintenanceTasks: [...seedMaintenance],
  securityFindings: [...seedSecurity],
  notifications: [...seedNotifications],
  invoices: [...seedInvoices],
  subscriptions: [...seedSubscriptions],
  transactions: [...seedTransactions],
  auditEvents: [...seedActivity],
  deployments: [...seedDeployments],
  walletBalance: 1240000,
  paymentMethods: [],
  flows: [...seedFlows],
  members: [...seedMembers],
  docs: [...seedDocs],
  agents: [...seedAgents],
  integrations: [...seedIntegrations],
  storageTotalTb: 5,
  storageAdditions: [],
  settings: { ...defaultSettings },

  installApp: (mk) => {
    const existing = get().applications.find((a) => a.name === mk.name);
    if (existing) return { created: false, id: existing.id };

    const id = `${mk.id}-${Date.now().toString(36)}`;
    const app: Application = {
      id,
      name: mk.name,
      category: mk.category as AppCategory,
      icon: mk.icon,
      accent: mk.accent,
      owner: "You",
      environment: "production",
      status: "running",
      health: 100,
      version: "1.0.0",
      availability: 100,
      security: "A",
      performance: "A",
      compliance: "compliant",
      lastMaintenance: today(),
      nextMaintenance: "—",
      cpu: 8 + Math.floor(Math.random() * 20),
      memory: 12 + Math.floor(Math.random() * 24),
      monthlyCost: priceToCost(mk.price),
      licenses: { used: 1, total: 25 },
      uptime: 100,
      dependencies: ["Identity"],
      aiSummary: "Freshly installed and pre-integrated with your workspace. Operating nominally.",
      updateAvailable: null,
    };
    set((s) => ({ applications: [app, ...s.applications] }));
    get().pushAudit({ action: "installed", target: mk.name, category: "deploy" });
    get().pushNotification({ title: "Application installed", detail: `${mk.name} is live in your workspace.`, tone: "success" });
    return { created: true, id };
  },

  deployApp: (id) => {
    const app = get().applications.find((a) => a.id === id);
    if (!app || app.status === "retired") return;
    set((s) => ({
      applications: s.applications.map((a) => (a.id === id ? { ...a, status: "updating" } : a)),
      deployments: [
        {
          id: `d-${Date.now().toString(36)}`,
          app: app.name,
          version: app.updateAvailable ?? bumpVersion(app.version),
          status: "in_progress",
          by: get().settings.profileName,
          at: "just now",
          duration: "—",
          environment: app.environment,
        },
        ...s.deployments,
      ],
    }));
    setTimeout(() => {
      const targetVersion = get().applications.find((a) => a.id === id)?.updateAvailable ?? bumpVersion(app.version);
      set((s) => ({
        applications: s.applications.map((a) => {
          if (a.id !== id) return a;
          const version = a.updateAvailable ?? bumpVersion(a.version);
          return { ...a, status: "running", version, health: 100, updateAvailable: null, lastMaintenance: today() };
        }),
        deployments: s.deployments.map((d, i) =>
          i === 0 && d.app === app.name && d.status === "in_progress"
            ? { ...d, status: "succeeded", version: targetVersion, duration: "3m 12s", at: "just now" }
            : d,
        ),
      }));
      const updated = get().applications.find((a) => a.id === id);
      if (updated) {
        get().pushAudit({ action: "deployed", target: `${updated.name} ${updated.version}`, category: "deploy" });
        get().pushNotification({ title: "Deployment succeeded", detail: `${updated.name} ${updated.version} is live in production.`, tone: "success" });
      }
    }, 1300);
  },

  restartApp: (id) => {
    set((s) => ({
      applications: s.applications.map((a) =>
        a.id === id ? { ...a, status: "maintenance", cpu: Math.min(95, a.cpu + 20), memory: Math.min(95, a.memory + 15) } : a,
      ),
    }));
    setTimeout(() => {
      set((s) => ({
        applications: s.applications.map((a) =>
          a.id === id
            ? {
                ...a,
                status: "running",
                health: 100,
                cpu: Math.max(8, a.cpu - 25),
                memory: Math.max(12, a.memory - 20),
                lastMaintenance: today(),
              }
            : a,
        ),
      }));
      const app = get().applications.find((a) => a.id === id);
      if (app) {
        get().pushAudit({ action: "restarted", target: app.name, category: "system" });
        get().pushNotification({ title: "Restart complete", detail: `${app.name} is back online.`, tone: "success" });
      }
    }, 1500);
  },

  updateApp: (id, patch) => {
    set((s) => ({
      applications: s.applications.map((a) => (a.id === id ? { ...a, ...patch, lastMaintenance: today() } : a)),
    }));
    const app = get().applications.find((a) => a.id === id);
    if (app) get().pushAudit({ action: "configured", target: app.name, category: "system" });
  },

  openApp: (id) => {
    const app = get().applications.find((a) => a.id === id);
    if (!app || app.status === "retired") return;
    get().pushAudit({ action: "opened console for", target: app.name, category: "system" });
    get().pushNotification({ title: "Application opened", detail: `${app.name} console launched.`, tone: "info" });
  },

  configureApp: (id) =>
    set((s) => ({
      applications: s.applications.map((a) => (a.id === id ? { ...a, lastMaintenance: today() } : a)),
    })),

  retireApp: (id) => {
    const app = get().applications.find((a) => a.id === id);
    set((s) => ({
      applications: s.applications.map((a) => (a.id === id ? { ...a, status: "retired" } : a)),
    }));
    if (app) get().pushAudit({ action: "retired", target: app.name, category: "deploy" });
  },

  uninstallApp: (id) => {
    const app = get().applications.find((a) => a.id === id);
    set((s) => ({ applications: s.applications.filter((a) => a.id !== id) }));
    if (app) get().pushAudit({ action: "uninstalled", target: app.name, category: "deploy" });
  },

  cloneApp: (id) => {
    const app = get().applications.find((a) => a.id === id);
    if (!app) return null;
    const newId = `${app.id}-copy-${Date.now().toString(36)}`;
    set((s) => ({
      applications: [{ ...app, id: newId, name: `${app.name} (Copy)`, environment: "staging", status: "running" }, ...s.applications],
    }));
    get().pushAudit({ action: "cloned", target: app.name, category: "deploy" });
    return newId;
  },

  advanceTask: (id) =>
    set((s) => ({
      maintenanceTasks: s.maintenanceTasks.map((t) => {
        if (t.id !== id) return t;
        if (t.status === "completed") return t;
        if (t.status === "scheduled") return { ...t, status: "in_progress", progress: Math.max(10, t.progress) };
        const progress = Math.min(100, t.progress + 25);
        return progress >= 100 ? { ...t, status: "completed", progress: 100 } : { ...t, progress };
      }),
    })),

  completeTask: (id) =>
    set((s) => ({
      maintenanceTasks: s.maintenanceTasks.map((t) => (t.id === id ? { ...t, status: "completed", progress: 100 } : t)),
    })),

  scheduleTask: (task) => {
    set((s) => ({
      maintenanceTasks: [
        {
          id: `m-${Date.now().toString(36)}`,
          title: task.title ?? "New maintenance task",
          app: task.app ?? "Platform",
          type: task.type ?? "scheduled",
          status: "scheduled",
          window: task.window ?? today(),
          risk: task.risk ?? "low",
          owner: task.owner ?? "You",
          progress: 0,
        },
        ...s.maintenanceTasks,
      ],
    }));
    get().pushAudit({ action: "scheduled maintenance for", target: task.title ?? "New task", category: "maintenance" });
  },

  cancelTask: (id) => {
    const task = get().maintenanceTasks.find((t) => t.id === id);
    set((s) => ({ maintenanceTasks: s.maintenanceTasks.filter((t) => t.id !== id) }));
    if (task) get().pushAudit({ action: "cancelled maintenance", target: task.title, category: "maintenance" });
  },

  setFindingStatus: (id, status) => {
    const finding = get().securityFindings.find((f) => f.id === id);
    set((s) => ({
      securityFindings: s.securityFindings.map((f) => (f.id === id ? { ...f, status } : f)),
    }));
    if (finding) get().pushAudit({ action: status === "resolved" ? "resolved finding" : "updated finding", target: finding.title, category: "security" });
  },

  runSecurityScan: () => {
    const open = get().securityFindings.filter((f) => f.status === "open");
    if (open.length > 0) {
      const target = open[0];
      set((s) => ({
        securityFindings: s.securityFindings.map((f) => (f.id === target.id ? { ...f, status: "investigating" } : f)),
      }));
      get().pushAudit({ action: "started investigation on", target: target.title, category: "security" });
      return { added: false, findingId: target.id };
    }
    const id = `s-${Date.now().toString(36)}`;
    set((s) => ({
      securityFindings: [
        {
          id,
          title: "Automated scan — configuration drift",
          severity: "low",
          app: "Platform",
          type: "misconfig",
          status: "open",
          detected: "just now",
        },
        ...s.securityFindings,
      ],
    }));
    get().pushAudit({ action: "detected finding", target: "Configuration drift", category: "security" });
    return { added: true, findingId: id };
  },

  markRead: (id) =>
    set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),

  markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

  deleteNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

  pushAudit: (e) =>
    set((s) => ({
      auditEvents: [
        { id: `aud-${Date.now().toString(36)}`, actor: get().settings.profileName, at: "just now", ...e },
        ...s.auditEvents,
      ],
    })),

  pushNotification: (n) =>
    set((s) => ({
      notifications: [
        { id: `n-${Date.now().toString(36)}`, at: "just now", read: n.read ?? false, title: n.title, detail: n.detail, tone: n.tone },
        ...s.notifications,
      ],
    })),

  payInvoice: (id) => {
    const invoice = get().invoices.find((i) => i.id === id);
    if (!invoice || invoice.status === "paid") return false;
    if (get().paymentMethods.length === 0) return false;
    set((s) => ({
      invoices: s.invoices.map((i) => (i.id === id ? { ...i, status: "paid" } : i)),
      transactions: [
        {
          id: `t-${Date.now().toString(36)}`,
          description: `Payment — ${invoice.number}`,
          amount: invoice.amount,
          type: "charge",
          status: "succeeded",
          method: get().paymentMethods[0]?.detail ?? invoice.method,
          at: today(),
        },
        ...s.transactions,
      ],
    }));
    get().pushAudit({ action: "paid invoice", target: invoice.number, category: "billing" });
    get().pushNotification({ title: "Payment received", detail: `${invoice.number} paid successfully.`, tone: "success" });
    return true;
  },

  makePayment: ({ amount, method, purpose, toWallet }) => {
    if (amount <= 0) return false;
    if (!toWallet && method === "Wallet" && get().walletBalance < amount) return false;
    set((s) => ({
      walletBalance: toWallet ? s.walletBalance + amount : Math.max(0, s.walletBalance - (method === "Wallet" ? amount : 0)),
      transactions: [
        {
          id: `t-${Date.now().toString(36)}`,
          description: purpose,
          amount: toWallet ? -amount : amount,
          type: toWallet ? "credit" : "charge",
          status: "succeeded",
          method,
          at: today(),
        },
        ...s.transactions,
      ],
    }));
    get().pushAudit({ action: toWallet ? "added funds" : "made payment", target: purpose, category: "billing" });
    get().pushNotification({
      title: toWallet ? "Funds added" : "Payment successful",
      detail: `${purpose} · ₹${amount.toLocaleString("en-IN")}`,
      tone: "success",
    });
    return true;
  },

  addPaymentMethod: (pm) => {
    set((s) => ({
      paymentMethods: [
        { id: `pm-${Date.now().toString(36)}`, addedAt: today(), type: pm.type, label: pm.label, detail: pm.detail },
        ...s.paymentMethods,
      ],
    }));
    get().pushAudit({ action: "added payment method", target: pm.label, category: "billing" });
  },

  removePaymentMethod: (id) => {
    const pm = get().paymentMethods.find((p) => p.id === id);
    set((s) => ({ paymentMethods: s.paymentMethods.filter((p) => p.id !== id) }));
    if (pm) get().pushAudit({ action: "removed payment method", target: pm.label, category: "billing" });
  },

  addFlow: (flow) => {
    if (get().flows.some((f) => f.name.toLowerCase() === flow.name.trim().toLowerCase())) {
      return { ok: false, error: "A workflow with this name already exists" };
    }
    set((s) => ({
      flows: [{ name: flow.name.trim(), trigger: flow.trigger.trim(), runs: "0", success: 100, status: "active" }, ...s.flows],
    }));
    get().pushAudit({ action: "created workflow", target: flow.name.trim(), category: "system" });
    return { ok: true };
  },

  toggleFlow: (name) =>
    set((s) => ({
      flows: s.flows.map((f) => (f.name === name ? { ...f, status: f.status === "active" ? "paused" : "active" } : f)),
    })),

  runFlow: (name) => {
    set((s) => ({
      flows: s.flows.map((f) => {
        if (f.name !== name) return f;
        const runs = (parseInt(f.runs.replace(/,/g, ""), 10) + 1).toLocaleString("en-IN");
        return { ...f, runs };
      }),
    }));
    get().pushAudit({ action: "ran workflow", target: name, category: "system" });
  },

  deleteFlow: (name) => {
    set((s) => ({ flows: s.flows.filter((f) => f.name !== name) }));
    get().pushAudit({ action: "deleted workflow", target: name, category: "system" });
  },

  inviteMember: (member) => {
    if (get().members.some((m) => m.email.toLowerCase() === member.email.toLowerCase())) {
      return { ok: false, error: "A member with this email already exists" };
    }
    set((s) => ({
      members: [{ id: `u-${Date.now().toString(36)}`, ...member }, ...s.members],
    }));
    get().pushAudit({ action: "invited", target: member.email, category: "access" });
    return { ok: true };
  },

  setMemberStatus: (id, status) => {
    const member = get().members.find((m) => m.id === id);
    set((s) => ({ members: s.members.map((m) => (m.id === id ? { ...m, status } : m)) }));
    if (member) get().pushAudit({ action: status === "suspended" ? "suspended" : "reactivated", target: member.name, category: "access" });
  },

  deleteMember: (id) => {
    const member = get().members.find((m) => m.id === id);
    set((s) => ({ members: s.members.filter((m) => m.id !== id) }));
    if (member) get().pushAudit({ action: "removed member", target: member.name, category: "access" });
  },

  addDoc: (doc) => {
    if (get().docs.some((d) => d.title.toLowerCase() === doc.title.trim().toLowerCase())) {
      return { ok: false, error: "A document with this title already exists" };
    }
    set((s) => ({
      docs: [{ id: `doc-${Date.now().toString(36)}`, ...doc, title: doc.title.trim() }, ...s.docs],
    }));
    get().pushAudit({ action: "created document", target: doc.title.trim(), category: "system" });
    return { ok: true };
  },

  deleteDoc: (id) => {
    const doc = get().docs.find((d) => d.id === id);
    set((s) => ({ docs: s.docs.filter((d) => d.id !== id) }));
    if (doc) get().pushAudit({ action: "deleted document", target: doc.title, category: "system" });
  },

  addAgent: (agent) => {
    if (get().agents.some((a) => a.name.toLowerCase() === agent.name.trim().toLowerCase())) {
      return { ok: false, error: "An agent with this name already exists" };
    }
    set((s) => ({
      agents: [{ name: agent.name.trim(), model: agent.model, calls: "0", success: 100, status: "active" }, ...s.agents],
    }));
    get().pushAudit({ action: "created agent", target: agent.name.trim(), category: "system" });
    return { ok: true };
  },

  toggleAgent: (name) =>
    set((s) => ({
      agents: s.agents.map((a) =>
        a.name === name ? { ...a, status: a.status === "active" ? "idle" : "active" } : a,
      ),
    })),

  deleteAgent: (name) => {
    set((s) => ({ agents: s.agents.filter((a) => a.name !== name) }));
    get().pushAudit({ action: "deleted agent", target: name, category: "system" });
  },

  setIntegrationConnected: (name, connected) => {
    set((s) => ({
      integrations: s.integrations.map((i) => (i.name === name ? { ...i, connected } : i)),
    }));
    get().pushAudit({ action: connected ? "connected" : "disconnected", target: name, category: "system" });
  },

  addStorageCapacity: (amount) => {
    set((s) => ({
      storageTotalTb: s.storageTotalTb + amount,
      storageAdditions: [
        { id: `st-${Date.now().toString(36)}`, amount, addedAt: today() },
        ...s.storageAdditions,
      ],
    }));
    get().pushAudit({ action: "added storage", target: `${amount} TB`, category: "system" });
  },

  removeStorageAddition: (id) => {
    const addition = get().storageAdditions.find((a) => a.id === id);
    if (!addition) return;
    set((s) => ({
      storageTotalTb: Math.max(5, s.storageTotalTb - addition.amount),
      storageAdditions: s.storageAdditions.filter((a) => a.id !== id),
    }));
    get().pushAudit({ action: "removed storage", target: `${addition.amount} TB`, category: "system" });
  },

  updateSettings: (patch) => {
    set((s) => ({ settings: { ...s.settings, ...patch } }));
    get().pushAudit({ action: "updated settings", target: "Workspace", category: "system" });
  },
    }),
    {
      name: "eoc-store",
      version: 3,
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) => {
        const state = persisted as Record<string, unknown>;
        if (version < 2) {
          const docs = (state.docs as Array<Record<string, string>> | undefined) ?? [];
          state.docs = docs.map((d, i) => ({ ...d, id: d.id ?? `doc-migrated-${i}` }));
          if (!state.agents) state.agents = seedAgents;
          if (!state.integrations) state.integrations = seedIntegrations;
          if (!state.storageTotalTb) state.storageTotalTb = 5;
          if (!state.storageAdditions) state.storageAdditions = [];
          if (!state.settings) state.settings = defaultSettings;
        }
        if (version < 3) {
          if (!state.auditEvents) state.auditEvents = seedActivity;
          if (!state.deployments) state.deployments = seedDeployments;
        }
        return state as unknown as EocState;
      },
      partialize: (s) => ({
        applications: s.applications,
        maintenanceTasks: s.maintenanceTasks,
        securityFindings: s.securityFindings,
        notifications: s.notifications,
        invoices: s.invoices,
        subscriptions: s.subscriptions,
        transactions: s.transactions,
        auditEvents: s.auditEvents,
        deployments: s.deployments,
        walletBalance: s.walletBalance,
        paymentMethods: s.paymentMethods,
        flows: s.flows,
        members: s.members,
        docs: s.docs,
        agents: s.agents,
        integrations: s.integrations,
        storageTotalTb: s.storageTotalTb,
        storageAdditions: s.storageAdditions,
        settings: s.settings,
      }),
    },
  ),
);

export const selectUnreadCount = (s: EocState) => s.notifications.filter((n) => !n.read).length;
