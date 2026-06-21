import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

const FEATURES = [
  "On-chain ownership verification",
  "Secure escrow & deed transfer",
  "Multi-role marketplace platform",
];

/**
 * Full-page split layout for auth pages.
 * Left: primary-blue brand panel (hidden on mobile).
 * Right: slot for the form/content.
 */
export function AuthSplitShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-2">
      {/* ── Left panel ─────────────────────────────────────────── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary px-12 py-10 text-primary-foreground lg:flex lg:sticky lg:top-0 lg:h-screen">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute bottom-40 right-10 h-48 w-48 rounded-full bg-white/5" />

        {/* Brand */}
        <Link href="/" className="relative z-10 flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="ChainEstate"
            className="h-9 w-9 rounded-lg object-contain"
          />
          <span className="text-lg font-semibold tracking-tight">ChainEstate</span>
        </Link>

        {/* Tagline + feature list */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold leading-tight">
            Real estate,
            <br />
            on the blockchain.
          </h2>
          <p className="max-w-xs text-base leading-relaxed text-primary-foreground/75">
            Verify ownership, manage properties, and transfer real estate
            assets transparently — powered by smart contracts.
          </p>
          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-center gap-3 text-sm text-primary-foreground/85"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/25">
                  <CheckCircle2 className="h-3 w-3" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} ChainEstate. All rights reserved.
        </p>
      </div>

      {/* ── Right panel ────────────────────────────────────────── */}
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
        {children}
      </div>
    </div>
  );
}
