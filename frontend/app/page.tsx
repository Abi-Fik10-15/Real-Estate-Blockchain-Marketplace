import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Stats } from "@/components/landing/stats";
import { BlockchainBenefits } from "@/components/landing/blockchain-benefits";
import { FeaturedProperties } from "@/components/landing/featured-properties";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Comparison } from "@/components/landing/comparison";
import { SuccessStories } from "@/components/landing/success-stories";
import { TrustedBy } from "@/components/landing/trusted-by";
import { MapPreview } from "@/components/landing/map-preview";
import { AgentEcosystem } from "@/components/landing/agent-ecosystem";
import { SecurityCompliance } from "@/components/landing/security-compliance";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { InvestorSection } from "@/components/landing/investor-section";
import { Roadmap } from "@/components/landing/roadmap";
import { FinalCTA } from "@/components/landing/final-cta";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* 1. Hero — above the fold */}
        <Hero />

        {/* 2. Social proof stats with animated counters */}
        <Stats />

        {/* 3. Core platform features */}
        <Features />

        {/* 4. Blockchain ownership benefits (6 cards) */}
        {/* <BlockchainBenefits /> */}

        {/* 5. Featured properties showcase (12 cards) */}
        <FeaturedProperties />

        {/* 6. How ChainEstate works (5-step timeline) */}
        <HowItWorks />

        {/* 7. Traditional vs ChainEstate comparison */}
        {/* <Comparison /> */}

        {/* 8. Interactive global map preview */}
        <MapPreview />

        {/* 9. Success stories / case studies */}
        {/* <SuccessStories /> */}

        {/* 10. Trusted by enterprise partners */}
        {/* <TrustedBy /> */}

        {/* 11. Agent ecosystem benefits */}
        {/* <AgentEcosystem /> */}

        {/* 12. Security & compliance */}
        {/* <SecurityCompliance /> */}

        {/* 13. Testimonials */}
        <Testimonials />

        {/* 14. Investor section */}
        {/* <InvestorSection /> */}

        {/* 15. Platform roadmap */}
        {/* <Roadmap /> */}

        {/* 16. FAQ accordion */}
        {/* <FAQ /> */}

        {/* 17. Premium final CTA */}
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
