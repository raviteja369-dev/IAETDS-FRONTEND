import { cn } from "@/lib/utils";

export function ChartCard({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card shadow-soft",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h3 className="font-semibold tracking-tight">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </div>
  );
}
