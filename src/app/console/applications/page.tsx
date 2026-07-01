"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Modal, Field as FormField, TextInput, SelectInput } from "@/components/eoc/modal";
import { useEocStore } from "@/lib/eoc/store";
import type { Application } from "@/lib/eoc/types";
import { formatValue } from "@/lib/eoc/format";
import { appConfigSchema, type AppConfigInput } from "@/lib/eoc/validation";
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

      <Drawer open={!!activeId} onOpenChange={(v) => !v && setActiveId(null)} width="max-w-xl">
        {activeId && <AppDetail appId={activeId} onClose={() => setActiveId(null)} onSwitch={(id) => setActiveId(id)} />}
      </Drawer>
    </div>
  );
}

function AppDetail({ appId, onClose, onSwitch }: { appId: string; onClose: () => void; onSwitch: (id: string) => void }) {
  const app = useEocStore((s) => s.applications.find((a) => a.id === appId));
  const deployApp = useEocStore((s) => s.deployApp);
  const restartApp = useEocStore((s) => s.restartApp);
  const updateApp = useEocStore((s) => s.updateApp);
  const openApp = useEocStore((s) => s.openApp);
  const retireApp = useEocStore((s) => s.retireApp);
  const cloneApp = useEocStore((s) => s.cloneApp);

  const [panel, setPanel] = React.useState<"overview" | "console" | "manage">("overview");
  const [configOpen, setConfigOpen] = React.useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AppConfigInput>({
    resolver: zodResolver(appConfigSchema),
    defaultValues: { owner: "", environment: "production", licenseTotal: 1, nextMaintenance: "" },
  });

  React.useEffect(() => {
    if (!app) return;
    reset({
      owner: app.owner,
      environment: app.environment,
      licenseTotal: app.licenses.total,
      nextMaintenance: app.nextMaintenance,
    });
    setPanel("overview");
  }, [app?.id, app, reset]);

  if (!app) return null;

  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[app.icon] ?? Boxes;
  const busy = app.status === "updating" || app.status === "maintenance";
  const retired = app.status === "retired";
  const consoleUrl = `https://${app.id}.atlas.cloud`;

  const openConfig = () => {
    if (!app) return;
    reset({
      owner: app.owner,
      environment: app.environment,
      licenseTotal: app.licenses.total,
      nextMaintenance: app.nextMaintenance,
    });
    setConfigOpen(true);
  };

  const saveConfig = handleSubmit((data) => {
    if (!app) return;
    const total = Math.max(app.licenses.used, data.licenseTotal);
    updateApp(app.id, {
      owner: data.owner,
      environment: data.environment,
      licenses: { used: Math.min(app.licenses.used, total), total },
      nextMaintenance: data.nextMaintenance?.trim() || app.nextMaintenance,
    });
    toast.success(`${app.name} updated`, { description: "Configuration saved successfully." });
    setConfigOpen(false);
  });

  const actions = [
    {
      label: "Open",
      icon: Activity,
      disabled: retired || busy,
      run: () => {
        openApp(app.id);
        setPanel("console");
      },
    },
    {
      label: "Configure",
      icon: Settings2,
      disabled: retired || busy,
      run: openConfig,
    },
    {
      label: app.updateAvailable ? `Update to ${app.updateAvailable}` : "Deploy",
      icon: RefreshCw,
      disabled: retired || busy,
      run: () => {
        const targetVersion = app.updateAvailable;
        deployApp(app.id);
        toast.loading(`Deploying ${app.name}…`, { id: `deploy-${app.id}`, duration: 1400 });
        setTimeout(() => {
          toast.success(`${app.name} deployed`, {
            id: `deploy-${app.id}`,
            description: targetVersion ? `Now running v${targetVersion}` : "Deployment completed.",
          });
        }, 1400);
      },
    },
    {
      label: busy ? "Restarting…" : "Restart",
      icon: Power,
      disabled: retired || busy,
      run: () => {
        restartApp(app.id);
        toast.loading(`Restarting ${app.name}…`, { id: `restart-${app.id}`, duration: 1600 });
        setTimeout(() => toast.success(`${app.name} restarted`, { id: `restart-${app.id}` }), 1600);
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
            <StatusPill tone={statusTone[app.status]} dot={app.status === "running"}>{app.status}</StatusPill>
            <StatusPill tone="neutral">{app.environment}</StatusPill>
            <span className="font-mono text-xs text-eoc-muted">v{app.version}</span>
          </div>
        </div>
        <DrawerClose />
      </div>

      {panel === "console" && (
        <div className="flex items-center gap-1 border-b border-eoc-border px-5 py-2">
          <button onClick={() => setPanel("overview")} className="rounded-lg px-3 py-1.5 text-xs font-medium text-eoc-muted hover:text-eoc-fg">
            ← Back to overview
          </button>
        </div>
      )}

      <div className="flex-1 space-y-5 overflow-y-auto p-5 [scrollbar-width:thin]">
        {panel === "console" ? (
          <Surface className="space-y-4 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-eoc-muted">Application console</p>
            <p className="font-mono text-sm text-eoc-accent">{consoleUrl}</p>
            <p className="text-sm text-eoc-fg2">
              {app.name} is running in <strong className="text-eoc-fg">{app.environment}</strong>. Version <strong className="text-eoc-fg">v{app.version}</strong> · Health {app.health}%.
            </p>
            <div className="flex flex-wrap gap-2">
              <EButton size="sm" variant="secondary" onClick={() => window.open(consoleUrl, "_blank")}>Open in new tab</EButton>
              <EButton size="sm" variant="ghost" onClick={() => setPanel("overview")}>Back to overview</EButton>
            </div>
          </Surface>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              {actions.map((a) => (
                <EButton key={a.label} variant="secondary" className="justify-start" disabled={a.disabled} onClick={a.run}>
                  <a.icon className={cn("h-4 w-4", busy && a.icon === RefreshCw && "animate-spin")} /> {a.label}
                </EButton>
              ))}
            </div>

            {busy && (
              <Surface className="border-eoc-info/30 bg-eoc-info/10 p-3 text-sm text-eoc-fg2">
                {app.status === "updating" ? "Deployment in progress…" : "Restart in progress…"} Metrics will refresh when complete.
              </Surface>
            )}

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
          </>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-eoc-border p-4">
        <EButton
          variant="ghost"
          className="text-eoc-danger"
          disabled={retired || busy}
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
          disabled={busy}
          onClick={() => {
            const newId = cloneApp(app.id);
            if (newId) {
              toast.success(`${app.name} cloned`, { description: "Opening the staging copy." });
              onSwitch(newId);
            }
          }}
        >
          Clone
        </EButton>
        <EButton variant="primary" disabled={retired || busy} onClick={openConfig}>Manage</EButton>
      </div>

      <Modal open={configOpen} onOpenChange={(v) => { setConfigOpen(v); if (!v && app) reset({ owner: app.owner, environment: app.environment, licenseTotal: app.licenses.total, nextMaintenance: app.nextMaintenance }); }} title={`Manage ${app.name}`} description="Update ownership, environment, and capacity settings." width="max-w-lg">
        <form onSubmit={saveConfig} className="space-y-4 p-5">
          <FormField label="Owner" htmlFor="cfg-owner" error={errors.owner?.message}>
            <TextInput id="cfg-owner" {...register("owner")} placeholder="Team or person" />
          </FormField>
          <FormField label="Environment" htmlFor="cfg-env" error={errors.environment?.message}>
            <SelectInput id="cfg-env" {...register("environment")}>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </SelectInput>
          </FormField>
          <FormField label="License seats" htmlFor="cfg-lic" error={errors.licenseTotal?.message}>
            <TextInput id="cfg-lic" inputMode="numeric" {...register("licenseTotal", { valueAsNumber: true })} placeholder="Total seats" />
          </FormField>
          <FormField label="Next maintenance window" htmlFor="cfg-maint">
            <TextInput id="cfg-maint" {...register("nextMaintenance")} placeholder="e.g. Jul 15, 02:00–04:00" />
          </FormField>
          <div className="flex justify-end gap-2 pt-1">
            <EButton type="button" variant="secondary" onClick={() => setConfigOpen(false)}>Cancel</EButton>
            <EButton type="submit" variant="primary">Save changes</EButton>
          </div>
        </form>
      </Modal>
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
