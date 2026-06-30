"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  accessMembers as seedMembers,
  applications as seedApplications,
  invoices as seedInvoices,
  maintenanceTasks as seedMaintenance,
  notifications as seedNotifications,
  securityFindings as seedSecurity,
  subscriptions as seedSubscriptions,
  transactions as seedTransactions,
} from "./data";
import type {
  AccessMember,
  AppCategory,
  Application,
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
  title: string;
  author: string;
  at: string;
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
  { title: "Incident response runbook v4", author: "Meera Iyer", at: "2h ago" },
  { title: "Q3 budget approval workflow", author: "Kabir Singh", at: "5h ago" },
  { title: "Zero-trust access policy", author: "Riya Kapoor", at: "Yesterday" },
  { title: "New hire IT provisioning", author: "People Ops", at: "2d ago" },
];

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
  walletBalance: number;
  paymentMethods: PaymentMethod[];
  flows: AutomationFlow[];
  members: AccessMember[];
  docs: KnowledgeDoc[];

  // ── Applications ──
  installApp: (mk: MarketplaceSeed) => { created: boolean; id: string };
  deployApp: (id: string) => void;
  restartApp: (id: string) => void;
  configureApp: (id: string) => void;
  retireApp: (id: string) => void;
  cloneApp: (id: string) => string | null;

  // ── Maintenance ──
  advanceTask: (id: string) => void;
  completeTask: (id: string) => void;
  scheduleTask: (task: Partial<MaintenanceTask>) => void;

  // ── Security ──
  setFindingStatus: (id: string, status: SecurityFinding["status"]) => void;

  // ── Notifications ──
  markRead: (id: string) => void;
  markAllRead: () => void;
  pushNotification: (n: Omit<NotificationItem, "id" | "at" | "read"> & { read?: boolean }) => void;

  // ── Billing ──
  payInvoice: (id: string) => void;
  makePayment: (p: { amount: number; method: string; purpose: string; toWallet: boolean }) => void;
  addPaymentMethod: (pm: Omit<PaymentMethod, "id" | "addedAt">) => void;
  removePaymentMethod: (id: string) => void;

  // ── Automation ──
  addFlow: (flow: Pick<AutomationFlow, "name" | "trigger">) => void;
  toggleFlow: (name: string) => void;
  runFlow: (name: string) => void;

  // ── Identity ──
  inviteMember: (member: Omit<AccessMember, "id">) => void;
  setMemberStatus: (id: string, status: AccessMember["status"]) => void;

  // ── Knowledge ──
  addDoc: (doc: KnowledgeDoc) => void;
}

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
  walletBalance: 1240000,
  paymentMethods: [],
  flows: [...seedFlows],
  members: [...seedMembers],
  docs: [...seedDocs],

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
    get().pushNotification({ title: "Application installed", detail: `${mk.name} is live in your workspace.`, tone: "success" });
    return { created: true, id };
  },

  deployApp: (id) => {
    set((s) => ({
      applications: s.applications.map((a) => (a.id === id ? { ...a, status: "updating" } : a)),
    }));
    setTimeout(() => {
      set((s) => ({
        applications: s.applications.map((a) => {
          if (a.id !== id) return a;
          const version = a.updateAvailable ?? bumpVersion(a.version);
          return { ...a, status: "running", version, health: 100, updateAvailable: null, lastMaintenance: today() };
        }),
      }));
      const app = get().applications.find((a) => a.id === id);
      if (app) get().pushNotification({ title: "Deployment succeeded", detail: `${app.name} ${app.version} is live in production.`, tone: "success" });
    }, 1300);
  },

  restartApp: (id) =>
    set((s) => ({
      applications: s.applications.map((a) => (a.id === id ? { ...a, status: "running", health: 100 } : a)),
    })),

  configureApp: (id) =>
    set((s) => ({
      applications: s.applications.map((a) => (a.id === id ? { ...a, lastMaintenance: today() } : a)),
    })),

  retireApp: (id) =>
    set((s) => ({
      applications: s.applications.map((a) => (a.id === id ? { ...a, status: "retired" } : a)),
    })),

  cloneApp: (id) => {
    const app = get().applications.find((a) => a.id === id);
    if (!app) return null;
    const newId = `${app.id}-copy-${Date.now().toString(36)}`;
    set((s) => ({
      applications: [{ ...app, id: newId, name: `${app.name} (Copy)`, environment: "staging", status: "running" }, ...s.applications],
    }));
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

  scheduleTask: (task) =>
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
    })),

  setFindingStatus: (id, status) =>
    set((s) => ({
      securityFindings: s.securityFindings.map((f) => (f.id === id ? { ...f, status } : f)),
    })),

  markRead: (id) =>
    set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),

  markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

  pushNotification: (n) =>
    set((s) => ({
      notifications: [
        { id: `n-${Date.now().toString(36)}`, at: "just now", read: n.read ?? false, title: n.title, detail: n.detail, tone: n.tone },
        ...s.notifications,
      ],
    })),

  payInvoice: (id) => {
    const invoice = get().invoices.find((i) => i.id === id);
    if (!invoice || invoice.status === "paid") return;
    set((s) => ({
      invoices: s.invoices.map((i) => (i.id === id ? { ...i, status: "paid" } : i)),
      transactions: [
        {
          id: `t-${Date.now().toString(36)}`,
          description: `Payment — ${invoice.number}`,
          amount: invoice.amount,
          type: "charge",
          status: "succeeded",
          method: invoice.method,
          at: today(),
        },
        ...s.transactions,
      ],
    }));
    get().pushNotification({ title: "Payment received", detail: `${invoice.number} paid successfully.`, tone: "success" });
  },

  makePayment: ({ amount, method, purpose, toWallet }) => {
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
    get().pushNotification({
      title: toWallet ? "Funds added" : "Payment successful",
      detail: `${purpose} · ₹${amount.toLocaleString("en-IN")}`,
      tone: "success",
    });
  },

  addPaymentMethod: (pm) =>
    set((s) => ({
      paymentMethods: [
        { id: `pm-${Date.now().toString(36)}`, addedAt: today(), type: pm.type, label: pm.label, detail: pm.detail },
        ...s.paymentMethods,
      ],
    })),

  removePaymentMethod: (id) =>
    set((s) => ({ paymentMethods: s.paymentMethods.filter((p) => p.id !== id) })),

  addFlow: (flow) =>
    set((s) => ({
      flows: [{ name: flow.name, trigger: flow.trigger, runs: "0", success: 100, status: "active" }, ...s.flows],
    })),

  toggleFlow: (name) =>
    set((s) => ({
      flows: s.flows.map((f) => (f.name === name ? { ...f, status: f.status === "active" ? "paused" : "active" } : f)),
    })),

  runFlow: (name) =>
    set((s) => ({
      flows: s.flows.map((f) => {
        if (f.name !== name) return f;
        const runs = (parseInt(f.runs.replace(/,/g, ""), 10) + 1).toLocaleString("en-IN");
        return { ...f, runs };
      }),
    })),

  inviteMember: (member) =>
    set((s) => ({
      members: [{ id: `u-${Date.now().toString(36)}`, ...member }, ...s.members],
    })),

  setMemberStatus: (id, status) =>
    set((s) => ({ members: s.members.map((m) => (m.id === id ? { ...m, status } : m)) })),

  addDoc: (doc) => set((s) => ({ docs: [doc, ...s.docs] })),
    }),
    {
      name: "eoc-store",
      version: 1,
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        applications: s.applications,
        maintenanceTasks: s.maintenanceTasks,
        securityFindings: s.securityFindings,
        notifications: s.notifications,
        invoices: s.invoices,
        subscriptions: s.subscriptions,
        transactions: s.transactions,
        walletBalance: s.walletBalance,
        paymentMethods: s.paymentMethods,
        flows: s.flows,
        members: s.members,
        docs: s.docs,
      }),
    },
  ),
);

export const selectUnreadCount = (s: EocState) => s.notifications.filter((n) => !n.read).length;
