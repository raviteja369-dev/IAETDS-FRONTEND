"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, NAV_GROUPS } from "@/lib/nav";
import { Logo } from "@/components/brand/logo";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { PanelLeftClose, PanelLeft, Activity } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Sidebar() {
  const pathname = usePathname();
  const can = useAuthStore((s) => s.can);
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggle = useUIStore((s) => s.toggleSidebar);

  const visible = NAV_ITEMS.filter((i) => can(i.permission));

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 lg:flex",
        collapsed ? "w-[76px]" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-sidebar-border px-4",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        {collapsed ? <Logo showText={false} /> : <Logo />}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto scrollbar-thin px-3 py-5">
        {NAV_GROUPS.map((group) => {
          const items = visible.filter((i) => i.group === group);
          if (!items.length) return null;
          return (
            <div key={group}>
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
                  {group}
                </p>
              )}
              <ul className="space-y-1">
                {items.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  const link = (
                    <Link
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "text-white"
                          : "text-sidebar-foreground/75 hover:bg-white/5 hover:text-white",
                        collapsed && "justify-center",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-lg bg-sidebar-accent/90 shadow-glow"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      <item.icon className="relative z-10 size-[18px] shrink-0" />
                      {!collapsed && (
                        <span className="relative z-10">{item.label}</span>
                      )}
                    </Link>
                  );

                  return (
                    <li key={item.href}>
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{link}</TooltipTrigger>
                          <TooltipContent side="right">
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        link
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="mb-3 rounded-lg bg-white/5 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-success">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success/60" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </span>
              All systems operational
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-sidebar-foreground/55">
              <Activity className="size-3" /> Uptime 99.98% · prod
            </div>
          </div>
        )}
        <button
          onClick={toggle}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-white/5 hover:text-white",
            collapsed && "justify-center",
          )}
        >
          {collapsed ? (
            <PanelLeft className="size-[18px]" />
          ) : (
            <>
              <PanelLeftClose className="size-[18px]" /> Collapse
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
