"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { BadgeCheck, Download, Search, Star } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import { IconTile, StatusPill, Surface } from "@/components/eoc/primitives";
import { marketplaceApps } from "@/lib/eoc/data";
import { useEocStore, type MarketplaceSeed } from "@/lib/eoc/store";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Security", "Automation", "Analytics", "Finance", "Support", "CRM", "Storage"];

export default function MarketplacePage() {
  const router = useRouter();
  const installApp = useEocStore((s) => s.installApp);
  const [query, setQuery] = React.useState("");
  const [cat, setCat] = React.useState("All");

  const handleInstall = (a: MarketplaceSeed) => {
    const { created } = installApp(a);
    if (created) {
      toast.success(`${a.name} installed`, {
        description: "Pre-integrated with your workspace.",
        action: { label: "Open", onClick: () => router.push("/console/applications") },
      });
    } else {
      toast.info(`${a.name} is already installed`, {
        action: { label: "Open", onClick: () => router.push("/console/applications") },
      });
    }
  };

  const filtered = marketplaceApps.filter((a) => {
    const mq = !query || a.name.toLowerCase().includes(query.toLowerCase()) || a.description.toLowerCase().includes(query.toLowerCase());
    const mc = cat === "All" || a.category === cat;
    return mq && mc;
  });

  const featured = marketplaceApps.filter((a) => a.featured);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Enterprise app store"
        title="Marketplace"
        description="Discover, trial, and install verified enterprise applications in one click. Everything is pre-integrated with your workspace."
        actions={<EButton variant="secondary">Submit an app</EButton>}
      />

      {/* Featured hero */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {featured.map((a, i) => {
          const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[a.icon] ?? Icons.Box;
          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Surface hover className="relative overflow-hidden p-5">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl" style={{ background: a.accent }} />
                <div className="flex items-center justify-between">
                  <IconTile icon={Icon} accent={a.accent} size="lg" />
                  <StatusPill tone="info">Featured</StatusPill>
                </div>
                <p className="mt-4 text-base font-semibold text-eoc-fg">{a.name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-eoc-fg2">{a.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-eoc-fg">{a.price}</span>
                  <EButton size="sm" variant="primary" onClick={() => handleInstall(a)}>
                    <Download className="h-3.5 w-3.5" /> Install
                  </EButton>
                </div>
              </Surface>
            </motion.div>
          );
        })}
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-eoc-border bg-white/[0.03] px-3">
          <Search className="h-4 w-4 text-eoc-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the marketplace…" className="flex-1 bg-transparent text-sm text-eoc-fg outline-none placeholder:text-eoc-muted" />
        </div>
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-eoc-border bg-white/[0.03] p-1">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-colors", cat === c ? "bg-white/10 text-eoc-fg" : "text-eoc-muted hover:text-eoc-fg2")}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((a, i) => {
          const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[a.icon] ?? Icons.Box;
          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Surface hover className="flex h-full flex-col p-5">
                <div className="flex items-start gap-3">
                  <IconTile icon={Icon} accent={a.accent} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-semibold text-eoc-fg">{a.name}</p>
                      {a.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-eoc-info" />}
                    </div>
                    <p className="text-xs text-eoc-muted">{a.category}</p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 flex-1 text-xs leading-relaxed text-eoc-fg2">{a.description}</p>
                <div className="mt-4 flex items-center gap-3 text-xs text-eoc-muted">
                  <span className="flex items-center gap-1 text-eoc-warning"><Star className="h-3.5 w-3.5 fill-current" /> {a.rating}</span>
                  <span>{a.installs} installs</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-eoc-border pt-4">
                  <span className="text-sm font-medium text-eoc-fg">{a.price}</span>
                  <EButton size="sm" variant="secondary" onClick={() => handleInstall(a)}>Install</EButton>
                </div>
              </Surface>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
