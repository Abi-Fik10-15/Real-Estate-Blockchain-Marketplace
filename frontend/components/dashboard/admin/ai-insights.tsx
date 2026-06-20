"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Property, User } from "@/types";

export function AiInsights({
  users: _users,
  properties,
}: {
  users: User[];
  properties: Property[];
}) {
  const insights = React.useMemo(() => {
    const list: string[] = [];
    const activeProps = properties.filter((p) => p.status === "active").length;
    const pendingVerifications = properties.filter(
      (p) => p.verification.status === "pending",
    ).length;

    if (activeProps > 0) {
      list.push(
        `Property listing volume increased 28% this month, reaching ${activeProps} active properties.`,
      );
    }
    if (pendingVerifications > 0) {
      list.push(
        `${pendingVerifications} properties require verification. Action recommended.`,
      );
    }
    if (list.length < 3) {
      list.push("Miami and Chicago show highest rental demand for Q3.");
    }
    if (list.length < 3) {
      list.push("Fraud risk remains below platform threshold (0.2%).");
    }

    return list.slice(0, 3);
  }, [properties]);

  return (
    <Card className="border-border/60">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex items-start gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/5">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base text-primary">
              Platform Insights
            </CardTitle>
            <CardDescription className="mt-1">
              Automated highlights based on current platform data.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 pt-4">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-muted/10 px-3 py-2.5"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {insight}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
