/*
  Instrumentation module to register startup checks and health monitoring
*/

import {healthMonitor} from "@/lib/health-monitor";
import {checkSupabaseConnection} from "@/lib/supabase";
import {checkRedisConnection} from "@/lib/redis";

/**
 * This function runs once when the Next.js server starts
 */
export async function register() {
  // Only run on Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("🚀 Starting application...");

    try {
      // Step 1: Check critical dependencies on startup
      await checkCriticalDependencies();

      // Step 2: Start continuous health monitoring
      healthMonitor.start();

      // Step 3: Wait for the first health check to complete
      // This ensures the status is properly initialized
      console.log("⏳ Waiting for initial health check...");
      await healthMonitor.forceCheck();

      const status = healthMonitor.getStatus();
      console.log("📊 Initial health status:", {
        healthy: status.healthy,
        supabase: status.services.supabase.status,
        redis: status.services.redis.status,
      });

      console.log("✅ Application started successfully");
    } catch (error) {
      console.error("❌ Failed to start application:", error);

      // In production, exit if critical dependencies fail
      if (process.env.NODE_ENV === "production") {
        console.error("💥 Exiting due to failed dependency checks...");
        process.exit(1);
      } else {
        // In development, log warning but continue
        console.warn("⚠️  Continuing in development mode despite errors...");
        // Still start the health monitor
        healthMonitor.start();
      }
    }
  }
}

/**
 * Check all critical dependencies on startup
 */
async function checkCriticalDependencies(): Promise<void> {
  console.log("🔍 Checking critical dependencies...");

  const checks = [
    checkDependency("Supabase", checkSupabaseConnection),
    checkDependency("Redis", checkRedisConnection),
  ];

  // Run all checks in parallel
  const results = await Promise.allSettled(checks);

  // Check if any failed
  const failures = results.filter((r) => r.status === "rejected");

  if (failures.length > 0) {
    const errors = failures.map((f, i) => {
      const serviceName = ["Supabase", "Redis"][i];
      const reason = f.status === "rejected" ? f.reason : "Unknown error";
      return `${serviceName}: ${reason instanceof Error ? reason.message : reason}`;
    });

    throw new Error(`Dependency checks failed:\n${errors.join("\n")}`);
  }

  console.log("✅ All critical dependencies are healthy");
}

/**
 * Helper to check individual dependency
 */
async function checkDependency(name: string, checkFn: () => Promise<void>): Promise<void> {
  try {
    console.log(`  Checking ${name}...`);
    await checkFn();
    console.log(`  ✅ ${name} connected`);
  } catch (error) {
    console.error(`  ❌ ${name} failed:`, error instanceof Error ? error.message : error);
    throw error;
  }
}
