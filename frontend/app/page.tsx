import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Stats } from "@/components/landing/stats";

import { FeaturedProperties } from "@/components/landing/featured-properties";
import { HowItWorks } from "@/components/landing/how-it-works";
import { MapPreview } from "@/components/landing/map-preview";
import { Testimonials } from "@/components/landing/testimonials";

import { FinalCTA } from "@/components/landing/final-cta";
import { MapSection } from "@/components/landing/map-section";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* 1. Hero — above the fold */}
        <Hero />
{/* 3. Core platform features */}
        <Features />
        {/* 2. Social proof stats with animated counters */}
        <Stats />

 {/* 5. Featured properties showcase (12 cards) */}

        <FeaturedProperties />
      

       

      

  {/* 3. Core platform features */}
        <Features />
        {/* 13. Testimonials */}
        {/* <Testimonials /> */}

      

        {/* 6. How ChainEstate works (5-step timeline) */}
        <HowItWorks />
        {/* 17. Premium final CTA */}
        <FinalCTA />
       <MapSection />
      </main>
      <Footer />
    </div>
  );
}
