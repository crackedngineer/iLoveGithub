// lib/health-monitor.ts
import {checkSupabaseConnection} from "./supabase";
import {checkRedisConnection} from "./redis";

export type ServiceStatus = "healthy" | "unhealthy" | "unknown";

export interface ServiceHealth {
  status: ServiceStatus;
  lastCheck: Date;
  error?: string;
}

export interface HealthStatus {
  healthy: boolean;
  services: {
    supabase: ServiceHealth;
    redis: ServiceHealth;
  };
  lastCheck: Date;
}

class HealthMonitor {
  private status: HealthStatus = {
    healthy: false,
    services: {
      supabase: {
        status: "unknown",
        lastCheck: new Date(),
      },
      redis: {
        status: "unknown",
        lastCheck: new Date(),
      },
    },
    lastCheck: new Date(),
  };

  private checkInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private readonly CHECK_INTERVAL_MS = 30000; // 30 seconds

  /**
   * Start the health monitor
   */
  start(): void {
    if (this.isRunning) {
      console.warn("⚠️  Health monitor already running");
      return;
    }

    this.isRunning = true;
    console.log("🏥 Health monitor started (checking every 30s)");

    // Perform initial check immediately (don't await to avoid blocking)
    this.performHealthCheck().catch((error) => {
      console.error("Initial health check failed:", error);
    });

    // Then check periodically
    this.checkInterval = setInterval(() => {
      this.performHealthCheck().catch((error) => {
        console.error("Periodic health check failed:", error);
      });
    }, this.CHECK_INTERVAL_MS);
  }

  /**
   * Stop the health monitor
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log("🛑 Health monitor stopped");
  }

  /**
   * Perform health check on all services
   */
  async performHealthCheck(): Promise<void> {
    const checkTime = new Date();
    const previousHealth = this.status.healthy;

    // Check all services in parallel
    const results = await Promise.allSettled([this.checkSupabase(), this.checkRedis()]);

    // Update Supabase status
    if (results[0].status === "fulfilled") {
      this.status.services.supabase = {
        status: "healthy",
        lastCheck: checkTime,
      };
    } else {
      this.status.services.supabase = {
        status: "unhealthy",
        lastCheck: checkTime,
        error: results[0].reason?.message || "Unknown error",
      };
    }

    // Update Redis status
    if (results[1].status === "fulfilled") {
      this.status.services.redis = {
        status: "healthy",
        lastCheck: checkTime,
      };
    } else {
      this.status.services.redis = {
        status: "unhealthy",
        lastCheck: checkTime,
        error: results[1].reason?.message || "Unknown error",
      };
    }

    // Update overall health
    this.status.healthy =
      this.status.services.supabase.status === "healthy" &&
      this.status.services.redis.status === "healthy";

    this.status.lastCheck = checkTime;

    // Log status changes
    if (previousHealth && !this.status.healthy) {
      console.error("❌ ALERT: System became unhealthy", {
        supabase: this.status.services.supabase.status,
        redis: this.status.services.redis.status,
      });
      this.logUnhealthyServices();
    } else if (!previousHealth && this.status.healthy) {
      console.log("✅ RECOVERY: System is now healthy");
    }
  }

  /**
   * Check Supabase connection
   */
  private async checkSupabase(): Promise<void> {
    try {
      await checkSupabaseConnection();
    } catch (error) {
      console.error(
        "Supabase health check failed:",
        error instanceof Error ? error.message : error,
      );
      throw error;
    }
  }

  /**
   * Check Redis connection
   */
  private async checkRedis(): Promise<void> {
    try {
      await checkRedisConnection();
    } catch (error) {
      console.error("Redis health check failed:", error instanceof Error ? error.message : error);
      throw error;
    }
  }

  /**
   * Log details about unhealthy services
   */
  private logUnhealthyServices(): void {
    const unhealthy = Object.entries(this.status.services)
      .filter(([_, service]) => service.status === "unhealthy")
      .map(([name, service]) => ({name, error: service.error}));

    if (unhealthy.length > 0) {
      console.error("Unhealthy services:", unhealthy);
    }
  }

  /**
   * Get current health status
   */
  getStatus(): HealthStatus {
    return JSON.parse(JSON.stringify(this.status)); // Deep clone
  }

  /**
   * Check if system is healthy
   */
  isHealthy(): boolean {
    return this.status.healthy;
  }

  /**
   * Get status of a specific service
   */
  getServiceStatus(service: "supabase" | "redis"): ServiceHealth {
    return {...this.status.services[service]};
  }

  /**
   * Force an immediate health check
   */
  async forceCheck(): Promise<HealthStatus> {
    await this.performHealthCheck();
    return this.getStatus();
  }
}

declare global {
  var healthMonitor: HealthMonitor | undefined;
}

// Export singleton instance
export const healthMonitor = (globalThis.healthMonitor ??= new HealthMonitor());
