"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import * as Icons from "lucide-react";
import {
  Activity,
  Boxes,
  Cpu,
  HardDrive,
  Power,
  RefreshCw,
  Search,
  Settings2,
  Sparkles,
} from "lucide-react";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import {
  IconTile,
  ProgressBar,
  RatingBadge,
  StatusPill,
  Surface,
  EmptyState,
  type Tone,
} from "@/components/eoc/primitives";
import { AppCard } from "@/components/eoc/cards";
import { Drawer, DrawerClose, DrawerTitle } from "@/components/eoc/drawer";
import { useEocStore } from "@/lib/eoc/store";
import type { Application } from "@/lib/eoc/types";
import { formatValue } from "@/lib/eoc/format";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = ["all", "running", "updating", "maintenance", "degraded"] as const;
const statusTone: Record<string, Tone> = {
  running: "success",
  updating: "info",
  maintenance: "warning",
  degraded: "warning",
  stopped: "neutral",
  retired: "neutral",
};

function ApplicationsInner() {
  const params = useSearchParams();
  const router = useRouter();
  const applications = useEocStore((s) => s.applications);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<(typeof STATUS_FILTERS)[number]>("all");
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const active = activeId ? applications.find((a) => a.id === activeId) ?? null : null;

  React.useEffect(() => {
    const id = params.get("app");
    if (id) setActiveId(id);
  }, [params]);

  const filtered = applications.filter((a) => {
    const matchQ =
      !query ||
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase()) ||
      a.owner.toLowerCase().includes(query.toLowerCase());
    const matchS = status === "all" || a.status === status;
    return matchQ && matchS;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Business capabilities"
        title="Applications"
        description="Every application is an intelligent cloud capability with its own lifecycle — install, configure, run, secure, and scale."
        actions={
          <>
            <EButton variant="secondary" onClick={() => toast.info("Lifecycle view", { description: "Install → Configure → Deploy → Run → Maintain → Retire" })}>Lifecycle</EButton>
            <EButton variant="primary" onClick={() => router.push("/console/marketplace")}>
              <Boxes className="h-4 w-4" /> Install application
            </EButton>
          </>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-eoc-border bg-white/[0.03] px-3">
          <Search className="h-4 w-4 text-eoc-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search applications, owners, categories…"
            className="flex-1 bg-transparent text-sm text-eoc-fg outline-none placeholder:text-eoc-muted"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-eoc-border bg-white/[0.03] p-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                status === s ? "bg-white/10 text-eoc-fg" : "text-eoc-muted hover:text-eoc-fg2",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Boxes} title="No applications match your filters" description="Try adjusting your search or status filter." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((app, i) => (
            <AppCard key={app.id} app={app} index={i} onOpen={(a) => setActiveId(a.id)} />
          ))}
        </div>
      )}

      <Drawer open={!!active} onOpenChange={(v) => !v && setActiveId(null)} width="max-w-xl">
        {active && <AppDetail app={active} onClose={() => setActiveId(null)} />}
      </Drawer>
    </div>
  );
}

