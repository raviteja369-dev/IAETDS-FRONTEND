"use client";

import * as React from "react";
import { Bell, Building2, Palette, ShieldCheck, User } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import { IconTile, SectionHeader, Surface } from "@/components/eoc/primitives";
import { TextInput } from "@/components/eoc/modal";
import { useEocStore } from "@/lib/eoc/store";
import { settingsSchema, type SettingsInput } from "@/lib/eoc/validation";
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

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  });

  React.useEffect(() => {
    reset(settings);
  }, [settings, reset]);

  const onSubmit = handleSubmit((data) => {
    updateSettings(data);
    toast.success("Settings saved", { description: "Your preferences have been updated." });
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace configuration"
        title="Settings"
        description="Manage your profile, workspace, security, notifications and appearance preferences."
        actions={<EButton variant="primary" onClick={onSubmit} disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save changes"}</EButton>}
      />

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Surface className="p-5">
          <div className="flex items-center gap-3"><IconTile icon={User} accent="#4F7CFF" /><SectionHeader title="Profile" description="Your personal account details" /></div>
          <div className="mt-4 space-y-3">
            <Field label="Full name" error={errors.profileName?.message}>
              <TextInput {...register("profileName")} />
            </Field>
            <Field label="Email" error={errors.profileEmail?.message}>
              <TextInput type="email" {...register("profileEmail")} />
            </Field>
            <Field label="Role" error={errors.profileRole?.message}>
              <TextInput {...register("profileRole")} />
            </Field>
          </div>
        </Surface>

        <Surface className="p-5">
          <div className="flex items-center gap-3"><IconTile icon={Building2} accent="#22C55E" /><SectionHeader title="Workspace" description="Organization-wide configuration" /></div>
          <div className="mt-4 space-y-3">
            <Field label="Workspace name" error={errors.workspaceName?.message}>
              <TextInput {...register("workspaceName")} />
            </Field>
            <Field label="Plan" error={errors.workspacePlan?.message}>
              <TextInput {...register("workspacePlan")} />
            </Field>
            <Field label="Region" error={errors.workspaceRegion?.message}>
              <TextInput {...register("workspaceRegion")} />
            </Field>
          </div>
        </Surface>

        <Surface className="p-5">
          <div className="flex items-center gap-3"><IconTile icon={ShieldCheck} accent="#EF4444" /><SectionHeader title="Security" description="Protect your account" /></div>
          <div className="mt-3">
            <Controller name="mfa" control={control} render={({ field }) => <Row title="Two-factor authentication" desc="Require MFA for sign-in" control={<Toggle on={field.value} onChange={field.onChange} />} />} />
            <Controller name="sso" control={control} render={({ field }) => <Row title="Single sign-on (SSO)" desc="Authenticate via your IdP" control={<Toggle on={field.value} onChange={field.onChange} />} />} />
            <Controller name="sessionTimeout" control={control} render={({ field }) => <Row title="Session timeout" desc="Auto-logout after inactivity" control={<Toggle on={field.value} onChange={field.onChange} />} />} />
          </div>
        </Surface>

        <Surface className="p-5">
          <div className="flex items-center gap-3"><IconTile icon={Bell} accent="#F59E0B" /><SectionHeader title="Notifications" description="Choose what you hear about" /></div>
          <div className="mt-3">
            <Controller name="securityAlerts" control={control} render={({ field }) => <Row title="Security alerts" desc="Critical threats and findings" control={<Toggle on={field.value} onChange={field.onChange} />} />} />
            <Controller name="billingNotifications" control={control} render={({ field }) => <Row title="Billing & invoices" desc="Payment and renewal updates" control={<Toggle on={field.value} onChange={field.onChange} />} />} />
            <Controller name="maintenanceNotifications" control={control} render={({ field }) => <Row title="Maintenance windows" desc="Scheduled and predictive maintenance" control={<Toggle on={field.value} onChange={field.onChange} />} />} />
            <Controller name="productUpdates" control={control} render={({ field }) => <Row title="Product updates" desc="New features and releases" control={<Toggle on={field.value} onChange={field.onChange} />} />} />
          </div>
        </Surface>

        <Surface className="p-5 xl:col-span-2">
          <div className="flex items-center gap-3"><IconTile icon={Palette} accent="#A855F7" /><SectionHeader title="Appearance" description="This platform is crafted for dark mode" /></div>
          <div className="mt-3">
            <Row title="Dark theme" desc="Optimized for focus and reduced eye strain (always on)" control={<Toggle on={true} onChange={() => {}} />} />
            <Controller name="reducedMotion" control={control} render={({ field }) => <Row title="Reduced motion" desc="Minimize animations and transitions" control={<Toggle on={field.value} onChange={field.onChange} />} />} />
            <Controller name="compactDensity" control={control} render={({ field }) => <Row title="Compact density" desc="Show more content per screen" control={<Toggle on={field.value} onChange={field.onChange} />} />} />
          </div>
        </Surface>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-eoc-muted">{label}</label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-eoc-danger">{error}</p>}
    </div>
  );
}
