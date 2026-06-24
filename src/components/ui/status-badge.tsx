import { cn } from "@/lib/utils";
import { toneClass } from "@/lib/status";
import { titleCase } from "@/lib/utils";

export function StatusBadge({
  value,
  label,
  dot = true,
  className,
}: {
  value?: string;
  label?: string;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
        toneClass(value),
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current opacity-80" />}
      {label ?? titleCase(value)}
    </span>
  );
}
