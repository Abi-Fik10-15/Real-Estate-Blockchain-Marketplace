import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WalletConnect } from "@/components/wallet/wallet-connect";
import heroImg from "@/public/hero-illustration.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-brand opacity-20 blur-[120px]" />
      </div>
      <div className="container grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div className="animate-fade-up">
          <Badge variant="info" className="mb-5">
            <Sparkles className="h-3.5 w-3.5" /> Powered by blockchain verification
          </Badge>
          <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Secure Real Estate Ownership{" "}
            <span className="text-gradient">Powered by Blockchain</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Verify ownership, manage properties, authorize agents, and transfer real estate assets
            transparently.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button variant="hero" size="lg" asChild>
              <Link href="/marketplace">
                Explore Properties <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <WalletConnect size="lg" />
          </div>
          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-success" />
            Immutable, tamper-proof title history for every property.
          </div>
        </div>

        <div className="relative animate-fade-up">
          <div className="absolute inset-0 -z-10 animate-float rounded-[2rem] bg-gradient-brand opacity-20 blur-2xl" />
          <Image
            src={heroImg}
            alt="Blockchain real estate concept illustration"
            priority
            className="w-full rounded-[2rem] border border-border/60 shadow-soft"
          />
        </div>
      </div>
    </section>
  );
}
