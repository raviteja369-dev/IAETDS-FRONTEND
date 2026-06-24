"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Lock, ShieldCheck, KeyRound, Check } from "lucide-react";
import { api, apiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Separator } from "@/components/ui/separator";
import { initials, titleCase, formatDateTime } from "@/lib/utils";

const RULES = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "One number", test: (v: string) => /[0-9]/.test(v) },
];

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [show, setShow] = React.useState(false);

  const changePassword = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch("/auth/change-password", {
        currentPassword: current,
        newPassword: next,
      });
      return data.data;
    },
    onSuccess: () => {
      toast.success("Password updated", {
        description: "Your password has been changed successfully.",
      });
      setCurrent("");
      setNext("");
      setConfirm("");
    },
    onError: (err) =>
      toast.error("Could not update password", { description: apiError(err) }),
  });

  const rulesPass = RULES.every((r) => r.test(next));
  const matches = next.length > 0 && next === confirm;
  const canSubmit = current.length > 0 && rulesPass && matches && !changePassword.isPending;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matches) {
      toast.error("Passwords do not match");
      return;
    }
    changePassword.mutate();
  };

  if (!user) return null;

  return (
    <div>
      <PageHeader
        title="Profile & Security"
        description="Manage your account details and credentials."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Account card */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <div className="flex flex-col items-center text-center">
              <Avatar className="size-20 text-xl">
                <AvatarFallback
                  style={{ backgroundColor: user.avatarColor, color: "white" }}
                >
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-lg font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.title}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <StatusBadge value="primary" label={titleCase(user.role)} dot={false} />
                <StatusBadge value={user.status} />
              </div>
            </div>

            <Separator className="my-5" />

            <dl className="space-y-3 text-sm">
              <Row label="Email" value={user.email} />
              <Row label="Department" value={user.department} />
              <Row label="Last login" value={formatDateTime(user.lastLoginAt)} />
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">MFA</dt>
                <dd>
                  {user.mfaEnabled ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                      <ShieldCheck className="size-4" /> Enabled
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">
                      Disabled
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Change password */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card shadow-soft">
            <div className="flex items-center gap-3 border-b border-border px-6 py-4">
              <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <KeyRound className="size-4" />
              </div>
              <div>
                <h3 className="font-semibold tracking-tight">Change Password</h3>
                <p className="text-xs text-muted-foreground">
                  Use a strong, unique password to protect your account.
                </p>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-5 p-6">
              <Field
                id="current"
                label="Current password"
                value={current}
                onChange={setCurrent}
                show={show}
                placeholder="Enter your current password"
              />

              <Separator />

              <Field
                id="next"
                label="New password"
                value={next}
                onChange={setNext}
                show={show}
                placeholder="Enter a new password"
              />

              <Field
                id="confirm"
                label="Confirm new password"
                value={confirm}
                onChange={setConfirm}
                show={show}
                placeholder="Re-enter the new password"
                error={confirm.length > 0 && !matches ? "Passwords do not match" : undefined}
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  {show ? "Hide" : "Show"} passwords
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/30 p-3 sm:grid-cols-4">
                {RULES.map((r) => {
                  const ok = r.test(next);
                  return (
                    <div
                      key={r.label}
                      className={`flex items-center gap-1.5 text-xs ${
                        ok ? "text-success" : "text-muted-foreground"
                      }`}
                    >
                      <span
                        className={`grid size-4 place-items-center rounded-full ${
                          ok ? "bg-success/15" : "bg-muted"
                        }`}
                      >
                        <Check className="size-2.5" />
                      </span>
                      {r.label}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCurrent("");
                    setNext("");
                    setConfirm("");
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" disabled={!canSubmit}>
                  {changePassword.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Lock className="size-4" />
                  )}
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  show,
  placeholder,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10"
          autoComplete="off"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
