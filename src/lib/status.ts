type Tone = "success" | "warning" | "destructive" | "info" | "muted" | "primary";

const TONE_CLASSES: Record<Tone, string> = {
  success:
    "bg-success/10 text-success border-success/20 dark:bg-success/15",
  warning:
    "bg-warning/10 text-warning border-warning/25 dark:bg-warning/15",
  destructive:
    "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/15",
  info: "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400",
  primary: "bg-primary/10 text-primary border-primary/20",
  muted: "bg-muted text-muted-foreground border-border",
};

const MAP: Record<string, Tone> = {
  // asset / generic status
  operational: "success",
  active: "success",
  healthy: "success",
  resolved: "success",
  completed: "success",
  closed: "muted",
  generated: "success",
  degraded: "warning",
  maintenance: "warning",
  warning: "warning",
  on_hold: "warning",
  scheduled: "info",
  in_progress: "info",
  investigating: "info",
  triaging: "info",
  monitoring: "info",
  processing: "info",
  identified: "info",
  detected: "warning",
  new: "info",
  open: "info",
  contained: "success",
  offline: "destructive",
  overdue: "destructive",
  suspended: "destructive",
  failed: "destructive",
  retired: "muted",
  false_positive: "muted",
  cancelled: "muted",
  invited: "info",
  // severity / priority
  critical: "destructive",
  sev1: "destructive",
  high: "warning",
  sev2: "warning",
  medium: "info",
  sev3: "info",
  low: "muted",
  sev4: "muted",
  info: "muted",
};

export function toneClass(value?: string): string {
  const tone = (value && MAP[value]) || "muted";
  return TONE_CLASSES[tone];
}

export function toneColor(value?: string): string {
  const tone = (value && MAP[value]) || "muted";
  const colors: Record<Tone, string> = {
    success: "#16a34a",
    warning: "#f59e0b",
    destructive: "#ef4444",
    info: "#0ea5e9",
    primary: "#6366f1",
    muted: "#94a3b8",
  };
  return colors[tone];
}

export const CHART_COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
  "#14b8a6",
  "#ec4899",
  "#84cc16",
];
