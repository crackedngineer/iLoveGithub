import { type NextRequest, NextResponse } from "next/server";
import { extractSubdomainFromHostname } from "./lib/utils";

function extractSubdomain(req: NextRequest): string | null {
  const host = req.headers.get("host") || "";
  const hostname = host.split(":")[0];
  return extractSubdomainFromHostname(hostname);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);

  const pathMatch = pathname.match(/^\/([^\/]+)\/([^\/]+)$/);

  if (subdomain && pathMatch) {
    const owner = pathMatch[1];

    const repo = pathMatch[2];

    // Rewrite to /tools/[subdomain]/[owner]/[repo]
    return NextResponse.rewrite(
      new URL(`/tools/${subdomain}/${owner}/${repo}`, request.url),
    );
  }
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next|[\\w-]+\\.\\w+).*)",
  ],
};
