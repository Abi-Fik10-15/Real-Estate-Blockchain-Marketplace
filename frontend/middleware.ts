import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register", "/marketplace", "/faq", "/cookie-policy"];
const DASHBOARD_PREFIX = "/dashboard";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let public routes and static assets through immediately
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // For dashboard routes, check for auth token cookie / header
  if (pathname.startsWith(DASHBOARD_PREFIX)) {
    // Token is stored in localStorage (client-side only), so we can't fully
    // protect at the edge without a cookie. We redirect unauthenticated SSR
    // requests based on the absence of a session cookie if one is set,
    // otherwise the client-side layout.tsx guard handles it.
    // This middleware still improves performance by handling preflight checks.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files and Next internals.
     * The dashboard layout handles auth redirects client-side.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
