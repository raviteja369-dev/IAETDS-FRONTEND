"use client";

import * as React from "react";
import { Check, KeyRound, Search, ShieldCheck, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import { SectionHeader, StatusPill, Surface, type Tone } from "@/components/eoc/primitives";
import { accessMembers } from "@/lib/eoc/data";
import type { AccessMember } from "@/lib/eoc/types";
import { cn } from "@/lib/utils";

const statusTone: Record<string, Tone> = { active: "success", invited: "info", suspended: "danger" };

export default function IdentityPage() {
  const [query, setQuery] = React.useState("");
  const [members, setMembers] = React.useState<AccessMember[]>(accessMembers);
  const filtered = members.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()) || m.email.toLowerCase().includes(query.toLowerCase()) || m.role.toLowerCase().includes(query.toLowerCase()));

  const invite = () => {
    const n = members.length + 1;
    const member: AccessMember = {
      id: `u-${Date.now().toString(36)}`,
      name: `New Member ${n}`,
      email: `member${n}@northwind.io`,
      role: "Employee",
      department: "Unassigned",
      status: "invited",
      mfa: false,
      lastActive: "Pending",
    };
    setMembers((prev) => [member, ...prev]);
    toast.success("Invitation sent", { description: `${member.email} has been invited.` });
  };

  const setStatus = (id: string, status: AccessMember["status"]) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
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
            <EButton variant="secondary" onClick={() => toast.info("SSO & MFA", { description: "SAML/OIDC SSO enforced · MFA required for all admins." })}><ShieldCheck className="h-4 w-4" /> SSO & MFA</EButton>
            <EButton variant="primary" onClick={invite}><UserPlus className="h-4 w-4" /> Invite member</EButton>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Members" value="1,284" />
        <Stat label="MFA enabled" value="96%" tone="success" />
        <Stat label="Pending requests" value="3" tone="warning" />
        <Stat label="Service accounts" value="42" />
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
              {filtered.map((m) => (
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
                  <td className="py-3 text-right">
                    {m.status === "suspended" ? (
                      <button onClick={() => setStatus(m.id, "active")} className="text-xs font-medium text-eoc-success hover:text-eoc-fg">Reactivate</button>
                    ) : (
                      <button onClick={() => setStatus(m.id, "suspended")} className="text-xs font-medium text-eoc-danger hover:text-eoc-fg">Suspend</button>
                    )}
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
