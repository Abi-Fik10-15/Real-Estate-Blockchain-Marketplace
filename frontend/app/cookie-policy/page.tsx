import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CookiePreferencesButton } from "@/components/cookies/cookie-preferences-button";

export const metadata: Metadata = {
  title: "Cookie Policy — ChainEstate",
  description:
    "Learn how ChainEstate uses cookies and similar technologies on our platform.",
};

const LAST_UPDATED = "19 June 2026";

const SECTIONS = [
  {
    id: "what-are-cookies",
    title: "1. What Are Cookies?",
    body: `Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site. Cookies can be "session" cookies (deleted when you close your browser) or "persistent" cookies (stored for a set period or until you delete them).`,
  },
  {
    id: "how-we-use-cookies",
    title: "2. How We Use Cookies",
    body: `ChainEstate uses cookies to:
• Keep you signed in across pages and sessions
• Remember your preferences (theme, display settings)
• Understand how visitors use our platform so we can improve it
• Ensure security of our authentication and blockchain transaction flows
• Deliver relevant property recommendations`,
  },
  {
    id: "cookie-categories",
    title: "3. Cookie Categories",
    body: null,
    table: [
      {
        category: "Necessary",
        purpose: "Authentication, session management, security (CSRF protection). Required for the platform to function.",
        examples: "chainestate-auth, chainestate-token",
        duration: "Session / up to 7 days",
        canDisable: false,
      },
      {
        category: "Functional",
        purpose: "Remembers user preferences such as theme (light/dark), saved property searches, and notification settings.",
        examples: "chainestate-theme, chainestate-saved",
        duration: "Up to 12 months",
        canDisable: true,
      },
      {
        category: "Analytics",
        purpose: "Collects aggregated, anonymised data about how visitors navigate the site. Helps us identify issues and improve performance.",
        examples: "_ga, _gid (Google Analytics)",
        duration: "Up to 24 months",
        canDisable: true,
      },
      {
        category: "Marketing",
        purpose: "Used to show personalised property listings and relevant advertisements based on your browsing activity.",
        examples: "_fbp, ads/ga-audiences",
        duration: "Up to 12 months",
        canDisable: true,
      },
    ],
  },
  {
    id: "third-party-cookies",
    title: "4. Third-Party Cookies",
    body: `Some cookies on ChainEstate are set by third-party services we use, including:

• **Alchemy / Ethers.js** — Blockchain RPC connections for on-chain queries. These do not set persistent cookies.
• **Cloudinary** — Image delivery for property listings.
• **Google Analytics** (if analytics cookies are accepted) — aggregated, anonymised usage data.

We do not control third-party cookies and recommend reviewing the privacy policies of those providers.`,
  },
  {
    id: "managing-cookies",
    title: "5. Managing Your Preferences",
    body: `You can change your cookie preferences at any time by clicking "Cookie Preferences" in the site footer. You can also control cookies through your browser settings:

• **Chrome:** Settings → Privacy and Security → Cookies
• **Firefox:** Settings → Privacy & Security → Cookies and Site Data
• **Safari:** Preferences → Privacy
• **Edge:** Settings → Cookies and Site Permissions

Please note that disabling certain cookies may affect the functionality of the ChainEstate platform, including your ability to sign in or complete property transactions.`,
  },
  {
    id: "consent",
    title: "6. Your Consent",
    body: `When you first visit ChainEstate, we display a cookie banner asking for your consent. You may:

• **Accept all** — enable all cookie categories
• **Reject non-essential** — only necessary cookies will be used
• **Customize** — choose which categories to enable

Your preferences are stored in your browser's localStorage and will persist across sessions. You can update them at any time via the footer link.`,
  },
  {
    id: "legal-basis",
    title: "7. Legal Basis",
    body: `For users in the European Economic Area (EEA) and United Kingdom, our use of cookies is governed by the UK GDPR and the EU ePrivacy Directive. Necessary cookies are used on the basis of legitimate interest. All other categories require your explicit consent. For users in California, our cookie use is compliant with the CCPA.`,
  },
  {
    id: "contact",
    title: "8. Contact Us",
    body: `If you have questions about our use of cookies, please contact us at:

ChainEstate Privacy Team
Email: privacy@chainestate.io

We aim to respond to all enquiries within 5 business days.`,
  },
];

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-muted/20">
        <div className="container mx-auto px-6 py-6 lg:px-8">
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4 text-muted-foreground">
            <Link href="/">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Home
            </Link>
          </Button>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Cookie Policy
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Last updated: {LAST_UPDATED}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Intro */}
          <p className="mb-10 text-sm leading-relaxed text-muted-foreground">
            This Cookie Policy explains how ChainEstate (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
            &ldquo;our&rdquo;) uses cookies and similar tracking technologies when you use our
            platform. By using ChainEstate, you agree to the use of cookies as described in this
            policy.
          </p>

          {/* Sections */}
          <div className="space-y-10">
            {SECTIONS.map((section) => (
              <section key={section.id} id={section.id}>
                <h2 className="mb-3 text-base font-semibold text-foreground">
                  {section.title}
                </h2>

                {section.body && (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {section.body}
                  </p>
                )}

                {section.table && (
                  <div className="mt-4 overflow-x-auto rounded-xl border border-border/60">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border/60 bg-muted/40">
                          <th className="px-4 py-3 text-left font-semibold text-foreground">
                            Category
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-foreground">
                            Purpose
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-foreground">
                            Examples
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-foreground">
                            Duration
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-foreground">
                            Optional
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {section.table.map((row) => (
                          <tr key={row.category} className="align-top">
                            <td className="px-4 py-3 font-medium text-foreground">
                              {row.category}
                            </td>
                            <td className="px-4 py-3 leading-relaxed text-muted-foreground">
                              {row.purpose}
                            </td>
                            <td className="px-4 py-3 font-mono text-muted-foreground">
                              {row.examples}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {row.duration}
                            </td>
                            <td className="px-4 py-3">
                              {row.canDisable ? (
                                <span className="inline-flex items-center rounded-full border border-success/30 bg-success/5 px-2 py-0.5 text-[10px] font-medium text-success">
                                  Yes
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                  No
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Manage preferences CTA */}
          <div className="mt-12 rounded-2xl border border-border/60 bg-muted/20 p-6 text-center">
            <p className="mb-1 text-sm font-medium text-foreground">
              Manage your cookie preferences
            </p>
            <p className="mb-4 text-xs text-muted-foreground">
              You can update your choices at any time — your selection is stored locally in your
              browser.
            </p>
            <CookiePreferencesButton />
          </div>
        </div>
      </div>
    </main>
  );
}
