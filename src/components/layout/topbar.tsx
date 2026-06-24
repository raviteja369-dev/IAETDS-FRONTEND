"use client";

import { Search, LifeBuoy } from "lucide-react";
import { toast } from "sonner";
import { useUIStore } from "@/store/ui";
import { ThemeToggle } from "./theme-toggle";
import { Notifications } from "./notifications";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export function Topbar() {
  const setCommandOpen = useUIStore((s) => s.setCommandOpen);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <div className="lg:hidden">
        <Logo showText={false} />
      </div>

      <button
        onClick={() => setCommandOpen(true)}
        className="group flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground shadow-soft transition-colors hover:border-primary/40"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search or jump to…</span>
        <kbd className="hidden items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium sm:flex">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className="hidden sm:inline-flex"
          aria-label="Support"
          onClick={() =>
            toast.info("Support", {
              description: "Reach the IAETDS support desk at support@iaetds.io.",
            })
          }
        >
          <LifeBuoy className="size-[18px]" />
        </Button>
        <ThemeToggle />
        <Notifications />
        <div className="mx-1 h-6 w-px bg-border" />
        <UserMenu />
      </div>
    </header>
  );
}
