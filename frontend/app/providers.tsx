"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ChatWidget } from "@/components/chatbot";
import { AppBootstrap } from "@/components/app-bootstrap";
import { CookieBanner } from "@/components/cookies/cookie-banner";
import { NotificationsProvider } from "@/contexts/notifications-context";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <NotificationsProvider>
          <AppBootstrap />
          {children}
          <Toaster position="top-right" richColors />
          <ChatWidget />
          <CookieBanner />
        </NotificationsProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
