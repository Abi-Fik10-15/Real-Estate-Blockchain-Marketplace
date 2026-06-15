"use client";

import {
  BadgeCheck,
  BarChart3,
  ClipboardList,
  DollarSign,
  LayoutDashboard,
  Settings2,
} from "lucide-react";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion";

const AGENT_FEATURES = [
  {
    icon: ClipboardList,
    title: "Property Management",
    description:
      "Manage multiple property listings with full CRUD controls, status updates, and automated notifications to owners.",
    stat: "120+",
    statLabel: "Properties Managed",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: Settings2,
    title: "Listing Control",
    description:
      "Update prices, descriptions, images, and availability in real-time with instant blockchain synchronization.",
    stat: "Real-time",
    statLabel: "Updates",
    color: "bg-violet-500/10 text-violet-500",
  },
  {
    icon: BadgeCheck,
    title: "Verification Access",
    description:
      "Agents can request and track property verification status, submit documents, and receive on-chain confirmations.",
    stat: "99.9%",
    statLabel: "Accuracy",
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    icon: DollarSign,
    title: "Commission Tracking",
    description:
      "Transparent smart-contract-based commission tracking with automated payouts upon successful property transactions.",
    stat: "$2.4M+",
    statLabel: "Paid Out",
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    icon: BarChart3,
    title: "Performance Dashboard",
    description:
      "Comprehensive analytics dashboard with lead conversion, revenue tracking, and property performance metrics.",
    stat: "24/7",
    statLabel: "Analytics",
    color: "bg-cyan-500/10 text-cyan-500",
  },
  {
    icon: LayoutDashboard,
    title: "Client Management",
    description:
      "Built-in CRM for managing buyer inquiries, scheduling viewings, and maintaining communication history on-chain.",
    stat: "500+",
    statLabel: "Active Clients",
    color: "bg-rose-500/10 text-rose-500",
  },
];

export function AgentEcosystem() {
  return (
    <section id="agent-ecosystem" className="relative overflow-hidden py-20 lg:py-28">
      {/* Background */}
      <div className="absolute inset-0 -z-10 section-gradient-alt" />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="glow-orb right-1/4 top-0 h-[400px] w-[400px] bg-[hsl(262,83%,58%)] opacity-[0.05]" />
        <div className="glow-orb left-1/4 bottom-0 h-[350px] w-[350px] bg-[hsl(199,89%,48%)] opacity-[0.05]" />
      </div>

      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left — text */}
          <FadeIn direction="left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              For Real Estate Agents
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              The Complete{" "}
              <span className="text-gradient">Agent Ecosystem</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Empower your real estate business with blockchain-backed tools for
              property management, verification, and transparent commission
              tracking.
            </p>

            {/* Quick stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { value: "2,500+", label: "Active Agents" },
                { value: "$48M+", label: "Volume Managed" },
                { value: "4.9★", label: "Agent Rating" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-border/50 bg-card/60 p-4 text-center backdrop-blur-sm"
                >
                  <p className="text-2xl font-bold text-gradient">{s.value}</p>
                  <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Right — feature cards */}
          <StaggerContainer className="grid gap-4 sm:grid-cols-2">
            {AGENT_FEATURES.map((f) => (
              <StaggerItem key={f.title}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-border/50 bg-card/80 p-5 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-border hover:shadow-card-hover">
                  <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-brand opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-10" />

                  <div className="flex items-start gap-3">
                    <div
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${f.color} transition-transform duration-300 group-hover:scale-110`}
                    >
                      <f.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">{f.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {f.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline gap-1.5 border-t border-border/30 pt-3">
                    <span className="text-lg font-bold text-gradient">
                      {f.stat}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {f.statLabel}
                    </span>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
