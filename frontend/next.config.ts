import type { NextConfig } from "next";

const getOrigin = (urlStr: string | undefined): string => {
  if (!urlStr) return "";
  try {
    return new URL(urlStr).origin;
  } catch {
    return "";
  }
};

const apiOrigin = getOrigin(process.env.NEXT_PUBLIC_API_URL);
const wsOrigin = getOrigin(process.env.NEXT_PUBLIC_WS_URL);

// Build CSP connect-src dynamically to support different backend ports/hosts (like localhost:3001)
const connectSrcDirectives = [
  "'self'",
  "ws:",
  "wss:",
  "https://sepolia.infura.io",
  "https://eth-sepolia.g.alchemy.com",
  apiOrigin,
  wsOrigin,
  "http://localhost:3001",
  "ws://localhost:3001",
].filter(Boolean);

const uniqueConnectSrc = Array.from(new Set(connectSrcDirectives)).join(" ");

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
  },
  {
    // Permissive CSP that allows Leaflet map tiles, Google Fonts, and Unsplash images
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://source.unsplash.com https://res.cloudinary.com https://i.pravatar.cc https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org",
      `connect-src ${uniqueConnectSrc}`,

      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];


const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  compress: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Long-lived cache for static assets
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache public images for 1 day
        source: "/(.*\\.(?:jpg|jpeg|png|gif|webp|avif|svg|ico))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
