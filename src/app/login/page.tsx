"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { LoginAside } from "@/components/auth/login-aside";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLogin } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth";
import { apiError } from "@/lib/api";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const DEMO_ACCOUNTS = [
  { role: "Super Admin", email: "admin@iaetds.io" },
  { role: "Security Analyst", email: "analyst@iaetds.io" },
  { role: "Maintenance Eng.", email: "engineer@iaetds.io" },
  { role: "Operations Mgr.", email: "manager@iaetds.io" },
  { role: "Viewer", email: "viewer@iaetds.io" },
];

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  const [email, setEmail] = React.useState("admin@iaetds.io");
  const [password, setPassword] = React.useState("Password123!");
  const [remember, setRemember] = React.useState(true);
  const [showPw, setShowPw] = React.useState(false);

  React.useEffect(() => {
    if (hydrated && user) router.replace("/console");
  }, [hydrated, user, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync({ email, password, remember });
      toast.success("Welcome back", { description: "Authentication successful." });
    } catch (err) {
      toast.error("Sign-in failed", { description: apiError(err) });
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <LoginAside />

      <div className="relative flex flex-col items-center justify-center px-6 py-10">
        <div className="absolute right-5 top-5">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <Logo size="lg" />
          </div>

          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="size-3.5 text-success" />
            Secure enterprise access
          </div>

          <h2 className="text-2xl font-bold tracking-tight">Sign in to IAETDS</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Enter your credentials to access the command center.
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() =>
                    toast.info("Password reset", {
                      description: "A reset link would be emailed to you.",
                    })
                  }
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  className="px-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <Switch checked={remember} onCheckedChange={setRemember} />
                Remember me for 7 days
              </label>
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              disabled={login.isPending}
            >
              {login.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  Sign in securely <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            OR CONTINUE WITH
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {["SSO / SAML", "Microsoft Entra"].map((p) => (
              <Button
                key={p}
                type="button"
                variant="outline"
                onClick={() =>
                  toast.info(`${p}`, {
                    description: "Enterprise SSO would launch here.",
                  })
                }
              >
                {p}
              </Button>
            ))}
          </div>

          <div className="mt-7 rounded-xl border border-dashed border-border bg-muted/30 p-3">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              Demo accounts — password{" "}
              <span className="font-mono text-foreground">Password123!</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => {
                    setEmail(a.email);
                    setPassword("Password123!");
                  }}
                  className="rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium transition-colors hover:border-primary hover:text-primary"
                >
                  {a.role}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Protected by enterprise-grade encryption & MFA-ready authentication.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
