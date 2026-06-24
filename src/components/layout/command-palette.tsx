"use client";

import * as React from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useUIStore } from "@/store/ui";
import { useAuthStore } from "@/store/auth";
import { NAV_ITEMS } from "@/lib/nav";
import { useLogout } from "@/hooks/use-auth";
import {
  useGlobalSearch,
  type SearchResult,
  type SearchResultType,
} from "@/hooks/use-search";
import {
  Search,
  Moon,
  Sun,
  LogOut,
  Plus,
  CornerDownLeft,
  Loader2,
  Boxes,
  Siren,
  Wrench,
  Users,
  FileBarChart,
  type LucideIcon,
} from "lucide-react";

const TYPE_META: Record<
  SearchResultType,
  { label: string; icon: LucideIcon; badge: string; heading: string }
> = {
  asset: {
    label: "Asset",
    heading: "Assets",
    icon: Boxes,
    badge: "bg-sky-500/15 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/25",
  },
  incident: {
    label: "Incident",
    heading: "Incidents",
    icon: Siren,
    badge: "bg-rose-500/15 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/25",
  },
  maintenance: {
    label: "Maintenance",
    heading: "Maintenance",
    icon: Wrench,
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/25",
  },
  user: {
    label: "User",
    heading: "Users",
    icon: Users,
    badge: "bg-violet-500/15 text-violet-600 dark:text-violet-400 ring-1 ring-violet-500/25",
  },
  report: {
    label: "Report",
    heading: "Reports",
    icon: FileBarChart,
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/25",
  },
};

const TYPE_ORDER: SearchResultType[] = [
  "asset",
  "incident",
  "maintenance",
  "user",
  "report",
];

function groupByType(results: SearchResult[]) {
  const groups = new Map<SearchResultType, SearchResult[]>();
  for (const r of results) {
    const list = groups.get(r.type) ?? [];
    list.push(r);
    groups.set(r.type, list);
  }
  return TYPE_ORDER.filter((t) => groups.has(t)).map((t) => ({
    type: t,
    items: groups.get(t)!,
  }));
}

export function CommandPalette() {
  const open = useUIStore((s) => s.commandOpen);
  const setOpen = useUIStore((s) => s.setCommandOpen);
  const can = useAuthStore((s) => s.can);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const logout = useLogout();

  const [query, setQuery] = React.useState("");
  const { results, isLoading, hasQuery } = useGlobalSearch(query);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const q = query.trim().toLowerCase();
  const nav = NAV_ITEMS.filter((i) => can(i.permission)).filter(
    (i) => !q || i.label.toLowerCase().includes(q),
  );
  const grouped = groupByType(results);
  const showEmpty = hasQuery && !isLoading && results.length === 0 && nav.length === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-xl [&>button]:hidden">
        <Command
          shouldFilter={false}
          className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground"
        >
          <div className="flex items-center gap-2 border-b border-border px-4">
            {isLoading ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : (
              <Search className="size-4 text-muted-foreground" />
            )}
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search assets, incidents, maintenance, users, reports..."
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto scrollbar-thin p-2">
            {showEmpty && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No results found for &ldquo;{query.trim()}&rdquo;.
              </div>
            )}

            {nav.length > 0 && (
              <Command.Group heading="Navigation">
                {nav.map((item) => (
                  <Command.Item
                    key={item.href}
                    value={`nav:${item.href}`}
                    onSelect={() => go(item.href)}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                  >
                    <item.icon className="size-4 text-muted-foreground" />
                    {item.label}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {grouped.map(({ type, items }) => {
              const meta = TYPE_META[type];
              return (
                <Command.Group key={type} heading={meta.heading}>
                  {items.map((item) => (
                    <Command.Item
                      key={item.id}
                      value={`${item.type}:${item.id}`}
                      onSelect={() => go(item.href)}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                    >
                      <meta.icon className="size-4 shrink-0 text-muted-foreground" />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-medium">{item.label}</span>
                        {item.subtitle && (
                          <span className="truncate text-xs text-muted-foreground">
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.badge}`}
                      >
                        {meta.label}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              );
            })}

            {!hasQuery && (
              <Command.Group heading="Quick actions">
                {can("incidents:write") && (
                  <Command.Item
                    value="action:declare-incident"
                    onSelect={() => go("/incidents")}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm aria-selected:bg-accent"
                  >
                    <Plus className="size-4 text-muted-foreground" /> Declare incident
                  </Command.Item>
                )}
                {can("assets:write") && (
                  <Command.Item
                    value="action:register-asset"
                    onSelect={() => go("/assets")}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm aria-selected:bg-accent"
                  >
                    <Plus className="size-4 text-muted-foreground" /> Register asset
                  </Command.Item>
                )}
                <Command.Item
                  value="action:toggle-theme"
                  onSelect={() => {
                    setTheme(theme === "dark" ? "light" : "dark");
                  }}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm aria-selected:bg-accent"
                >
                  {theme === "dark" ? (
                    <Sun className="size-4 text-muted-foreground" />
                  ) : (
                    <Moon className="size-4 text-muted-foreground" />
                  )}
                  Toggle theme
                </Command.Item>
                <Command.Item
                  value="action:sign-out"
                  onSelect={() => {
                    setOpen(false);
                    logout.mutate();
                  }}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive aria-selected:bg-destructive/10"
                >
                  <LogOut className="size-4" /> Sign out
                </Command.Item>
              </Command.Group>
            )}
          </Command.List>
          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <CornerDownLeft className="size-3" /> to select
            </span>
            <span>IAETDS Command</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
