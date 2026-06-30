"use client";

import * as React from "react";
import { Bell, Building2, Palette, ShieldCheck, User } from "lucide-react";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import { IconTile, SectionHeader, Surface } from "@/components/eoc/primitives";
import { currentUser, workspace } from "@/lib/eoc/data";
import { cn } from "@/lib/utils";

function Toggle({ defaultOn }: { defaultOn?: boolean }) {
  const [on, setOn] = React.useState(!!defaultOn);
  return (
    <button
      onClick={() => setOn((v) => !v)}
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
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace configuration"
        title="Settings"
        description="Manage your profile, workspace, security, notifications and appearance preferences."
        actions={<EButton variant="primary">Save changes</EButton>}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Surface className="p-5">
          <div className="flex items-center gap-3"><IconTile icon={User} accent="#4F7CFF" /><SectionHeader title="Profile" description="Your personal account details" /></div>
          <div className="mt-4 space-y-3">
            <Field label="Full name" value={currentUser.name} />
            <Field label="Email" value={currentUser.email} />
            <Field label="Role" value={currentUser.role} />
          </div>
        </Surface>

        <Surface className="p-5">
          <div className="flex items-center gap-3"><IconTile icon={Building2} accent="#22C55E" /><SectionHeader title="Workspace" description="Organization-wide configuration" /></div>
          <div className="mt-4 space-y-3">
            <Field label="Workspace name" value={workspace.name} />
            <Field label="Plan" value={workspace.plan} />
            <Field label="Region" value={workspace.region} />
          </div>
        </Surface>

        <Surface className="p-5">
          <div className="flex items-center gap-3"><IconTile icon={ShieldCheck} accent="#EF4444" /><SectionHeader title="Security" description="Protect your account" /></div>
          <div className="mt-3">
            <Row title="Two-factor authentication" desc="Require MFA for sign-in" control={<Toggle defaultOn />} />
            <Row title="Single sign-on (SSO)" desc="Authenticate via your IdP" control={<Toggle defaultOn />} />
            <Row title="Session timeout" desc="Auto-logout after inactivity" control={<Toggle />} />
          </div>
        </Surface>

        <Surface className="p-5">
          <div className="flex items-center gap-3"><IconTile icon={Bell} accent="#F59E0B" /><SectionHeader title="Notifications" description="Choose what you hear about" /></div>
          <div className="mt-3">
            <Row title="Security alerts" desc="Critical threats and findings" control={<Toggle defaultOn />} />
            <Row title="Billing & invoices" desc="Payment and renewal updates" control={<Toggle defaultOn />} />
            <Row title="Maintenance windows" desc="Scheduled and predictive maintenance" control={<Toggle defaultOn />} />
            <Row title="Product updates" desc="New features and releases" control={<Toggle />} />
          </div>
        </Surface>

        <Surface className="p-5 xl:col-span-2">
          <div className="flex items-center gap-3"><IconTile icon={Palette} accent="#A855F7" /><SectionHeader title="Appearance" description="This platform is crafted for dark mode" /></div>
          <div className="mt-3">
            <Row title="Dark theme" desc="Optimized for focus and reduced eye strain" control={<Toggle defaultOn />} />
            <Row title="Reduced motion" desc="Minimize animations and transitions" control={<Toggle />} />
            <Row title="Compact density" desc="Show more content per screen" control={<Toggle />} />
          </div>
        </Surface>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs text-eoc-muted">{label}</label>
      <div className="mt-1 flex h-10 items-center rounded-xl border border-eoc-border bg-white/[0.03] px-3 text-sm text-eoc-fg">{value}</div>
    </div>
  );
}
