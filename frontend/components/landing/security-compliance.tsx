"use client";

import {
  AlertTriangle,
  Eye,
  Fingerprint,
  KeyRound,
  Lock,
  ScanFace,
  ShieldCheck,
} from "lucide-react";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion";

const SECURITY_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Blockchain Secured",
    description:
      "All records are stored on distributed ledger technology, ensuring no single point of failure.",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: Lock,
    title: "Smart Contract Audited",
    description:
      "Our smart contracts undergo rigorous third-party audits by leading blockchain security firms.",
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    icon: KeyRound,
    title: "End-to-End Encryption",
    description:
      "All sensitive data is encrypted in transit and at rest using AES-256 military-grade encryption.",
    color: "bg-violet-500/10 text-violet-500",
  },
  {
    icon: ScanFace,
    title: "Identity Verification",
    description:
      "KYC/AML compliant identity verification with multi-factor authentication for all platform users.",
    color: "bg-cyan-500/10 text-cyan-500",
  },
  {
    icon: Fingerprint,
    title: "Secure Ownership Transfer",
    description:
      "Cryptographic signatures ensure only verified owners can initiate property transfers.",
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    icon: AlertTriangle,
    title: "Fraud Detection AI",
    description:
      "Machine learning algorithms continuously monitor transactions for suspicious patterns in real-time.",
    color: "bg-rose-500/10 text-rose-500",
  },
];

const COMPLIANCE = [
  "SOC 2 Type II",
  "GDPR Compliant",
  "ISO 27001",
  "PCI DSS",
  "AML/KYC",
  "CCPA",
];

export function SecurityCompliance() {
  return (
    <section id="security" className="relative overflow-hidden py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
        <div className="glow-orb left-1/3 top-1/4 h-[400px] w-[400px] bg-[hsl(221,83%,53%)] opacity-[0.04]" />
      </div>

      <div className="container">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Enterprise-Grade{" "}
            <span className="text-gradient">Security & Compliance</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Built from the ground up with security-first architecture to protect
            every property record, transaction, and user identity.
          </p>
        </FadeIn>

        <StaggerContainer className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SECURITY_ITEMS.map((item) => (
            <StaggerItem key={item.title}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border/50 bg-card/80 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-border hover:shadow-card-hover">
                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-brand opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-10" />

                <div
                  className={`grid h-14 w-14 place-items-center rounded-2xl ${item.color} transition-all duration-300 group-hover:scale-110`}
                >
                  <item.icon className="h-6 w-6" />
                </div>

                <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Compliance badges */}
        <FadeIn delay={0.3} className="mt-14">
          <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-sm">
            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Compliance & Certifications
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {COMPLIANCE.map((c) => (
                <div
                  key={c}
                  className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-4 py-2 text-sm font-medium transition-all hover:border-success/30 hover:bg-success/5"
                >
                  <ShieldCheck className="h-4 w-4 text-success" />
                  {c}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