function AppDetail({ app, onClose }: { app: Application; onClose: () => void }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[app.icon] ?? Boxes;
  const deployApp = useEocStore((s) => s.deployApp);
  const restartApp = useEocStore((s) => s.restartApp);
  const configureApp = useEocStore((s) => s.configureApp);
  const retireApp = useEocStore((s) => s.retireApp);
  const cloneApp = useEocStore((s) => s.cloneApp);

  const actions = [
    {
      label: "Open",
      icon: Activity,
      run: () => toast.info(`Opening ${app.name}`, { description: "Launching the application console." }),
    },
    {
      label: "Configure",
      icon: Settings2,
      run: () => {
        configureApp(app.id);
        toast.success(`${app.name} configuration saved`);
      },
    },
    {
      label: app.updateAvailable ? `Update to ${app.updateAvailable}` : "Deploy",
      icon: RefreshCw,
      run: () => {
        deployApp(app.id);
        toast.loading(`Deploying ${app.name}…`, { id: `deploy-${app.id}`, duration: 1300 });
        setTimeout(() => toast.success(`${app.name} deployed`, { id: `deploy-${app.id}` }), 1300);
      },
    },
    {
      label: "Restart",
      icon: Power,
      run: () => {
        restartApp(app.id);
        toast.success(`${app.name} restarted`);
      },
    },
  ];
  return (
    <>
      <div className="flex items-start gap-4 border-b border-eoc-border p-5">
        <IconTile icon={Icon} accent={app.accent} size="lg" />
        <div className="min-w-0 flex-1">
          <DrawerTitle className="truncate text-lg font-semibold text-eoc-fg">{app.name}</DrawerTitle>
          <p className="text-sm text-eoc-muted">{app.category} · {app.owner}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusPill tone={statusTone[app.status]} dot>{app.status}</StatusPill>
            <StatusPill tone="neutral">{app.environment}</StatusPill>
            <span className="font-mono text-xs text-eoc-muted">v{app.version}</span>
          </div>
        </div>
        <DrawerClose />
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5 [scrollbar-width:thin]">
        <div className="grid grid-cols-2 gap-2">
          {actions.map((a) => (
            <EButton key={a.label} variant="secondary" className="justify-start" onClick={a.run}>
              <a.icon className="h-4 w-4" /> {a.label}
            </EButton>
          ))}
        </div>

        <Surface className="border-eoc-accent/30 bg-eoc-accent/[0.06] p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-eoc-accent" />
            <p className="text-xs font-semibold uppercase tracking-wider text-eoc-accent">AI Health Summary</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-eoc-fg2">{app.aiSummary}</p>
        </Surface>

        <div className="grid grid-cols-3 gap-3">
          <Stat label="Health" value={`${app.health}%`} tone={app.health >= 90 ? "success" : "warning"} />
          <Stat label="Availability" value={`${app.availability}%`} />
          <Stat label="Uptime" value={`${app.uptime}%`} />
          <Stat label="Security"><RatingBadge rating={app.security} /></Stat>
          <Stat label="Performance"><RatingBadge rating={app.performance} /></Stat>
          <Stat label="Compliance">
            <StatusPill tone={app.compliance === "compliant" ? "success" : app.compliance === "review" ? "warning" : "danger"}>
              {app.compliance}
            </StatusPill>
          </Stat>
        </div>

        <Surface className="p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-eoc-muted">Resource usage</p>
          <div className="space-y-3">
            <Resource icon={Cpu} label="CPU" value={app.cpu} />
            <Resource icon={HardDrive} label="Memory" value={app.memory} />
          </div>
        </Surface>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <Field label="Monthly cost" value={formatValue(app.monthlyCost, "₹")} />
          <Field label="Licenses" value={`${app.licenses.used} / ${app.licenses.total}`} />
          <Field label="Last maintenance" value={app.lastMaintenance} />
          <Field label="Next maintenance" value={app.nextMaintenance} />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-eoc-muted">Dependencies</p>
          <div className="flex flex-wrap gap-2">
            {app.dependencies.map((d) => (
              <span key={d} className="rounded-lg border border-eoc-border bg-white/[0.03] px-2.5 py-1 text-xs text-eoc-fg2">
                {d}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-eoc-border p-4">
        <EButton
          variant="ghost"
          className="text-eoc-danger"
          onClick={() => {
            retireApp(app.id);
            toast.success(`${app.name} retired`);
            onClose();
          }}
        >
          Retire
        </EButton>
        <EButton
          variant="secondary"
          className="ml-auto"
          onClick={() => {
            cloneApp(app.id);
            toast.success(`${app.name} cloned`, { description: "A staging copy was created." });
          }}
        >
          Clone
        </EButton>
        <EButton variant="primary" onClick={() => toast.success(`Managing ${app.name}`)}>Manage</EButton>
      </div>
    </>
  );
}

function Stat({ label, value, tone, children }: { label: string; value?: string; tone?: Tone; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-eoc-border bg-white/[0.02] p-3 text-center">
      <div className="flex h-7 items-center justify-center">
        {children ?? (
          <span className={cn("text-base font-semibold", tone === "success" ? "text-eoc-success" : tone === "warning" ? "text-eoc-warning" : "text-eoc-fg")}>
            {value}
          </span>
        )}
      </div>
      <p className="mt-1 text-[10px] uppercase tracking-wide text-eoc-muted">{label}</p>
    </div>
  );
}

function Resource({ icon: Icon, label, value }: { icon: Icons.LucideIcon; label: string; value: number }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-eoc-fg2"><Icon className="h-3.5 w-3.5" /> {label}</span>
        <span className="font-medium text-eoc-fg">{value}%</span>
      </div>
      <ProgressBar value={value} tone={value > 75 ? "danger" : value > 60 ? "warning" : "success"} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-eoc-border bg-white/[0.02] p-3">
      <p className="text-[11px] text-eoc-muted">{label}</p>
      <p className="mt-0.5 font-medium text-eoc-fg">{value}</p>
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <React.Suspense fallback={null}>
      <ApplicationsInner />
    </React.Suspense>
  );
}
