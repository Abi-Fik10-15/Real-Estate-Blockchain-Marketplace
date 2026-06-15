import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/landing/hero";
import { Stats } from "@/components/landing/stats";
import { FeaturedProperties } from "@/components/landing/featured-properties";
import { BlockchainVerification } from "@/components/landing/blockchain-verification";
import { MapPreview } from "@/components/landing/map-preview";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TrustedAgents } from "@/components/landing/trusted-agents";
import { Testimonials } from "@/components/landing/testimonials";
import { FinalCTA } from "@/components/landing/final-cta";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* 1. Optimized Hero Section (max 80vh) + Search bar below hero */}
        <Hero />

        {/* 2. Trust Metrics Section */}
        <Stats />

        {/* 3. Featured Properties (6 premium property cards) */}
        <FeaturedProperties />

        {/* 4. Blockchain Verification Section (2-column layout) */}
        <BlockchainVerification />

        {/* 5. Interactive Map Preview */}
        <MapPreview />

        {/* 6. How It Works (4 horizontal steps timeline) */}
        <HowItWorks />

        {/* 7. Trusted Agents */}
        <TrustedAgents />

        {/* 8. Testimonials (max 3) */}
        <Testimonials />

        {/* 9. Final CTA */}
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
