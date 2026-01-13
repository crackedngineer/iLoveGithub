// app/api/readyz/route.ts
import {NextRequest, NextResponse} from "next/server";
import {healthMonitor} from "@/lib/health-monitor";
import {supabaseCircuit, redisCircuit} from "@/lib/circuit-breaker";

/**
 * Readiness probe - checks if the application is ready to serve traffic
 * This checks all critical dependencies (DB, Redis, etc.)
 * Used by load balancers to determine if traffic should be routed to this instance
 */
export async function GET(req: NextRequest) {
  // parameter to force check
  const forceCheck = req.nextUrl.searchParams.get("force_check") === "true";
  if (forceCheck) {
    await healthMonitor.forceCheck();
  }
  const status = healthMonitor.getStatus();

  const isInitializing =
    status.services.supabase.status === "unknown" || status.services.redis.status === "unknown";

  const isHealthy = status.healthy;

  const response = {
    status: isInitializing ? "initializing" : isHealthy ? "ready" : "not ready",
    healthy: isHealthy,
    initializing: isInitializing,
    timestamp: new Date().toISOString(),
    lastCheck: status.lastCheck,
    services: {
      supabase: {
        status: status.services.supabase.status,
        lastCheck: status.services.supabase.lastCheck,
        error: status.services.supabase.error,
        circuit: supabaseCircuit.getStats(),
      },
      redis: {
        status: status.services.redis.status,
        lastCheck: status.services.redis.lastCheck,
        error: status.services.redis.error,
        circuit: redisCircuit.getStats(),
      },
    },
  };

  // Return 503 if unhealthy, 200 if healthy or still initializing
  const statusCode = isInitializing ? 200 : isHealthy ? 200 : 503;

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
