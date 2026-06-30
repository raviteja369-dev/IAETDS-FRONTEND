import type { Metadata } from "next";
import { AppShell } from "@/components/eoc/shell/app-shell";

export const metadata: Metadata = {
  title: "Atlas — Enterprise Operations Cloud",
  description: "Deploy business, not infrastructure. The operating system for modern enterprises.",
};

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
