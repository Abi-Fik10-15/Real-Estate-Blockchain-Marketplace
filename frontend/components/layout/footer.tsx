import Link from "next/link";
import { Github, Linkedin, ShieldCheck, Twitter } from "lucide-react";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Marketplace", href: "/marketplace" },
      { label: "Owner Dashboard", href: "/dashboard/owner" },
      { label: "Agent Dashboard", href: "/dashboard/agent" },
      { label: "Buyer Dashboard", href: "/dashboard/buyer" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/#footer" },
      { label: "Verified Agents", href: "/#trusted-agents" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer id="footer" className="border-t border-border/60 bg-muted/20">
      <div className="container max-w-[1280px] grid gap-8 py-10 md:grid-cols-4">
        {/* About column */}
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand text-primary-foreground">
              <ShieldCheck className="h-4.5 w-4.5" />
            </span>
            <span className="text-base font-bold">
              Chain<span className="text-gradient">Estate</span>
            </span>
          </Link>
          <p className="mt-3 max-w-sm text-xs text-muted-foreground leading-relaxed">
            Secure real estate ownership powered by blockchain technology. Verify property titles, authorize listing agents, and transfer assets transparently.
          </p>
          <div className="mt-4 flex gap-2">
            {[Twitter, Linkedin, Github].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/40"
                aria-label="Social link"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Links columns */}
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">{col.title}</h4>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border/60 bg-muted/30">
        <div className="container max-w-[1280px] flex flex-col items-center justify-between gap-2 py-4 text-[10px] font-medium text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} ChainEstate. All rights reserved.</p>
          <p>Built for demonstration — mock blockchain data.</p>
        </div>
      </div>
    </footer>
  );
}
