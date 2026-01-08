import {type NextRequest, NextResponse} from "next/server";
import {extractSubdomainFromHostname} from "./lib/utils";
import {healthMonitor} from "./lib/health-monitor";

function extractSubdomain(req: NextRequest): string | null {
  const host = req.headers.get("host") || "";
  const hostname = host.split(":")[0];
  return extractSubdomainFromHostname(hostname);
}

export function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;

  // Always allow health check endpoints
  if (pathname.startsWith("/api/healthz") || pathname.startsWith("/api/readyz")) {
    return NextResponse.next();
  }

  // Get health status
  const status = healthMonitor.getStatus();

  // If services are still unknown (initializing), allow requests
  const isInitializing =
    status.services.supabase.status === "unknown" || status.services.redis.status === "unknown";

  if (isInitializing) {
    console.log("⏳ System still initializing, allowing request");
    return NextResponse.next();
  }

  // Check if system is healthy
  if (!healthMonitor.isHealthy()) {
    console.warn(`⚠️  Request blocked due to unhealthy system: ${pathname}`);

    return NextResponse.json(
      {
        error: "Service Unavailable",
        message: "The system is temporarily unavailable due to issues with critical dependencies",
        details: {
          supabase: status.services.supabase.status,
          redis: status.services.redis.status,
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          "Retry-After": "30", // Suggest retry after 30 seconds
        },
      },
    );
  }

  // Match paths like /owner/repo
  const subdomain = extractSubdomain(request);
  const pathMatch = pathname.match(/^\/([^\/]+)\/([^\/]+)$/);

  if (subdomain && pathMatch) {
    const owner = pathMatch[1];

    const repo = pathMatch[2];

    // Rewrite to /tools/[subdomain]/[owner]/[repo]
    return NextResponse.rewrite(new URL(`/tools/${subdomain}/${owner}/${repo}`, request.url));
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
