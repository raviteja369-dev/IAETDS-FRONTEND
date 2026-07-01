"use client";

import * as React from "react";
import * as Icons from "lucide-react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import { IconTile, StatusPill, Surface } from "@/components/eoc/primitives";
import { useEocStore } from "@/lib/eoc/store";

export default function IntegrationsPage() {
  const [query, setQuery] = React.useState("");
  const integrations = useEocStore((s) => s.integrations);
  const setIntegrationConnected = useEocStore((s) => s.setIntegrationConnected);
  const filtered = integrations.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()) || i.category.toLowerCase().includes(query.toLowerCase()));
  const connected = integrations.filter((i) => i.connected).length;

  const setConnected = (name: string, value: boolean) => {
    setIntegrationConnected(name, value);
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
