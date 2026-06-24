"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth";
import { useLogout } from "@/hooks/use-auth";
import { initials, titleCase } from "@/lib/utils";
import { LogOut, ShieldCheck, User as UserIcon, ChevronDown } from "lucide-react";

export function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-accent focus:outline-none">
        <Avatar>
          <AvatarFallback
            style={{ backgroundColor: user.avatarColor, color: "white" }}
          >
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="hidden text-left md:block">
          <div className="text-sm font-medium leading-tight">{user.name}</div>
          <div className="text-[11px] text-muted-foreground">
            {titleCase(user.role)}
          </div>
        </div>
        <ChevronDown className="hidden size-4 text-muted-foreground md:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1.5 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <ShieldCheck className="size-3.5 text-success" /> MFA
            </span>
            <span className="font-medium text-success">
              {user.mfaEnabled ? "Enabled" : "Off"}
            </span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserIcon className="size-4" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          onClick={() => logout.mutate()}
        >
          <LogOut className="size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
