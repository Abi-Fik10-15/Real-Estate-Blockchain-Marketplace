"use client";

import { Star } from "lucide-react";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion";

const TESTIMONIALS = [
  {
    name: "Sophia Bennett",
    role: "Property Owner",
    avatar: "https://i.pravatar.cc/150?img=47",
    rating: 5,
    text: "ChainEstate transformed how I sell my properties. The blockchain verification gives my buyers instant confidence, and the entire escrow settlement takes minutes.",
  },
  {
    name: "Marcus Reed",
    role: "Licensed Agent",
    avatar: "https://i.pravatar.cc/150?img=12",
    rating: 5,
    text: "The on-chain authorization system is outstanding. My clients trust the platform completely, and the immutable transaction history makes closing deals seamless.",
  },
  {
    name: "Elena Cruz",
    role: "Real Estate Investor",
    avatar: "https://i.pravatar.cc/150?img=32",
    rating: 5,
    text: "Verification accuracy is phenomenal. I can verify title history in seconds, not weeks. ChainEstate is the future of venture-backed prop-tech investment.",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="relative overflow-hidden py-16 lg:py-20 border-b border-border/40 bg-muted/10">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-muted/10 to-transparent" />

      <div className="container max-w-[1280px]">
        <FadeIn className="mx-auto max-w-2xl text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Trusted by <span className="text-gradient">Industry Leaders</span>
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            What property owners, authorized agents, and investors are saying about our platform.
          </p>
        </FadeIn>

        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <StaggerItem key={t.name}>
              <div className="group relative h-full rounded-xl border border-border/50 bg-card p-5 shadow-soft transition-all duration-300 hover:border-border hover:shadow-card-hover flex flex-col justify-between">
                <div>
                  <StarRating rating={t.rating} />
                  <blockquote className="mt-3.5 text-xs leading-relaxed text-muted-foreground italic">
                    &ldquo;{t.text}&rdquo;
                  </blockquote>
                </div>

                <div className="mt-5 flex items-center gap-3 border-t border-border/30 pt-3.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.avatar}
                    alt={t.name}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full border border-border object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-foreground">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
