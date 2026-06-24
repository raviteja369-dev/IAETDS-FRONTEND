"use client";

import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  deltaPositive,
  spark,
  accent = "#6366f1",
  suffix,
  index = 0,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: string;
  deltaPositive?: boolean;
  spark?: number[];
  accent?: string;
  suffix?: string;
  index?: number;
}) {
  const data = (spark ?? []).map((v, i) => ({ i, v }));
  const id = `spark-${label.replace(/\s/g, "")}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-soft transition-all hover:shadow-elevated"
    >
      <div
        className="absolute right-0 top-0 size-24 rounded-full opacity-[0.07] blur-2xl transition-opacity group-hover:opacity-20"
        style={{ backgroundColor: accent }}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">
            {value}
            {suffix && (
              <span className="ml-0.5 text-lg font-semibold text-muted-foreground">
                {suffix}
              </span>
            )}
          </p>
        </div>
        <div
          className="grid size-10 place-items-center rounded-lg"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
        >
          <Icon className="size-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        {delta ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold",
              deltaPositive ? "text-success" : "text-destructive",
            )}
          >
            {deltaPositive ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            {delta}
            <span className="font-normal text-muted-foreground">vs last week</span>
          </span>
        ) : (
          <span />
        )}
        {data.length > 0 && (
          <div className="h-9 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 2, bottom: 2 }}>
                <defs>
                  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accent} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={accent}
                  strokeWidth={2}
                  fill={`url(#${id})`}
                  isAnimationActive
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}
