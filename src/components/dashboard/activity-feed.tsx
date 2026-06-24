"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { timeAgo, titleCase } from "@/lib/utils";
import type { Incident, SecurityEvent } from "@/lib/types";
import { ShieldAlert, Siren, ArrowUpRight } from "lucide-react";

export function IncidentFeed({ items }: { items: Incident[] }) {
  return (
    <div className="divide-y divide-border">
      {items.map((inc) => (
        <Link
          key={inc._id}
          href="/incidents"
          className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40"
        >
          <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive">
            <Siren className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium">{inc.title}</p>
              <StatusBadge value={inc.severity} dot={false} />
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {inc.incidentId} · {titleCase(inc.category)} ·{" "}
              {timeAgo(inc.detectedAt)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function SecurityFeed({ items }: { items: SecurityEvent[] }) {
  return (
    <div className="divide-y divide-border">
      {items.map((e) => (
        <Link
          key={e._id}
          href="/security"
          className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40"
        >
          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-warning/10 text-warning">
            <ShieldAlert className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{e.title}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {e.sourceIp} · {e.geoLocation} · {timeAgo(e.occurredAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              {e.riskScore}
            </span>
            <StatusBadge value={e.severity} dot={false} />
          </div>
        </Link>
      ))}
    </div>
  );
}
