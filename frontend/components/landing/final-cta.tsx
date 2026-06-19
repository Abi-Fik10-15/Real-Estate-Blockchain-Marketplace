import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="primary-band relative overflow-hidden py-24">
      {/* Dot-grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Subtle radial glow in the center */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(255,255,255,0.07),transparent)]" />

      <div className="container relative mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground/60">
            Get Started
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
            Start buying and selling property on-chain
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/70">
            Join thousands of buyers, sellers, and agents who trust ChainEstate
            for transparent, borderless real estate transactions.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="bg-white text-primary shadow-none hover:bg-white/90 dark:bg-white dark:text-primary dark:hover:bg-white/90"
              asChild
            >
              <Link href="/register">
                Create free account <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/35 bg-transparent text-white shadow-none hover:bg-white/10 hover:text-white dark:border-white/35 dark:bg-transparent dark:text-white dark:hover:bg-white/10 dark:hover:text-white"
              asChild
            >
              <Link href="/marketplace">Browse verified property listings</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
