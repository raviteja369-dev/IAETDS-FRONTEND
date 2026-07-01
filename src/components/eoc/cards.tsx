"use client";

import * as React from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AnimatedNumber,
  Delta,
  IconTile,
  ProgressBar,
  RatingBadge,
  Sparkline,
  StatusPill,
  Surface,
  type Tone,
} from "./primitives";
import type { AIInsight, Application, ActivityEvent, ScoreCard } from "@/lib/eoc/types";
import { formatValue } from "@/lib/eoc/format";

const toneColor: Record<string, string> = {
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  default: "#4F7CFF",
};

export function KpiCard({ stat, index = 0 }: { stat: ScoreCard; index?: number }) {
  const color = toneColor[stat.tone ?? "default"];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
    >
      <Surface hover className="group relative overflow-hidden p-5">
        <div className="flex items-start justify-between">
          <p className="text-xs font-medium text-eoc-fg2">{stat.label}</p>
          <Delta value={stat.delta} />
        </div>
        <div className="mt-3 flex items-end gap-1">
          <AnimatedNumber
            value={stat.value}
            unit={stat.unit}
            className="text-2xl font-semibold tracking-tight text-eoc-fg"
          />
        </div>
        <div className="mt-3 -mb-1 opacity-80">
          <Sparkline data={stat.spark} color={color} height={34} />
        </div>
      </Surface>
    </motion.div>
  );
}

const impactTone: Record<string, Tone> = { high: "danger", medium: "warning", low: "info" };

export function AIInsightCard({ insight, onAction }: { insight: AIInsight; onAction?: (insight: AIInsight) => void }) {
  return (
    <Surface hover className="group p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-eoc-accent/12 text-eoc-accent ring-1 ring-inset ring-eoc-accent/20">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-eoc-fg">{insight.title}</p>
            <StatusPill tone={impactTone[insight.impact]} className="ml-auto shrink-0">
              {insight.impact}
            </StatusPill>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-eoc-fg2">{insight.detail}</p>
          <button
            type="button"
            onClick={() => onAction?.(insight)}
            className="mt-3 text-xs font-medium text-eoc-accent transition-colors hover:text-eoc-fg"
          >
            {insight.action} →
          </button>
        </div>
      </div>
    </Surface>
  );
}

const catTone: Record<string, Tone> = {
  deploy: "info",
  security: "danger",
  billing: "success",
  maintenance: "warning",
  access: "neutral",
  system: "info",
};

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <div className="relative">
      <div className="absolute bottom-2 left-[7px] top-2 w-px bg-eoc-border" />
      <ul className="space-y-4">
        {events.map((e, i) => (
          <motion.li
            key={e.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="relative flex gap-3 pl-5"
          >
            <span
              className={cn(
                "absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-eoc-card",
                {
                  "bg-eoc-info": catTone[e.category] === "info",
                  "bg-eoc-danger": catTone[e.category] === "danger",
                  "bg-eoc-success": catTone[e.category] === "success",
                  "bg-eoc-warning": catTone[e.category] === "warning",
                  "bg-eoc-muted": catTone[e.category] === "neutral",
                },
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs leading-relaxed text-eoc-fg2">
                <span className="font-medium text-eoc-fg">{e.actor}</span> {e.action}{" "}
                <span className="font-medium text-eoc-fg">{e.target}</span>
              </p>
              <p className="mt-0.5 text-[11px] text-eoc-muted">{e.at}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

const statusTone: Record<string, Tone> = {
  running: "success",
  updating: "info",
  maintenance: "warning",
  degraded: "warning",
  stopped: "neutral",
  retired: "neutral",
};

function getIcon(name: string): LucideIcon {
  return ((Icons as unknown as Record<string, LucideIcon>)[name]) ?? Icons.Box;
}

export function AppCard({
  app,
  index = 0,
  onOpen,
}: {
  app: Application;
  index?: number;
  onOpen?: (app: Application) => void;
}) {
  const Icon = getIcon(app.icon);
  return (
    <motion.button
      type="button"
      onClick={() => onOpen?.(app)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      whileHover={{ y: -3 }}
      className="group w-full text-left"
    >
      <Surface hover className="flex h-full flex-col p-5">
        <div className="flex items-start gap-3">
          <IconTile icon={Icon} accent={app.accent} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-eoc-fg">{app.name}</p>
              {app.updateAvailable && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-eoc-info" />
              )}
            </div>
            <p className="text-xs text-eoc-muted">
              {app.category} · {app.owner}
            </p>
          </div>
          <StatusPill tone={statusTone[app.status]} dot>
            {app.status}
          </StatusPill>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-eoc-fg2">
            <span className="font-medium text-eoc-fg">Health</span>
            <span className={cn(app.health >= 90 ? "text-eoc-success" : app.health >= 75 ? "text-eoc-warning" : "text-eoc-danger")}>
              {app.health}%
            </span>
          </div>
          <span className="font-mono text-[11px] text-eoc-muted">v{app.version}</span>
        </div>
        <ProgressBar
          value={app.health}
          tone={app.health >= 90 ? "success" : app.health >= 75 ? "warning" : "danger"}
          className="mt-2"
        />

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-eoc-border pt-4 text-center">
          <Metric label="Security"><RatingBadge rating={app.security} /></Metric>
          <Metric label="Perf"><RatingBadge rating={app.performance} /></Metric>
          <Metric label="Uptime">
            <span className="text-xs font-semibold text-eoc-fg">{app.uptime}%</span>
          </Metric>
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px] text-eoc-muted">
          <span>{formatValue(app.monthlyCost, "₹")}/mo</span>
          <span className="text-eoc-accent opacity-0 transition-opacity group-hover:opacity-100">
            View details →
          </span>
        </div>
      </Surface>
    </motion.button>
  );
}

function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {children}
      <span className="text-[10px] uppercase tracking-wide text-eoc-muted">{label}</span>
    </div>
  );
}
