"use client";

import { FadeIn } from "@/components/ui/motion";

const PARTNERS = [
  { name: "Meridian Realty", category: "Real Estate Agency" },
  { name: "Apex Developments", category: "Property Developer" },
  { name: "Sterling Legal", category: "Legal Firm" },
  { name: "Vanguard Capital", category: "Financial Institution" },
  { name: "Horizon Properties", category: "Real Estate Agency" },
  { name: "Quantum Build", category: "Property Developer" },
  { name: "Ironclad Law", category: "Legal Firm" },
  { name: "Pinnacle Finance", category: "Financial Institution" },
];

/* SVG logo placeholders — premium typographic style */
function LogoPlaceholder({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("");
  return (
    <div className="group flex flex-col items-center gap-3 transition-all duration-500">
      <div className="grid h-16 w-28 place-items-center rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-500 group-hover:border-border group-hover:bg-card group-hover:shadow-card-hover">
        <span className="text-xl font-bold tracking-tight text-muted-foreground/40 transition-colors duration-500 group-hover:text-gradient group-hover:text-foreground">
          {initials}
        </span>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-muted-foreground/60 transition-colors duration-500 group-hover:text-foreground">
          {name}
        </p>
      </div>
    </div>
  );
}

export function TrustedBy() {
  return (
    <section id="trusted-by" className="relative overflow-hidden border-y border-border/40 py-16 lg:py-20">
      <div className="absolute inset-0 -z-10 bg-muted/20" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-mesh opacity-30" />

      <div className="container">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Trusted By Industry Leaders
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Powering the Future of{" "}
            <span className="text-gradient">Real Estate</span>
          </h2>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-8">
            {PARTNERS.map((p) => (
              <LogoPlaceholder key={p.name} name={p.name} />
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.4} className="mt-10 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            {[
              "Real Estate Agencies",
              "Property Developers",
              "Legal Firms",
              "Financial Institutions",
            ].map((cat) => (
              <span key={cat} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-gradient-brand" />
                {cat}
              </span>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
