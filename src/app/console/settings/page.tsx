"use client";

import * as React from "react";
import { Bell, Building2, Palette, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import { IconTile, SectionHeader, Surface } from "@/components/eoc/primitives";
import { TextInput } from "@/components/eoc/modal";
import { useEocStore, type WorkspaceSettings } from "@/lib/eoc/store";
import { cn } from "@/lib/utils";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", on ? "bg-eoc-accent" : "bg-white/10")}
    >
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", on ? "translate-x-[22px]" : "translate-x-0.5")} />
    </button>
  );
}

function Row({ title, desc, control }: { title: string; desc: string; control: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-eoc-border py-3.5 first:border-t-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-eoc-fg">{title}</p>
        <p className="text-xs text-eoc-muted">{desc}</p>
      </div>
      {control}
    </div>
  );
}

export default function SettingsPage() {
  const settings = useEocStore((s) => s.settings);
  const updateSettings = useEocStore((s) => s.updateSettings);
  const [draft, setDraft] = React.useState<WorkspaceSettings>(settings);

  React.useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const set = <K extends keyof WorkspaceSettings>(key: K, value: WorkspaceSettings[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const save = () => {
    updateSettings(draft);
    toast.success("Settings saved", { description: "Your preferences have been updated." });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace configuration"
        title="Settings"
        description="Manage your profile, workspace, security, notifications and appearance preferences."
        actions={<EButton variant="primary" onClick={save}>Save changes</EButton>}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Surface className="p-5">
          <div className="flex items-center gap-3"><IconTile icon={User} accent="#4F7CFF" /><SectionHeader title="Profile" description="Your personal account details" /></div>
          <div className="mt-4 space-y-3">
            <Field label="Full name" value={draft.profileName} onChange={(v) => set("profileName", v)} />
            <Field label="Email" value={draft.profileEmail} onChange={(v) => set("profileEmail", v)} />
            <Field label="Role" value={draft.profileRole} onChange={(v) => set("profileRole", v)} />
          </div>
        </Surface>

        <Surface className="p-5">
          <div className="flex items-center gap-3"><IconTile icon={Building2} accent="#22C55E" /><SectionHeader title="Workspace" description="Organization-wide configuration" /></div>
          <div className="mt-4 space-y-3">
            <Field label="Workspace name" value={draft.workspaceName} onChange={(v) => set("workspaceName", v)} />
            <Field label="Plan" value={draft.workspacePlan} onChange={(v) => set("workspacePlan", v)} />
            <Field label="Region" value={draft.workspaceRegion} onChange={(v) => set("workspaceRegion", v)} />
          </div>
        </Surface>

        <Surface className="p-5">
          <div className="flex items-center gap-3"><IconTile icon={ShieldCheck} accent="#EF4444" /><SectionHeader title="Security" description="Protect your account" /></div>
          <div className="mt-3">
            <Row title="Two-factor authentication" desc="Require MFA for sign-in" control={<Toggle on={draft.mfa} onChange={(v) => set("mfa", v)} />} />
            <Row title="Single sign-on (SSO)" desc="Authenticate via your IdP" control={<Toggle on={draft.sso} onChange={(v) => set("sso", v)} />} />
            <Row title="Session timeout" desc="Auto-logout after inactivity" control={<Toggle on={draft.sessionTimeout} onChange={(v) => set("sessionTimeout", v)} />} />
          </div>
        </Surface>

        <Surface className="p-5">
          <div className="flex items-center gap-3"><IconTile icon={Bell} accent="#F59E0B" /><SectionHeader title="Notifications" description="Choose what you hear about" /></div>
          <div className="mt-3">
            <Row title="Security alerts" desc="Critical threats and findings" control={<Toggle on={draft.securityAlerts} onChange={(v) => set("securityAlerts", v)} />} />
            <Row title="Billing & invoices" desc="Payment and renewal updates" control={<Toggle on={draft.billingNotifications} onChange={(v) => set("billingNotifications", v)} />} />
            <Row title="Maintenance windows" desc="Scheduled and predictive maintenance" control={<Toggle on={draft.maintenanceNotifications} onChange={(v) => set("maintenanceNotifications", v)} />} />
            <Row title="Product updates" desc="New features and releases" control={<Toggle on={draft.productUpdates} onChange={(v) => set("productUpdates", v)} />} />
          </div>
        </Surface>

        <Surface className="p-5 xl:col-span-2">
          <div className="flex items-center gap-3"><IconTile icon={Palette} accent="#A855F7" /><SectionHeader title="Appearance" description="This platform is crafted for dark mode" /></div>
          <div className="mt-3">
            <Row title="Dark theme" desc="Optimized for focus and reduced eye strain" control={<Toggle on={true} onChange={() => {}} />} />
            <Row title="Reduced motion" desc="Minimize animations and transitions" control={<Toggle on={draft.reducedMotion} onChange={(v) => set("reducedMotion", v)} />} />
            <Row title="Compact density" desc="Show more content per screen" control={<Toggle on={draft.compactDensity} onChange={(v) => set("compactDensity", v)} />} />
          </div>
        </Surface>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-eoc-muted">{label}</label>
      <TextInput value={value} onChange={(e) => onChange(e.target.value)} className="mt-1" />
    </div>
  );
}
