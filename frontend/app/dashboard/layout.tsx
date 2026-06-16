"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  React.useEffect(() => {
    if (!isHydrating && !token) {
      router.replace("/login");
    }
  }, [token, isHydrating, router]);

  if (!token && isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading session…
      </div>
    );
  }

  if (!token) return null;

  return <>{children}</>;
}
