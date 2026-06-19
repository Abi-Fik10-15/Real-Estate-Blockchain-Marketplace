import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/landing/hero";
import { Stats } from "@/components/landing/stats";
import { Features } from "@/components/landing/features";
import { FeaturedProperties } from "@/components/landing/featured-properties";

// Below-fold sections: dynamically imported to split their JS chunk.
// They are still server-rendered (ssr: true) so they appear in HTML for SEO.
const HowItWorks = dynamic(
  () => import("@/components/landing/how-it-works").then((m) => m.HowItWorks)
);
const Testimonials = dynamic(
  () => import("@/components/landing/testimonials").then((m) => m.Testimonials)
);
const FinalCTA = dynamic(
  () => import("@/components/landing/final-cta").then((m) => m.FinalCTA)
);

export const metadata: Metadata = {
  title: "ChainEstate | Blockchain Real Estate Marketplace",
  description:
    "Buy, rent, verify, and transfer property ownership securely through blockchain technology and transparent smart contract verification.",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ChainEstate | Blockchain Real Estate Marketplace",
    description:
      "Buy, rent, verify, and transfer property ownership securely through blockchain technology and transparent smart contract verification.",
    url: "https://chainestate.com",
    siteName: "ChainEstate",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ChainEstate Blockchain Real Estate Marketplace",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChainEstate | Blockchain Real Estate Marketplace",
    description:
      "Buy, rent, verify, and transfer property ownership securely through blockchain technology and transparent smart contract verification.",
    images: ["/og-image.png"],
  },
};

export default function HomePage() {
  const jsonLdOrg = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ChainEstate",
    "url": "https://chainestate.com",
    "logo": "https://chainestate.com/og-image.png",
    "description":
      "Secure real estate ownership powered by blockchain. Verify ownership, manage properties, authorize agents, and transfer assets transparently.",
  };

  const jsonLdWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ChainEstate",
    "url": "https://chainestate.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://chainestate.com/login?redirect=%2Fdashboard%2Fbuyer%2Fmarketplace&search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
      />
      <Navbar />
      <main id="main-content" className="flex-1">
        <Hero />
        <Stats />
        <Features />
        <FeaturedProperties />
        <HowItWorks />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
