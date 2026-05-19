/**
 * @jest-environment node
 */

jest.mock("@/lib/redis", () => ({
  redis: {get: jest.fn(), set: jest.fn()},
  checkRedisConnection: jest.fn(),
}));

jest.mock("@/lib/circuit-breaker", () => ({
  redisCircuit: {
    execute: jest.fn((fn: () => Promise<unknown>) => fn()),
    getStats: jest.fn().mockReturnValue({state: "CLOSED"}),
  },
  supabaseCircuit: {
    execute: jest.fn((fn: () => Promise<unknown>) => fn()),
    getStats: jest.fn().mockReturnValue({state: "CLOSED"}),
  },
}));

jest.mock("@/lib/utils", () => ({
  ...jest.requireActual("@/lib/utils"),
  getRepoDetails: jest.fn(),
}));

import {NextRequest} from "next/server";
import {GET} from "@/app/api/repo/route";
import {redis} from "@/lib/redis";
import {redisCircuit} from "@/lib/circuit-breaker";
import {getRepoDetails} from "@/lib/utils";

const mockRedisGet = redis.get as jest.Mock;
const mockRedisSet = redis.set as jest.Mock;
const mockRedisCircuit = redisCircuit.execute as jest.Mock;
const mockGetRepoDetails = getRepoDetails as jest.Mock;

function makeReq(owner?: string, repo?: string) {
  const params = new URLSearchParams();
  if (owner) params.set("owner", owner);
  if (repo) params.set("repo", repo);
  return new NextRequest(`http://localhost/api/repo?${params}`);
}

beforeEach(() => {
  jest.clearAllMocks();
  // Default: circuit executes fn directly
  mockRedisCircuit.mockImplementation((fn: () => Promise<unknown>) => fn());
});

describe("GET /api/repo", () => {
  it("returns 400 when owner is missing", async () => {
    const res = await GET(makeReq(undefined, "Hello-World"));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/owner/i);
  });

  it("returns 400 when repo is missing", async () => {
    const res = await GET(makeReq("octocat", undefined));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/repo/i);
  });

  it("returns cached data with 200 when the cache is warm", async () => {
    const cached = {name: "Hello-World", stargazers_count: 100};
    mockRedisGet.mockResolvedValueOnce(cached);

    const res = await GET(makeReq("octocat", "Hello-World"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe("Hello-World");
    expect(mockGetRepoDetails).not.toHaveBeenCalled();
  });

  it("fetches from GitHub and caches the result when cache is cold", async () => {
    mockRedisGet.mockResolvedValueOnce(null);
    const repoData = {name: "Hello-World", full_name: "octocat/Hello-World"};
    mockGetRepoDetails.mockResolvedValueOnce(repoData);
    mockRedisSet.mockResolvedValueOnce("OK");

    const res = await GET(makeReq("octocat", "Hello-World"));
    expect(res.status).toBe(200);
    expect(mockRedisSet).toHaveBeenCalledTimes(1);
    const data = await res.json();
    expect(data.name).toBe("Hello-World");
    expect(data).toHaveProperty("cached_at");
  });

  it("returns 503 when the circuit breaker is open on the cache-write call", async () => {
    // First execute (cache read) passes through; second (cache write) throws the OPEN error
    mockRedisCircuit
      .mockImplementationOnce((fn: () => Promise<unknown>) => fn())
      .mockRejectedValueOnce(new Error("Circuit breaker OPEN for Redis. Service unavailable."));
    mockRedisGet.mockResolvedValueOnce(null);
    mockGetRepoDetails.mockResolvedValueOnce({
      name: "Hello-World",
      full_name: "octocat/Hello-World",
    });

    const res = await GET(makeReq("octocat", "Hello-World"));
    expect(res.status).toBe(503);
  });

  it("returns 429 when GitHub rate limit is exceeded (403 + ratelimit header)", async () => {
    mockRedisGet.mockResolvedValueOnce(null);
    const rateLimitError: unknown = {
      response: {status: 403, headers: {"x-ratelimit-remaining": "0"}, data: {}},
    };
    mockGetRepoDetails.mockRejectedValueOnce(rateLimitError);

    const res = await GET(makeReq("octocat", "Hello-World"));
    expect(res.status).toBe(429);
  });

  it("returns 500 for unexpected GitHub API errors", async () => {
    mockRedisGet.mockResolvedValueOnce(null);
    mockGetRepoDetails.mockRejectedValueOnce(new Error("Unexpected error"));

    const res = await GET(makeReq("octocat", "Hello-World"));
    expect(res.status).toBe(500);
  });
});
