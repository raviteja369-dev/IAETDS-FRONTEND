"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: refreshData } = await api.post("/auth/refresh", {});
        useAuthStore.getState().setToken(refreshData.data.accessToken);
        const { data } = await api.get("/auth/me");
        if (active) {
          setAuth(
            data.data.user,
            useAuthStore.getState().accessToken as string,
            data.data.permissions,
          );
        }
      } catch {
        // not logged in — fine
      } finally {
        if (active) setHydrated(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [setAuth, setHydrated]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={150}>
          <AuthBootstrap>{children}</AuthBootstrap>
          <Toaster
            position="top-right"
            toastOptions={{
              classNames: {
                toast:
                  "group rounded-lg border border-border bg-card text-card-foreground shadow-floating",
              },
            }}
          />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
