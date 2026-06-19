const TESTIMONIALS = [
  {
    quote:
      "ChainEstate cut our typical 90-day closing process down to under a week. The blockchain-verified title gave our buyers complete confidence without any paperwork delays.",
    name: "Sarah Mitchell",
    role: "Licensed Real Estate Agent",
    location: "Dubai, UAE",
    initials: "SM",
  },
  {
    quote:
      "As someone buying cross-border for the first time, the on-chain audit trail was invaluable. I knew exactly who owned the property and every transaction it had been through.",
    name: "James Chen",
    role: "Property Investor",
    location: "Singapore",
    initials: "JC",
  },
  {
    quote:
      "Listing on ChainEstate attracted serious, wallet-verified buyers. The smart-contract escrow meant funds were secured from day one with zero third-party risk.",
    name: "Elena Vasquez",
    role: "Property Developer",
    location: "Miami, FL",
    initials: "EV",
  },
];

export function Testimonials() {
  return (
    <section className="border-b border-border/50 bg-muted/20 py-20">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            Client Stories
          </p>
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-foreground">
            Trusted by buyers, sellers, and agents
          </h2>
        </div>

        {/* Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map(({ quote, name, role, location, initials }) => (
            <div
              key={name}
              className="group flex flex-col gap-4 rounded-xl border border-border/80 bg-background p-6 transition-all duration-300 ease-out hover:scale-[1.02] hover:border-primary/30 hover:bg-muted/30 active:scale-[0.99]"
            >
              {/* Quote mark */}
              <span className="text-5xl font-serif leading-none text-primary-500 select-none">
                &ldquo;
              </span>

              <p className="flex-1 text-sm leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
                {quote}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-border/50 pt-5 transition-colors duration-300 group-hover:border-primary/20">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold text-primary transition-all duration-300 group-hover:border-primary/40 group-hover:bg-primary/10">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">
                    {role} · {location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
