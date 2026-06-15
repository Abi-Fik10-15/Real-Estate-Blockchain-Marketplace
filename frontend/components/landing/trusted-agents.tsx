"use client";

import { Star, ShieldCheck, Mail, Phone } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";

const AGENTS = [
  {
    name: "Sarah Jenkins",
    role: "Senior Prop-Tech Advisor",
    rating: 4.9,
    reviews: 142,
    managedCount: 42,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
  },
  {
    name: "Michael Chang",
    role: "Blockchain Title Specialist",
    rating: 4.8,
    reviews: 98,
    managedCount: 35,
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80",
  },
  {
    name: "Elena Rostova",
    role: "Commercial Portfolio Manager",
    rating: 4.9,
    reviews: 215,
    managedCount: 58,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
  },
  {
    name: "Marcus Thompson",
    role: "Residential Escrow Expert",
    rating: 4.7,
    reviews: 76,
    managedCount: 29,
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
  },
];

export function TrustedAgents() {
  return (
    <section id="trusted-agents" className="relative py-16 lg:py-20 border-b border-border/40">
      <div className="container max-w-[1280px]">
        <FadeIn className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Trusted <span className="text-gradient">Verified Agents</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Connect with certified real estate professionals authorized to manage on-chain listings and secure your transactions.
          </p>
        </FadeIn>

        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {AGENTS.map((agent) => (
            <StaggerItem key={agent.name}>
              <div className="group relative rounded-xl border border-border/50 bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-card-hover flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative h-20 w-20 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="h-full w-full rounded-full border border-border object-cover"
                  />
                  <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-success text-white shadow-glow" title="Verified Agent">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-semibold">{agent.rating}</span>
                  <span className="text-[10px] text-muted-foreground">({agent.reviews})</span>
                </div>

                {/* Name & Title */}
                <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors">
                  {agent.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 mb-3">
                  {agent.role}
                </p>

                {/* Stats */}
                <div className="w-full border-t border-border/50 pt-3 mt-auto mb-4">
                  <p className="text-xs font-semibold text-foreground">
                    {agent.managedCount} Properties Managed
                  </p>
                </div>

                {/* Actions */}
                <div className="flex w-full gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs py-1.5 h-8">
                    <Mail className="h-3.5 w-3.5 mr-1" /> Message
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 border border-border/50" aria-label="Call Agent">
                    <Phone className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
