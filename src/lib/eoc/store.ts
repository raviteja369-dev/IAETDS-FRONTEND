"use client";

import { create } from "zustand";
import {
  applications as seedApplications,
  invoices as seedInvoices,
  maintenanceTasks as seedMaintenance,
  notifications as seedNotifications,
  securityFindings as seedSecurity,
  subscriptions as seedSubscriptions,
  transactions as seedTransactions,
} from "./data";
import type {
  AppCategory,
  Application,
  Invoice,
  MaintenanceTask,
  NotificationItem,
  SecurityFinding,
  Subscription,
  Transaction,
} from "./types";

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
}

export const useEocStore = create<EocState>((set, get) => ({
  applications: [...seedApplications],
  maintenanceTasks: [...seedMaintenance],
  securityFindings: [...seedSecurity],
  notifications: [...seedNotifications],
  invoices: [...seedInvoices],
  subscriptions: [...seedSubscriptions],
  transactions: [...seedTransactions],

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
}));

export const selectUnreadCount = (s: EocState) => s.notifications.filter((n) => !n.read).length;
