"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Popover from "@radix-ui/react-popover";
import {
  Bell,
  Check,
  ChevronDown,
  Command as CommandIcon,
  Menu,
  Plus,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { flatNav, BASE } from "@/lib/eoc/nav";
import { currentUser, workspaces } from "@/lib/eoc/data";
import { selectUnreadCount, useEocStore } from "@/lib/eoc/store";
import { StatusPill } from "../primitives";

const menuCls =
  "z-[60] min-w-[220px] overflow-hidden rounded-xl border border-eoc-border bg-eoc-elevated/95 p-1.5 shadow-2xl backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95";
const itemCls =
  "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-eoc-fg2 outline-none transition-colors data-[highlighted]:bg-white/[0.07] data-[highlighted]:text-eoc-fg";

export function Topbar({
  onOpenPalette,
  onOpenSidebar,
}: {
  onOpenPalette: () => void;
  onOpenSidebar: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeWs, setActiveWs] = React.useState(workspaces[0]);
  const notifications = useEocStore((s) => s.notifications);
  const markRead = useEocStore((s) => s.markRead);
  const markAllRead = useEocStore((s) => s.markAllRead);
  const unread = useEocStore(selectUnreadCount);

  const current = flatNav.find((n) =>
    n.href === BASE ? pathname === BASE : pathname.startsWith(n.href),
  );

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-eoc-border bg-eoc-bg/80 px-4 backdrop-blur-xl lg:px-6">
      <button
        onClick={onOpenSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-eoc-fg2 hover:bg-white/5 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Workspace switcher */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="flex items-center gap-2 rounded-lg border border-eoc-border bg-white/[0.03] px-2.5 py-1.5 text-sm text-eoc-fg transition-colors hover:bg-white/[0.07] focus:outline-none">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-eoc-accent to-[#7C3AED] text-[10px] font-bold text-white">
            {activeWs.name.slice(0, 2).toUpperCase()}
          </span>
          <span className="hidden max-w-[140px] truncate font-medium sm:block">{activeWs.name}</span>
          <ChevronDown className="h-3.5 w-3.5 text-eoc-muted" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className={menuCls} align="start" sideOffset={8}>
            <DropdownMenu.Label className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-eoc-muted">
              Workspaces
            </DropdownMenu.Label>
            {workspaces.map((ws) => (
              <DropdownMenu.Item key={ws.id} className={itemCls} onSelect={() => setActiveWs(ws)}>
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/5 text-[10px] font-bold text-eoc-fg2">
                  {ws.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="flex-1">
                  <p className="text-eoc-fg">{ws.name}</p>
                  <p className="text-[11px] text-eoc-muted">{ws.plan}</p>
                </div>
                {ws.id === activeWs.id && <Check className="h-4 w-4 text-eoc-accent" />}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Breadcrumb */}
      <div className="hidden items-center gap-2 text-sm text-eoc-muted md:flex">
        <span>/</span>
        <span className="text-eoc-fg2">{current?.label ?? "Dashboard"}</span>
      </div>

      {/* Search trigger */}
      <button
        onClick={onOpenPalette}
        className="group ml-auto flex h-9 items-center gap-2 rounded-lg border border-eoc-border bg-white/[0.03] px-3 text-sm text-eoc-muted transition-colors hover:bg-white/[0.07] md:w-72"
      >
        <Search className="h-4 w-4" />
        <span className="hidden flex-1 text-left md:block">Search everything…</span>
        <kbd className="hidden items-center gap-0.5 rounded-md border border-eoc-border px-1.5 py-0.5 text-[10px] md:flex">
          <CommandIcon className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      {/* Quick create */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="flex h-9 items-center gap-1.5 rounded-lg bg-eoc-accent px-3 text-sm font-medium text-white shadow-[0_4px_18px_-6px_rgba(79,124,255,0.7)] transition-colors hover:bg-eoc-accent/90 focus:outline-none">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:block">Create</span>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className={menuCls} align="end" sideOffset={8}>
            {[
              ["Install application", "/console/marketplace"],
              ["New automation", "/console/automation"],
              ["Schedule maintenance", "/console/maintenance"],
              ["Invite member", "/console/identity"],
              ["Create report", "/console/analytics"],
            ].map(([label, href]) => (
              <DropdownMenu.Item key={label} className={itemCls} onSelect={() => router.push(href)}>
                <Plus className="h-4 w-4 text-eoc-muted" />
                {label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Notifications */}
      <Popover.Root>
        <Popover.Trigger className="relative flex h-9 w-9 items-center justify-center rounded-lg text-eoc-fg2 transition-colors hover:bg-white/5 focus:outline-none">
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-eoc-danger opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-eoc-danger" />
            </span>
          )}
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="end"
            sideOffset={8}
            className="z-[60] w-[360px] overflow-hidden rounded-xl border border-eoc-border bg-eoc-elevated/95 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-eoc-border px-4 py-3">
              <p className="text-sm font-semibold text-eoc-fg">Notifications</p>
              <button
                onClick={() => markAllRead()}
                className="text-xs font-medium text-eoc-accent hover:text-eoc-fg disabled:text-eoc-muted"
                disabled={unread === 0}
              >
                Mark all read
              </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto [scrollbar-width:thin]">
              {notifications.slice(0, 12).map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "flex w-full gap-3 border-b border-eoc-border px-4 py-3 text-left transition-colors hover:bg-white/[0.03]",
                    !n.read && "bg-white/[0.02]",
                  )}
                >
                  <span
                    className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", {
                      "bg-eoc-info": n.tone === "info",
                      "bg-eoc-success": n.tone === "success",
                      "bg-eoc-warning": n.tone === "warning",
                      "bg-eoc-danger": n.tone === "danger",
                    })}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-eoc-fg">{n.title}</p>
                    <p className="mt-0.5 text-xs text-eoc-fg2">{n.detail}</p>
                    <p className="mt-1 text-[11px] text-eoc-muted">{n.at}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => router.push("/console/notifications")}
              className="w-full py-2.5 text-center text-xs font-medium text-eoc-accent hover:bg-white/[0.03]"
            >
              View all notifications
            </button>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* User menu */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="flex items-center gap-2 rounded-lg pl-1 pr-2 outline-none transition-colors hover:bg-white/5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-eoc-accent to-[#7C3AED] text-xs font-semibold text-white">
            {currentUser.initials}
          </span>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className={menuCls} align="end" sideOffset={8}>
            <div className="border-b border-eoc-border px-2.5 py-2.5">
              <p className="text-sm font-medium text-eoc-fg">{currentUser.name}</p>
              <p className="text-xs text-eoc-muted">{currentUser.email}</p>
              <div className="mt-2">
                <StatusPill tone="info">{currentUser.role}</StatusPill>
              </div>
            </div>
            {[
              ["Profile & preferences", "/console/settings"],
              ["Identity & access", "/console/identity"],
              ["Billing & payments", "/console/billing"],
              ["Audit logs", "/console/audit"],
            ].map(([label, href]) => (
              <DropdownMenu.Item key={label} className={itemCls} onSelect={() => router.push(href)}>
                {label}
              </DropdownMenu.Item>
            ))}
            <DropdownMenu.Separator className="my-1 h-px bg-eoc-border" />
            <DropdownMenu.Item className={cn(itemCls, "text-eoc-danger data-[highlighted]:text-eoc-danger")} onSelect={() => router.push("/login")}>
              Sign out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </header>
  );
}
