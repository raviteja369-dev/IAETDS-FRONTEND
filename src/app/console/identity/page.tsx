"use client";

import * as React from "react";
import { Check, KeyRound, Search, ShieldCheck, UserPlus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import { SectionHeader, StatusPill, Surface, type Tone } from "@/components/eoc/primitives";
import { Modal, Field, TextInput } from "@/components/eoc/modal";
import { useEocStore } from "@/lib/eoc/store";
import type { AccessMember } from "@/lib/eoc/types";
import { inviteMemberSchema, type InviteMemberInput } from "@/lib/eoc/validation";
import { cn } from "@/lib/utils";

const statusTone: Record<string, Tone> = { active: "success", invited: "info", suspended: "danger" };

export default function IdentityPage() {
  const [query, setQuery] = React.useState("");
  const members = useEocStore((s) => s.members);
  const settings = useEocStore((s) => s.settings);
  const updateSettings = useEocStore((s) => s.updateSettings);
  const inviteMember = useEocStore((s) => s.inviteMember);
  const setMemberStatus = useEocStore((s) => s.setMemberStatus);
  const deleteMember = useEocStore((s) => s.deleteMember);
  const filtered = members.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()) || m.email.toLowerCase().includes(query.toLowerCase()) || m.role.toLowerCase().includes(query.toLowerCase()));

  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { name: "", email: "", role: "", department: "" },
  });

  const onSubmit = handleSubmit((data) => {
    setSubmitting(true);
    const result = inviteMember({
      name: data.name,
      email: data.email,
      role: data.role?.trim() || "Employee",
      department: data.department?.trim() || "Unassigned",
      status: "invited",
      mfa: false,
      lastActive: "Pending",
    });
    setSubmitting(false);
    if (!result.ok) {
      toast.error(result.error ?? "Could not send invitation");
      return;
    }
    toast.success("Invitation sent", { description: `${data.email} has been invited.` });
    reset();
    setOpen(false);
  });

  const setStatus = (id: string, status: AccessMember["status"]) => {
    setMemberStatus(id, status);
    toast.success(status === "suspended" ? "Member suspended" : "Member reactivated");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Enterprise IAM"
        title="Identity & Access"
        description="Manage organizations, roles, permissions, SSO, MFA and access requests with zero-trust governance."
        actions={
          <>
            <EButton variant="secondary" onClick={() => toast.info("SSO & MFA", { description: `MFA ${settings.mfa ? "enabled" : "disabled"} · SSO ${settings.sso ? "enabled" : "disabled"}. Configure in Settings.` })}><ShieldCheck className="h-4 w-4" /> SSO & MFA</EButton>
            <EButton variant="primary" onClick={() => setOpen(true)}><UserPlus className="h-4 w-4" /> Invite member</EButton>
          </>
        }
      />

      <Modal open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }} title="Invite member" description="Send an invitation to join this workspace." width="max-w-lg">
        <form onSubmit={onSubmit} className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full name" htmlFor="m-name" error={errors.name?.message}>
              <TextInput id="m-name" {...register("name")} placeholder="e.g. Aarav Mehta" autoFocus />
            </Field>
            <Field label="Email" htmlFor="m-email" error={errors.email?.message}>
              <TextInput id="m-email" type="email" {...register("email")} placeholder="name@company.com" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Role" htmlFor="m-role" hint="Defaults to Employee.">
              <TextInput id="m-role" {...register("role")} placeholder="e.g. DevOps Lead" />
            </Field>
            <Field label="Department" htmlFor="m-dept" hint="Defaults to Unassigned.">
              <TextInput id="m-dept" {...register("department")} placeholder="e.g. Engineering" />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <EButton type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</EButton>
            <EButton type="submit" variant="primary" disabled={submitting}>{submitting ? "Sending…" : "Send invitation"}</EButton>
          </div>
        </form>
      </Modal>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Members" value={members.length.toLocaleString("en-IN")} />
        <Stat label="MFA enabled" value={`${members.length ? Math.round((members.filter((m) => m.mfa).length / members.length) * 100) : 0}%`} tone="success" />
        <Stat label="Pending invites" value={String(members.filter((m) => m.status === "invited").length)} tone="warning" />
        <Stat label="Suspended" value={String(members.filter((m) => m.status === "suspended").length)} />
      </div>

      <Surface className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader title="Members & roles" description="Directory of users with access to this workspace" />
          <div className="flex h-9 items-center gap-2 rounded-lg border border-eoc-border bg-white/[0.03] px-3 sm:w-64">
            <Search className="h-4 w-4 text-eoc-muted" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search members…" className="flex-1 bg-transparent text-sm text-eoc-fg outline-none placeholder:text-eoc-muted" />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-eoc-muted">
                <th className="pb-3 font-medium">Member</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Department</th>
                <th className="pb-3 font-medium">MFA</th>
                <th className="pb-3 font-medium">Last active</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-sm text-eoc-muted">No members match your search.</td></tr>
              ) : filtered.map((m) => (
                <tr key={m.id} className="border-t border-eoc-border text-sm">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-eoc-accent to-[#7C3AED] text-xs font-semibold text-white">
                        {m.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-eoc-fg">{m.name}</p>
                        <p className="truncate text-xs text-eoc-muted">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-eoc-fg2">{m.role}</td>
                  <td className="py-3 pr-4 text-eoc-fg2">{m.department}</td>
                  <td className="py-3 pr-4">
                    {m.mfa ? <Check className="h-4 w-4 text-eoc-success" /> : <X className="h-4 w-4 text-eoc-danger" />}
                  </td>
                  <td className="py-3 pr-4 text-eoc-muted">{m.lastActive}</td>
                  <td className="py-3 pr-4"><StatusPill tone={statusTone[m.status]} dot={m.status === "active"}>{m.status}</StatusPill></td>
                  <td className="py-3 text-right space-x-2">
                    {m.status === "suspended" ? (
                      <button onClick={() => setStatus(m.id, "active")} className="text-xs font-medium text-eoc-success hover:text-eoc-fg">Reactivate</button>
                    ) : (
                      <button onClick={() => setStatus(m.id, "suspended")} className="text-xs font-medium text-eoc-danger hover:text-eoc-fg">Suspend</button>
                    )}
                    <button onClick={() => { deleteMember(m.id); toast.success("Member removed"); }} className="text-xs font-medium text-eoc-muted hover:text-eoc-fg">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Surface>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: Tone }) {
  return (
    <Surface hover className="p-5">
      <div className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-eoc-muted" /><p className="text-xs text-eoc-muted">{label}</p></div>
      <p className={cn("mt-1.5 text-2xl font-semibold", tone === "success" ? "text-eoc-success" : tone === "warning" ? "text-eoc-warning" : "text-eoc-fg")}>{value}</p>
    </Surface>
  );
}
