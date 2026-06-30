"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatValue } from "@/lib/eoc/format";

/* ── Surface (base card) ── */
export function Surface({
  className,
  children,
  hover,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-eoc-border bg-eoc-card",
        hover && "eoc-card-hover",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ── Section header ── */
export function SectionHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div>
        <h3 className="text-sm font-semibold text-eoc-fg">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-eoc-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ── Delta indicator ── */
export function Delta({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const positive = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium",
        positive
          ? "bg-eoc-success/10 text-eoc-success"
          : "bg-eoc-danger/10 text-eoc-danger",
      )}
    >
      {positive ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {Math.abs(value)}
      {suffix}
    </span>
  );
}

/* ── Status pill ── */
const TONE: Record<string, string> = {
  success: "bg-eoc-success/12 text-eoc-success ring-eoc-success/20",
  warning: "bg-eoc-warning/12 text-eoc-warning ring-eoc-warning/20",
  danger: "bg-eoc-danger/12 text-eoc-danger ring-eoc-danger/20",
  info: "bg-eoc-info/12 text-eoc-info ring-eoc-info/20",
  neutral: "bg-white/5 text-eoc-fg2 ring-white/10",
};

export type Tone = keyof typeof TONE;

export function StatusPill({
  children,
  tone = "neutral",
  dot,
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset",
        TONE[tone],
        className,
      )}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current">
          {tone !== "neutral" && (
            <span className="absolute h-1.5 w-1.5 animate-ping rounded-full bg-current opacity-75" />
          )}
        </span>
      )}
      {children}
    </span>
  );
}

/* ── Sparkline ── */
export function Sparkline({
  data,
  color = "#4F7CFF",
  className,
  height = 36,
}: {
  data: number[];
  color?: string;
  className?: string;
  height?: number;
}) {
  const id = React.useId();
  const w = 120;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - ((d - min) / range) * (height - 6) - 3;
    return [x, y];
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const area = `${line} L${w},${height} L0,${height} Z`;
  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      className={cn("w-full", className)}
      preserveAspectRatio="none"
      style={{ height }}
    >
      <defs>
        <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Score ring ── */
export function ScoreRing({
  value,
  size = 132,
  stroke = 10,
  label,
  sub,
  color,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  sub?: string;
  color?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const ringColor =
    color ?? (pct >= 90 ? "#22C55E" : pct >= 75 ? "#F59E0B" : "#EF4444");
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (pct / 100) * c }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <AnimatedNumber value={value} className="text-2xl font-semibold text-eoc-fg" />
        {label && <span className="text-[11px] font-medium text-eoc-fg2">{label}</span>}
        {sub && <span className="text-[10px] text-eoc-muted">{sub}</span>}
      </div>
    </div>
  );
}

/* ── Progress bar ── */
export function ProgressBar({
  value,
  tone = "info",
  className,
}: {
  value: number;
  tone?: Tone;
  className?: string;
}) {
  const colors: Record<string, string> = {
    success: "bg-eoc-success",
    warning: "bg-eoc-warning",
    danger: "bg-eoc-danger",
    info: "bg-eoc-accent",
    neutral: "bg-eoc-fg2",
  };
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-white/8", className)}>
      <motion.div
        className={cn("h-full rounded-full", colors[tone])}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, value)}%` }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
    </div>
  );
}

/* ── Animated number ── */
export function AnimatedNumber({
  value,
  unit,
  className,
  decimals,
}: {
  value: number;
  unit?: string;
  className?: string;
  decimals?: number;
}) {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 900;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const rounded =
    decimals != null
      ? display.toFixed(decimals)
      : Number.isInteger(value)
        ? Math.round(display).toString()
        : display.toFixed(value % 1 === 0 ? 0 : value < 100 ? 2 : 0);

  return (
    <span className={className}>
      {unit ? formatValue(Number(rounded), unit) : rounded}
    </span>
  );
}

/* ── Skeleton ── */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-white/5", className)} />;
}

/* ── Empty state ── */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-eoc-border bg-eoc-surface/40 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-eoc-fg2">
        <Icon className="h-6 w-6" />
      </div>
      <p className="mt-4 text-sm font-medium text-eoc-fg">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-eoc-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ── Rating badge ── */
export function RatingBadge({ rating }: { rating: string }) {
  const tone: Tone =
    rating.startsWith("A") ? "success" : rating === "B" ? "info" : rating === "C" ? "warning" : "danger";
  return (
    <span
      className={cn(
        "inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-semibold ring-1 ring-inset",
        TONE[tone],
      )}
    >
      {rating}
    </span>
  );
}

/* ── Icon tile ── */
export function IconTile({
  icon: Icon,
  accent = "#4F7CFF",
  size = "md",
  className,
}: {
  icon: LucideIcon;
  accent?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const ic = size === "lg" ? "h-6 w-6" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div
      className={cn("flex items-center justify-center rounded-xl ring-1 ring-inset", dims, className)}
      style={{
        backgroundColor: `${accent}1a`,
        color: accent,
        boxShadow: `inset 0 0 0 1px ${accent}26`,
      }}
    >
      <Icon className={ic} />
    </div>
  );
}
