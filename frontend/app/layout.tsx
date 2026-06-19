import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// leaflet.css is imported only in map components to avoid loading it on every route
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

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
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
