"use client";

import * as React from "react";
import * as Icons from "lucide-react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import { IconTile, StatusPill, Surface } from "@/components/eoc/primitives";
import { cn } from "@/lib/utils";

type Integration = { name: string; icon: string; accent: string; category: string; connected: boolean };

const initialIntegrations: Integration[] = [
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

export default function IntegrationsPage() {
  const [query, setQuery] = React.useState("");
  const [integrations, setIntegrations] = React.useState<Integration[]>(initialIntegrations);
  const filtered = integrations.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()) || i.category.toLowerCase().includes(query.toLowerCase()));
  const connected = integrations.filter((i) => i.connected).length;

  const setConnected = (name: string, value: boolean) => {
    setIntegrations((prev) => prev.map((i) => (i.name === name ? { ...i, connected: value } : i)));
    toast.success(`${name} ${value ? "connected" : "disconnected"}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Connected ecosystem"
        title="Integrations"
        description={`${connected} active connections syncing data securely with your workspace. Browse and connect new tools in seconds.`}
        actions={<EButton variant="primary" onClick={() => toast.info("Integration directory", { description: "Browse 200+ pre-built connectors." })}><Plus className="h-4 w-4" /> Browse all</EButton>}
      />

      <div className="flex h-10 items-center gap-2 rounded-xl border border-eoc-border bg-white/[0.03] px-3 sm:max-w-md">
        <Search className="h-4 w-4 text-eoc-muted" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search integrations…" className="flex-1 bg-transparent text-sm text-eoc-fg outline-none placeholder:text-eoc-muted" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((i) => {
          const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[i.icon] ?? Icons.Plug;
          return (
            <Surface key={i.name} hover className="flex items-center gap-3 p-4">
              <IconTile icon={Icon} accent={i.accent} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-eoc-fg">{i.name}</p>
                <p className="text-xs text-eoc-muted">{i.category}</p>
              </div>
              {i.connected ? (
                <button onClick={() => setConnected(i.name, false)} className="group/disc">
                  <span className="group-hover/disc:hidden"><StatusPill tone="success" dot>Connected</StatusPill></span>
                  <span className="hidden group-hover/disc:inline"><StatusPill tone="danger">Disconnect</StatusPill></span>
                </button>
              ) : (
                <EButton size="sm" variant="secondary" onClick={() => setConnected(i.name, true)}>Connect</EButton>
              )}
            </Surface>
          );
        })}
      </div>
    </div>
  );
}
