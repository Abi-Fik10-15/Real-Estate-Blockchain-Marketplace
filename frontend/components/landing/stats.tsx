"use client";

const STATS = [
  { value: "12,500+", label: "Properties Verified", description: "Title deeds confirmed on-chain" },
  { value: "8,000+", label: "Ownership Transfers", description: "Immutable deed transfers settled" },
  { value: "2,500+", label: "Active Agents", description: "Wallet-authorised real estate agents" },
  { value: "99.9%", label: "Verification Accuracy", description: "Oracle-confirmed registry precision" },
];

export function Stats() {
  return (
    <section className="primary-band relative overflow-hidden border-b border-primary-foreground/20">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(255,255,255,0.07),transparent)]" />

      <div className="container relative mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 divide-x divide-y divide-white/15 lg:grid-cols-4 lg:divide-y-0">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col gap-1 px-6 py-8 first:pl-0 lg:last:pr-0">
              <p className="text-3xl font-semibold tracking-tight text-white">{s.value}</p>
              <p className="text-sm font-medium text-primary-foreground">{s.label}</p>
              <p className="text-xs leading-relaxed text-primary-foreground/70">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
