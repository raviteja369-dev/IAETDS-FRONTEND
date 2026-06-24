"use client";

import * as React from "react";
import { useResourceList } from "@/hooks/use-resource";
import { useDebounce } from "@/hooks/use-debounce";
import type { User } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { Toolbar } from "@/components/shared/toolbar";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FormDialog } from "@/components/shared/form-dialog";
import { useAuthStore } from "@/store/auth";
import { initials, timeAgo, titleCase } from "@/lib/utils";
import { Users, UserPlus, ShieldCheck, Shield, Wrench, Eye, Briefcase } from "lucide-react";

const USER_FIELDS = [
  { name: "name", label: "Full Name", required: true, placeholder: "Jane Doe" },
  { name: "email", label: "Email", type: "email" as const, required: true, placeholder: "jane@iaetds.io" },
  {
    name: "role",
    label: "Role",
    type: "select" as const,
    options: ["super_admin", "security_analyst", "maintenance_engineer", "operations_manager", "viewer"].map((v) => ({ value: v, label: titleCase(v) })),
    default: "viewer",
  },
  {
    name: "department",
    label: "Department",
    type: "select" as const,
    options: ["Operations", "Security", "Infrastructure", "Compliance", "Executive"].map((v) => ({ value: v, label: v })),
  },
  { name: "title", label: "Job Title", placeholder: "e.g. SOC Analyst", colSpan: 2 as const },
  { name: "password", label: "Temporary Password", required: true, default: "Password123!", colSpan: 2 as const },
];

const ROLE_META: Record<string, { icon: any; accent: string; desc: string }> = {
  super_admin: { icon: ShieldCheck, accent: "#6366f1", desc: "Full platform control" },
  security_analyst: { icon: Shield, accent: "#ef4444", desc: "SOC & threat response" },
  maintenance_engineer: { icon: Wrench, accent: "#10b981", desc: "Assets & maintenance" },
  operations_manager: { icon: Briefcase, accent: "#f59e0b", desc: "Operations oversight" },
  viewer: { icon: Eye, accent: "#0ea5e9", desc: "Read-only access" },
};

const FILTERS = [
  {
    key: "role",
    placeholder: "Role",
    options: Object.keys(ROLE_META).map((v) => ({ value: v, label: titleCase(v) })),
  },
  {
    key: "status",
    placeholder: "Status",
    options: ["active", "suspended", "invited"].map((v) => ({ value: v, label: titleCase(v) })),
  },
];

export default function UsersPage() {
  const [search, setSearch] = React.useState("");
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [page, setPage] = React.useState(1);
  const [createOpen, setCreateOpen] = React.useState(false);
  const can = useAuthStore((s) => s.can);
  const debounced = useDebounce(search);

  const { data, isLoading } = useResourceList<User>("users", {
    page,
    limit: 12,
    search: debounced,
    ...filters,
  });

  const all = useResourceList<User>("users", { limit: 100 });
  const roleCounts = (all.data?.data ?? []).reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Manage team members, roles, and role-based access control."
      >
        {can("users:write") && (
          <Button variant="gradient" size="sm" onClick={() => setCreateOpen(true)}>
            <UserPlus className="size-4" /> Invite User
          </Button>
        )}
      </PageHeader>

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Invite User"
        description="Create a new team member account with a role."
        resource="users"
        submitLabel="Create User"
        successMessage="User invited"
        fields={USER_FIELDS}
        transform={(v) => ({ ...v, status: "active" })}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {Object.entries(ROLE_META).map(([role, meta]) => (
          <div
            key={role}
            className="rounded-xl border border-border bg-card p-4 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <div
                className="grid size-9 place-items-center rounded-lg"
                style={{ backgroundColor: `${meta.accent}1a`, color: meta.accent }}
              >
                <meta.icon className="size-4" />
              </div>
              <span className="text-xl font-bold tabular-nums">
                {roleCounts[role] ?? 0}
              </span>
            </div>
            <div className="mt-2 text-sm font-medium">{titleCase(role)}</div>
            <div className="text-xs text-muted-foreground">{meta.desc}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-soft">
        <div className="p-5 pb-0">
          <Toolbar
            search={search}
            onSearch={(v) => {
              setSearch(v);
              setPage(1);
            }}
            searchPlaceholder="Search by name, email, department…"
            filters={FILTERS}
            values={filters}
            onFilterChange={(k, v) => {
              setFilters((f) => ({ ...f, [k]: v }));
              setPage(1);
            }}
          />
        </div>

        {isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : data && data.data.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>MFA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback
                            style={{ backgroundColor: u.avatarColor, color: "white" }}
                          >
                            {initials(u.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{u.name}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                        {React.createElement(
                          (ROLE_META[u.role] ?? ROLE_META.viewer).icon,
                          {
                            className: "size-3.5",
                            style: { color: (ROLE_META[u.role] ?? ROLE_META.viewer).accent },
                          },
                        )}
                        {titleCase(u.role)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.department}
                    </TableCell>
                    <TableCell>
                      {u.mfaEnabled ? (
                        <StatusBadge value="active" label="Enabled" />
                      ) : (
                        <StatusBadge value="low" label="Off" dot={false} />
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={u.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {timeAgo(u.lastActiveAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination pagination={data.pagination} onPage={setPage} />
          </>
        ) : (
          <EmptyState icon={Users} title="No users found" />
        )}
      </div>
    </div>
  );
}
