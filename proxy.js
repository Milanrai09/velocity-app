import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

// Frontend routes that should stay public.
const PUBLIC_PAGE_PATHS = new Set([]);
const PUBLIC_PAGE_PREFIXES = [];

function isPublicPage(pathname) {
  if (PUBLIC_PAGE_PATHS.has(pathname)) {
    return true;
  }

  return PUBLIC_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function proxy(request) {
  const authResponse = await auth0.middleware(request);
  const { pathname, search } = request.nextUrl;

  // Let Auth0 system routes run normally.
  if (pathname.startsWith("/auth")) {
    return authResponse;
  }

  const session = await auth0.getSession(request);

  // APIs should return 401 JSON instead of browser redirects.
  if (pathname.startsWith("/api")) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return authResponse;
  }

  // Explicit public frontend allowlist.
  if (isPublicPage(pathname)) {
    return authResponse;
  }

  if (!session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("returnTo", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return authResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
