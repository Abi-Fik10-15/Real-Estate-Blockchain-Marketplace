import { formatNumber } from "@/lib/utils";
import { PLATFORM_STATS } from "@/services/mock-data";

const STATS = [
  { value: PLATFORM_STATS.properties, label: "Properties" },
  { value: PLATFORM_STATS.verifiedOwners, label: "Verified Owners" },
  { value: PLATFORM_STATS.authorizedAgents, label: "Authorized Agents" },
  { value: PLATFORM_STATS.transactions, label: "Transactions" },
];

export function Stats() {
  return (
    <section className="border-y border-border/60 bg-muted/30">
      <div className="container grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-4xl font-bold tracking-tight text-gradient sm:text-5xl">
              {formatNumber(s.value)}
            </p>
            <p className="mt-2 text-sm font-medium text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
