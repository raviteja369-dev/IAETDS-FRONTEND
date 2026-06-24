import { cn } from "@/lib/utils";
import { ShieldHalf } from "lucide-react";

export function Logo({
  className,
  showText = true,
  size = "md",
}: {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const dims = size === "lg" ? "size-11" : size === "sm" ? "size-8" : "size-9";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative grid place-items-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-glow",
          dims,
        )}
      >
        <ShieldHalf className="size-1/2" strokeWidth={2.2} />
        <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-success ring-2 ring-card" />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-base font-bold tracking-tight">IAETDS</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Defense Grid
          </span>
        </div>
      )}
    </div>
  );
}
