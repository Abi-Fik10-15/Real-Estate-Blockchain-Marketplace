"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/motion";

export function FinalCTA() {
  return (
    <section id="final-cta" className="py-16 lg:py-24">
      <div className="container mx-auto px-6 lg:px-8">
        <FadeIn>
          <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-12 text-primary-foreground sm:px-12 md:px-16 lg:px-0 lg:py-0 lg:pl-12 xl:pl-16 shadow-lg">
            {/* Subtle background grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            {/* Ambient glows */}
            <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />

            <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
              {/* Left Column: Content */}
              <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left lg:py-20">
                {/* Badge */}
                <Badge
                  variant="outline"
                  className="border-primary-foreground/30 bg-primary-foreground/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground"
                >
                  Get Started Today
                </Badge>

                {/* Title */}
                <h2 className="mt-6 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl leading-tight">
                  Ready to transform real estate ownership?
                </h2>

                {/* Description */}
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-primary-foreground/80 sm:text-base">
                  Explore listings, verify ownership, and transfer title deeds with total transparency and cryptographic proof.
                </p>

                {/* CTA Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold"
                    asChild
                  >
                    <Link href="/marketplace">
                      Start Verifying <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto gap-2 border-primary-foreground/20 bg-white/5 text-primary-foreground hover:bg-white/10 font-semibold"
                    asChild
                  >
                    <Link href="/marketplace">
                      <ShoppingBag className="h-4 w-4" />
                      Explore Marketplace
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right Column: Real Estate Picture */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 shadow-lg lg:col-span-5 lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:h-full lg:w-[41.666%] lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l lg:border-white/10 lg:shadow-none">
                <Image
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                  alt="Modern luxury real estate villa"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent pointer-events-none lg:bg-gradient-to-r lg:from-primary/30 lg:to-transparent" />
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
