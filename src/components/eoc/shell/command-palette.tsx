"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import {
  Boxes,
  CornerDownLeft,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { flatNav } from "@/lib/eoc/nav";
import { applications } from "@/lib/eoc/data";
import { StatusPill } from "../primitives";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild aria-describedby={undefined}>
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -8 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="fixed left-1/2 top-[15vh] z-[101] w-[92vw] max-w-xl -translate-x-1/2"
              >
                <Dialog.Title className="sr-only">Command Palette</Dialog.Title>
                <Command
                  loop
                  className="overflow-hidden rounded-2xl border border-eoc-border-strong bg-eoc-elevated/95 shadow-2xl backdrop-blur-xl"
                >
                  <div className="flex items-center gap-3 border-b border-eoc-border px-4">
                    <Search className="h-4 w-4 text-eoc-muted" />
                    <Command.Input
                      autoFocus
                      placeholder="Search apps, pages, actions…"
                      className="h-12 flex-1 bg-transparent text-sm text-eoc-fg outline-none placeholder:text-eoc-muted"
                    />
                    <kbd className="rounded-md border border-eoc-border px-1.5 py-0.5 text-[10px] text-eoc-muted">
                      ESC
                    </kbd>
                  </div>
                  <Command.List className="max-h-[52vh] overflow-y-auto p-2 [scrollbar-width:thin]">
                    <Command.Empty className="py-10 text-center text-sm text-eoc-muted">
                      No results found.
                    </Command.Empty>

                    <Command.Group heading="Quick Actions" className="eoc-cmd-group">
                      <Item onSelect={() => go("/console/marketplace")} icon={<Plus className="h-4 w-4 text-eoc-accent" />} label="Install application" badge="Action" />
                      <Item onSelect={() => go("/console/security")} icon={<ShieldCheck className="h-4 w-4 text-eoc-success" />} label="Run security scan" badge="Action" />
                      <Item onSelect={() => go("/console/maintenance")} icon={<Wrench className="h-4 w-4 text-eoc-warning" />} label="Schedule maintenance" badge="Action" />
                      <Item onSelect={() => go("/console/ai-studio")} icon={<Sparkles className="h-4 w-4 text-eoc-accent" />} label="Ask AI Assistant" badge="Action" />
                    </Command.Group>

                    <Command.Group heading="Applications" className="eoc-cmd-group">
                      {applications.map((app) => (
                        <Item
                          key={app.id}
                          onSelect={() => go(`/console/applications?app=${app.id}`)}
                          icon={<Boxes className="h-4 w-4" style={{ color: app.accent }} />}
                          label={app.name}
                          meta={`${app.category} · v${app.version}`}
                          badge="App"
                        />
                      ))}
                    </Command.Group>

                    <Command.Group heading="Navigate" className="eoc-cmd-group">
                      {flatNav.map((item) => (
                        <Item
                          key={item.href}
                          onSelect={() => go(item.href)}
                          icon={<item.icon className="h-4 w-4 text-eoc-muted" />}
                          label={item.label}
                          badge="Page"
                        />
                      ))}
                    </Command.Group>
                  </Command.List>
                </Command>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function Item({
  onSelect,
  icon,
  label,
  meta,
  badge,
}: {
  onSelect: () => void;
  icon: React.ReactNode;
  label: string;
  meta?: string;
  badge?: string;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      value={`${label} ${meta ?? ""}`}
      className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-eoc-fg2 data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-eoc-fg"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5">{icon}</span>
      <span className="flex-1 truncate text-eoc-fg">{label}</span>
      {meta && <span className="truncate text-xs text-eoc-muted">{meta}</span>}
      {badge && <StatusPill tone="neutral">{badge}</StatusPill>}
      <CornerDownLeft className="h-3.5 w-3.5 text-eoc-muted opacity-0 group-data-[selected=true]:opacity-100" />
    </Command.Item>
  );
}
