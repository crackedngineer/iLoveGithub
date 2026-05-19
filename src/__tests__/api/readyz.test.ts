/**
 * @jest-environment node
 */

jest.mock("@/lib/health-monitor", () => ({
  healthMonitor: {
    forceCheck: jest.fn(),
    getStatus: jest.fn(),
    isHealthy: jest.fn(),
  },
}));

jest.mock("@/lib/circuit-breaker", () => ({
  supabaseCircuit: {
    getStats: jest.fn().mockReturnValue({state: "CLOSED", failureCount: 0, name: "Supabase"}),
  },
  redisCircuit: {
    getStats: jest.fn().mockReturnValue({state: "CLOSED", failureCount: 0, name: "Redis"}),
  },
}));

import {NextRequest} from "next/server";
import {GET} from "@/app/api/readyz/route";
import {healthMonitor} from "@/lib/health-monitor";

const mockForceCheck = healthMonitor.forceCheck as jest.Mock;

const healthyStatus = {
  healthy: true,
  services: {
    supabase: {status: "healthy", lastCheck: new Date()},
    redis: {status: "healthy", lastCheck: new Date()},
  },
  lastCheck: new Date(),
};

const unknownStatus = {
  healthy: false,
  services: {
    supabase: {status: "unknown", lastCheck: new Date()},
    redis: {status: "unknown", lastCheck: new Date()},
  },
  lastCheck: new Date(),
};

const unhealthyStatus = {
  healthy: false,
  services: {
    supabase: {status: "unhealthy", lastCheck: new Date(), error: "Connection refused"},
    redis: {status: "healthy", lastCheck: new Date()},
  },
  lastCheck: new Date(),
};

function makeReq(url = "http://localhost/api/readyz") {
  return new NextRequest(url);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/readyz", () => {
  it("returns HTTP 200 and status 'ready' when all services are healthy", async () => {
    mockForceCheck.mockResolvedValueOnce(healthyStatus);
    const res = await GET(makeReq());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("ready");
    expect(data.healthy).toBe(true);
  });

  it("returns HTTP 200 and status 'initializing' when services are still unknown", async () => {
    mockForceCheck.mockResolvedValueOnce(unknownStatus);
    const res = await GET(makeReq());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("initializing");
    expect(data.initializing).toBe(true);
  });

  it("returns HTTP 503 and status 'not ready' when a service is unhealthy", async () => {
    mockForceCheck.mockResolvedValueOnce(unhealthyStatus);
    const res = await GET(makeReq());
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.status).toBe("not ready");
    expect(data.healthy).toBe(false);
  });

  it("includes circuit breaker stats in the response", async () => {
    mockForceCheck.mockResolvedValueOnce(healthyStatus);
    const res = await GET(makeReq());
    const data = await res.json();
    expect(data.services.supabase.circuit).toBeDefined();
    expect(data.services.redis.circuit).toBeDefined();
  });

  it("sets Cache-Control: no-cache headers", async () => {
    mockForceCheck.mockResolvedValueOnce(healthyStatus);
    const res = await GET(makeReq());
    expect(res.headers.get("Cache-Control")).toContain("no-cache");
  });

  it("calls forceCheck a second time when force_check=true is in the query string", async () => {
    mockForceCheck.mockResolvedValue(healthyStatus);
    const req = new NextRequest("http://localhost/api/readyz?force_check=true");
    await GET(req);
    // forceCheck is called once for the force_check param + once in the route body = 2
    expect(mockForceCheck).toHaveBeenCalledTimes(2);
  });
});
