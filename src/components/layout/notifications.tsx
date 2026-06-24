"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { timeAgo } from "@/lib/utils";
import { toneColor } from "@/lib/status";
import type { NotificationItem } from "@/lib/types";

export function Notifications() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get("/notifications");
      return res.data as { data: NotificationItem[]; meta: { unread: number } };
    },
    refetchInterval: 30_000,
  });

  const readAll = useMutation({
    mutationFn: async () => api.post("/notifications/read-all", {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const items = data?.data ?? [];
  const unread = data?.meta.unread ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="size-[18px]" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="text-sm font-semibold">Notifications</div>
          <button
            onClick={() => readAll.mutate()}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <CheckCheck className="size-3.5" /> Mark all read
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          {items.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              You&apos;re all caught up.
            </div>
          )}
          {items.map((n) => (
            <div
              key={n._id}
              className="flex gap-3 border-b border-border/60 px-4 py-3 last:border-0 hover:bg-muted/40"
            >
              <span
                className="mt-1.5 size-2 shrink-0 rounded-full"
                style={{ backgroundColor: toneColor(n.severity) }}
              />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-medium">
                  {n.title}
                  {!n.read && (
                    <span className="size-1.5 rounded-full bg-primary" />
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {n.message}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                  {timeAgo(n.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
