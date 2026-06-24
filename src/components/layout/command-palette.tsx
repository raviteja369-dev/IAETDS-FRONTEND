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
  Search,
  Moon,
  Sun,
  LogOut,
  Plus,
  CornerDownLeft,
} from "lucide-react";

export function CommandPalette() {
  const open = useUIStore((s) => s.commandOpen);
  const setOpen = useUIStore((s) => s.setCommandOpen);
  const can = useAuthStore((s) => s.can);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const logout = useLogout();

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

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const visible = NAV_ITEMS.filter((i) => can(i.permission));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-xl [&>button]:hidden">
        <Command className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground">
          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search className="size-4 text-muted-foreground" />
            <Command.Input
              placeholder="Search modules, actions, settings..."
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-[360px] overflow-y-auto scrollbar-thin p-2">
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation">
              {visible.map((item) => (
                <Command.Item
                  key={item.href}
                  onSelect={() => go(item.href)}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <item.icon className="size-4 text-muted-foreground" />
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Quick actions">
              {can("incidents:write") && (
                <Command.Item
                  onSelect={() => go("/incidents")}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm aria-selected:bg-accent"
                >
                  <Plus className="size-4 text-muted-foreground" /> Declare incident
                </Command.Item>
              )}
              {can("assets:write") && (
                <Command.Item
                  onSelect={() => go("/assets")}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm aria-selected:bg-accent"
                >
                  <Plus className="size-4 text-muted-foreground" /> Register asset
                </Command.Item>
              )}
              <Command.Item
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
                onSelect={() => {
                  setOpen(false);
                  logout.mutate();
                }}
                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive aria-selected:bg-destructive/10"
              >
                <LogOut className="size-4" /> Sign out
              </Command.Item>
            </Command.Group>
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
