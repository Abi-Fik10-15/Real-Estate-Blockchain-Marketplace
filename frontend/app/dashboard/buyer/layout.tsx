"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

function BuyerLayoutSkeleton() {
  return (
    <div className="space-y-5 p-1 animate-pulse">
      <div className="h-24 rounded-xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="h-64 rounded-xl bg-muted" />
        <div className="h-64 rounded-xl bg-muted" />
      </div>
    </div>
  );
}

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  React.useEffect(() => {
    if (!hasHydrated || isHydrating || !token || !user) return;
    if (user.role !== "buyer") {
      router.replace(`/dashboard/${user.role}`);
    }
  }, [user, token, isHydrating, hasHydrated, router]);

  if (!hasHydrated || isHydrating) {
    return <BuyerLayoutSkeleton />;
  }

  if (!token || (user && user.role !== "buyer")) {
    return null;
  }

  return <>{children}</>;
}
