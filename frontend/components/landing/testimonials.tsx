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
    text: "ChainEstate transformed how I manage my properties. The blockchain verification gives my buyers instant confidence, and the entire transfer process is seamless and transparent.",
  },
  {
    name: "Marcus Reed",
    role: "Licensed Agent",
    avatar: "https://i.pravatar.cc/150?img=12",
    rating: 5,
    text: "As an agent, I love the on-chain authorization system. My clients trust the platform completely, and the immutable transaction records make closing deals incredibly smooth.",
  },
  {
    name: "Elena Cruz",
    role: "Real Estate Investor",
    avatar: "https://i.pravatar.cc/150?img=32",
    rating: 5,
    text: "The verification accuracy is outstanding. I can verify ownership history in seconds, not weeks. ChainEstate is the future of real estate investment — I won't go back.",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
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
    <section className="relative overflow-hidden py-20 lg:py-28">
      {/* Dark gradient background */}
      <div className="absolute inset-0 -z-10 section-gradient-alt" />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="glow-orb left-1/4 top-0 h-[400px] w-[400px] bg-[hsl(262,83%,58%)] opacity-[0.06]" />
        <div className="glow-orb right-1/4 bottom-0 h-[350px] w-[350px] bg-[hsl(199,89%,48%)] opacity-[0.06]" />
      </div>

      <div className="container">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Trusted by{" "}
            <span className="text-gradient">Industry Leaders</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See what property owners, agents, and investors say about their
            experience with ChainEstate.
          </p>
        </FadeIn>

        <StaggerContainer className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <StaggerItem key={t.name}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border/50 bg-card/80 p-6 backdrop-blur-sm transition-all duration-500 hover:border-border hover:shadow-card-hover">
                {/* Subtle hover glow */}
                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-brand opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-10" />

                <StarRating rating={t.rating} />

                <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{t.text}&rdquo;
                </blockquote>

                <div className="mt-6 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.avatar}
                    alt={t.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full border-2 border-border object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
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
