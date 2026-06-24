"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/brand/logo";
import { ShieldCheck, Activity, Lock, Globe } from "lucide-react";

const features = [
  { icon: ShieldCheck, text: "Zero-trust security operations center" },
  { icon: Activity, text: "Real-time infrastructure observability" },
  { icon: Lock, text: "SOC 2, ISO 27001 & GDPR aligned" },
  { icon: Globe, text: "Multi-region resilience & DR" },
];

export function LoginAside() {
  return (
    <div className="relative hidden overflow-hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute -left-24 top-1/3 size-[28rem] rounded-full bg-primary/30 blur-[120px]" />
      <div className="absolute -right-20 bottom-0 size-[24rem] rounded-full bg-sky-500/20 blur-[120px]" />

      {/* animated scanning line */}
      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
        animate={{ y: ["0vh", "100vh"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10">
        <Logo size="lg" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-md"
      >
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
          The unified command center for{" "}
          <span className="text-gradient">enterprise resilience</span>.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-sidebar-foreground/80">
          Defend, monitor, and sustain your entire technology estate — security,
          infrastructure, performance, and operations — from a single
          intelligent platform.
        </p>

        <ul className="mt-8 space-y-3">
          {features.map((f, i) => (
            <motion.li
              key={f.text}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-3 text-sm text-sidebar-foreground/90"
            >
              <span className="grid size-8 place-items-center rounded-lg bg-white/5 ring-1 ring-white/10">
                <f.icon className="size-4 text-primary" />
              </span>
              {f.text}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <div className="relative z-10 flex items-center gap-2 text-xs text-sidebar-foreground/60">
        <ShieldCheck className="size-3.5 text-success" />
        SOC 2 · ISO 27001 · GDPR compliant
      </div>
    </div>
  );
}
