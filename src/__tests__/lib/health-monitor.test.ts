jest.mock("@/lib/supabase", () => ({
  checkSupabaseConnection: jest.fn(),
  supabase: {from: jest.fn(), auth: {}},
}));

jest.mock("@/lib/redis", () => ({
  checkRedisConnection: jest.fn(),
  redis: {get: jest.fn(), set: jest.fn()},
}));

import {checkSupabaseConnection} from "@/lib/supabase";
import {checkRedisConnection} from "@/lib/redis";
import {healthMonitor} from "@/lib/health-monitor";

const mockSupabase = checkSupabaseConnection as jest.Mock;
const mockRedis = checkRedisConnection as jest.Mock;

/** Reset the singleton to a known-unhealthy baseline before each test. */
async function resetHealthState() {
  healthMonitor.stop();
  mockSupabase.mockRejectedValueOnce(new Error("reset"));
  mockRedis.mockRejectedValueOnce(new Error("reset"));
  await healthMonitor.performHealthCheck();
}

beforeEach(async () => {
  jest.clearAllMocks();
  jest.spyOn(console, "log").mockImplementation();
  jest.spyOn(console, "warn").mockImplementation();
  jest.spyOn(console, "error").mockImplementation();
  await resetHealthState();
  jest.clearAllMocks(); // clear the reset call counts
});

afterEach(() => {
  jest.restoreAllMocks();
  healthMonitor.stop();
});

describe("HealthMonitor.performHealthCheck", () => {
  it("marks both services healthy when both checks pass", async () => {
    mockSupabase.mockResolvedValueOnce(undefined);
    mockRedis.mockResolvedValueOnce(undefined);

    await healthMonitor.performHealthCheck();

    const status = healthMonitor.getStatus();
    expect(status.services.supabase.status).toBe("healthy");
    expect(status.services.redis.status).toBe("healthy");
    expect(status.healthy).toBe(true);
  });

  it("marks supabase unhealthy when the supabase check fails", async () => {
    mockSupabase.mockRejectedValueOnce(new Error("Supabase down"));
    mockRedis.mockResolvedValueOnce(undefined);

    await healthMonitor.performHealthCheck();

    const status = healthMonitor.getStatus();
    expect(status.services.supabase.status).toBe("unhealthy");
    expect(status.services.redis.status).toBe("healthy");
    expect(status.healthy).toBe(false);
  });

  it("marks redis unhealthy when the redis check fails", async () => {
    mockSupabase.mockResolvedValueOnce(undefined);
    mockRedis.mockRejectedValueOnce(new Error("Redis down"));

    await healthMonitor.performHealthCheck();

    expect(healthMonitor.getStatus().services.redis.status).toBe("unhealthy");
    expect(healthMonitor.isHealthy()).toBe(false);
  });

  it("records the error message when a service check fails", async () => {
    mockSupabase.mockRejectedValueOnce(new Error("Connection refused"));
    mockRedis.mockResolvedValueOnce(undefined);

    await healthMonitor.performHealthCheck();

    expect(healthMonitor.getStatus().services.supabase.error).toBe("Connection refused");
  });

  it("updates lastCheck timestamp on each check", async () => {
    mockSupabase.mockResolvedValueOnce(undefined);
    mockRedis.mockResolvedValueOnce(undefined);
    const before = new Date();

    await healthMonitor.performHealthCheck();

    const {lastCheck} = healthMonitor.getStatus();
    expect(new Date(lastCheck).getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it("logs a recovery message when transitioning from unhealthy to healthy", async () => {
    // Baseline: unhealthy (set by resetHealthState in beforeEach)
    mockSupabase.mockResolvedValueOnce(undefined);
    mockRedis.mockResolvedValueOnce(undefined);
    await healthMonitor.performHealthCheck();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("healthy"));
  });
});

describe("HealthMonitor.isHealthy", () => {
  it("returns false after an unhealthy check", () => {
    // resetHealthState ensures state is unhealthy
    expect(healthMonitor.isHealthy()).toBe(false);
  });

  it("returns true after both services pass a check", async () => {
    mockSupabase.mockResolvedValueOnce(undefined);
    mockRedis.mockResolvedValueOnce(undefined);
    await healthMonitor.performHealthCheck();
    expect(healthMonitor.isHealthy()).toBe(true);
  });
});

describe("HealthMonitor.getServiceStatus", () => {
  it("returns the supabase service status", async () => {
    mockSupabase.mockResolvedValueOnce(undefined);
    mockRedis.mockResolvedValueOnce(undefined);
    await healthMonitor.performHealthCheck();
    expect(healthMonitor.getServiceStatus("supabase").status).toBe("healthy");
  });

  it("returns the redis service status", async () => {
    mockSupabase.mockResolvedValueOnce(undefined);
    mockRedis.mockResolvedValueOnce(undefined);
    await healthMonitor.performHealthCheck();
    expect(healthMonitor.getServiceStatus("redis").status).toBe("healthy");
  });
});

describe("HealthMonitor.forceCheck", () => {
  it("returns a HealthStatus with healthy, services, and lastCheck fields", async () => {
    mockSupabase.mockResolvedValueOnce(undefined);
    mockRedis.mockResolvedValueOnce(undefined);
    const result = await healthMonitor.forceCheck();
    expect(result).toHaveProperty("healthy");
    expect(result).toHaveProperty("services");
    expect(result).toHaveProperty("lastCheck");
  });
});

describe("HealthMonitor.start and stop", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("does not throw when start is called twice (second call is a no-op)", () => {
    mockSupabase.mockResolvedValue(undefined);
    mockRedis.mockResolvedValue(undefined);
    expect(() => {
      healthMonitor.start();
      healthMonitor.start();
    }).not.toThrow();
  });

  it("stops cleanly without throwing", () => {
    expect(() => healthMonitor.stop()).not.toThrow();
  });
});

describe("HealthMonitor.getStatus deep clone", () => {
  it("mutating the returned status object does not affect internal state", async () => {
    mockSupabase.mockResolvedValueOnce(undefined);
    mockRedis.mockResolvedValueOnce(undefined);
    await healthMonitor.performHealthCheck();

    const snapshot = healthMonitor.getStatus();
    snapshot.healthy = false; // mutate clone

    expect(healthMonitor.getStatus().healthy).toBe(true); // internal unchanged
  });
});
