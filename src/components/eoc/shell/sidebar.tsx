"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Hexagon } from "lucide-react";
import { cn } from "@/lib/utils";
import { navGroups, BASE } from "@/lib/eoc/nav";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === BASE ? pathname === BASE : pathname.startsWith(href);

  return (
    <div className="flex h-full flex-col">
      <Link
        href={BASE}
        onClick={onNavigate}
        className="flex h-16 shrink-0 items-center gap-2.5 px-5"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-eoc-accent to-[#7C3AED] text-white shadow-[0_4px_18px_-4px_rgba(79,124,255,0.7)]">
          <Hexagon className="h-5 w-5" fill="currentColor" fillOpacity={0.25} />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-eoc-fg">Atlas</p>
          <p className="text-[10px] text-eoc-muted">Operations Cloud</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4 [scrollbar-width:thin]">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-eoc-muted">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        active
                          ? "text-eoc-fg"
                          : "text-eoc-fg2 hover:bg-white/5 hover:text-eoc-fg",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-lg bg-white/[0.07] ring-1 ring-inset ring-white/10"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <Icon
                        className={cn(
                          "relative h-[18px] w-[18px] shrink-0 transition-colors",
                          active ? "text-eoc-accent" : "text-eoc-muted group-hover:text-eoc-fg2",
                        )}
                      />
                      <span className="relative flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="relative rounded-full bg-eoc-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-eoc-accent">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-eoc-border p-3">
        <div className="rounded-xl border border-eoc-border bg-eoc-surface/60 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-eoc-fg">Enterprise Plan</p>
            <span className="h-1.5 w-1.5 rounded-full bg-eoc-success" />
          </div>
          <p className="mt-1 text-[11px] text-eoc-muted">42 apps · 1,284 users</p>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/8">
            <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-eoc-accent to-[#7C3AED]" />
          </div>
        </div>
      </div>
    </div>
  );
}
