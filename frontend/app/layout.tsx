import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// leaflet.css is imported only in map components to avoid loading it on every route
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  // font-display: swap prevents render-blocking — text shows in fallback font
  // immediately while Inter loads, eliminating the invisible-text penalty.
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "ChainEstate — Blockchain Real Estate Marketplace",
  description:
    "Secure real estate ownership powered by blockchain. Verify ownership, manage properties, authorize agents, and transfer real estate assets transparently.",
  keywords: [
    "blockchain real estate",
    "property ownership verification",
    "web3 real estate marketplace",
    "tokenized property",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    title: "ChainEstate — Blockchain Real Estate Marketplace",
    description:
      "Verify ownership, authorize agents, and transfer real estate assets transparently on-chain.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts to eliminate connection latency */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preconnect to Unsplash CDN used by property images */}
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className={`${inter.variable} font-sans`}>
        {/* Skip-to-content for keyboard / screen-reader users (WCAG 2.4.1) */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
