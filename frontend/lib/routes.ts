export const BUYER_MARKETPLACE_PATH = "/dashboard/buyer/marketplace";

export function settingsPath(role: string) {
  return `/dashboard/${role}/settings`;
}

export const PUBLIC_NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#featured-properties", label: "Listings" },
] as const;
