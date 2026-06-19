"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  React.useEffect(() => {
    if (!hasHydrated) return;
    if (!isHydrating && !token) {
      router.replace("/login");
    }
  }, [hasHydrated, token, isHydrating, router]);

  if (!hasHydrated || isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading session…
      </div>
    );
  }

  if (!token) return null;

  return <>{children}</>;
}