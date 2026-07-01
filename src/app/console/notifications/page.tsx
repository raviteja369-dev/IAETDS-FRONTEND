"use client";

import * as React from "react";
import { CheckCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import { Surface, StatusPill, type Tone } from "@/components/eoc/primitives";
import { useEocStore } from "@/lib/eoc/store";
import { cn } from "@/lib/utils";

const FILTERS = ["all", "unread", "danger", "warning", "info", "success"] as const;
const toneLabel: Record<string, Tone> = { info: "info", success: "success", warning: "warning", danger: "danger" };

export default function NotificationsPage() {
  const items = useEocStore((s) => s.notifications);
  const markRead = useEocStore((s) => s.markRead);
  const markAllRead = useEocStore((s) => s.markAllRead);
  const deleteNotification = useEocStore((s) => s.deleteNotification);
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("all");

  const filtered = items.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.tone === filter;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Notification center"
        title="Notifications"
        description="Everything that needs your attention across operations, security, billing and maintenance."
        actions={<EButton variant="secondary" onClick={() => markAllRead()}><CheckCheck className="h-4 w-4" /> Mark all read</EButton>}
      />

      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-eoc-border bg-white/[0.03] p-1 sm:w-fit">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors", filter === f ? "bg-white/10 text-eoc-fg" : "text-eoc-muted hover:text-eoc-fg2")}>{f}</button>
        ))}
      </div>

      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <Surface className="p-8 text-center">
            <p className="text-sm text-eoc-muted">No notifications match this filter.</p>
          </Surface>
        ) : filtered.map((n) => (
          <Surface
            key={n.id}
            hover
            onClick={() => !n.read && markRead(n.id)}
            className={cn("flex items-start gap-4 p-4", !n.read && "cursor-pointer border-l-2 border-l-eoc-accent")}
          >
            <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", {
              "bg-eoc-info": n.tone === "info",
              "bg-eoc-success": n.tone === "success",
              "bg-eoc-warning": n.tone === "warning",
              "bg-eoc-danger": n.tone === "danger",
            })} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-eoc-fg">{n.title}</p>
                {!n.read && <StatusPill tone="info">New</StatusPill>}
              </div>
              <p className="mt-0.5 text-sm text-eoc-fg2">{n.detail}</p>
              <p className="mt-1 text-[11px] text-eoc-muted">{n.at}</p>
            </div>
            <StatusPill tone={toneLabel[n.tone]}>{n.tone}</StatusPill>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteNotification(n.id);
                toast.success("Notification removed");
              }}
              className="rounded-lg p-1.5 text-eoc-muted hover:bg-white/5 hover:text-eoc-danger"
              aria-label="Delete notification"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Surface>
        ))}
      </div>
    </div>
  );
}
