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
  supabaseCircuit: {getStats: jest.fn().mockReturnValue({state: "CLOSED"})},
}));

jest.mock("@vercel/blob", () => ({
  put: jest.fn().mockResolvedValue({url: "https://blob.example.com/qr-abc123.png"}),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

import {NextRequest} from "next/server";
import {POST} from "@/app/api/qrcode/generate/route";
import {redis} from "@/lib/redis";
import {redisCircuit} from "@/lib/circuit-breaker";
import {put} from "@vercel/blob";

const mockRedisGet = redis.get as jest.Mock;
const mockRedisSet = redis.set as jest.Mock;
const mockRedisCircuit = redisCircuit.execute as jest.Mock;
const mockPut = put as jest.Mock;

function makeReq(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/qrcode/generate", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {"Content-Type": "application/json"},
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockRedisCircuit.mockImplementation((fn: () => Promise<unknown>) => fn());
  mockFetch.mockResolvedValue({
    ok: true,
    arrayBuffer: async () => new ArrayBuffer(100),
  });
});

describe("POST /api/qrcode/generate", () => {
  it("returns 400 when the data field is missing", async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
  });

  it("returns 400 when data is not a string", async () => {
    const res = await POST(makeReq({data: 123}));
    expect(res.status).toBe(400);
  });

  it("returns the cached image URL when cache is warm", async () => {
    mockRedisGet.mockResolvedValueOnce("https://blob.example.com/cached.png");

    const res = await POST(makeReq({data: "https://example.com", image: ""}));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.image).toBe("https://blob.example.com/cached.png");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("generates, uploads, and caches the QR code image when cache is cold", async () => {
    mockRedisGet.mockResolvedValueOnce(null);

    const res = await POST(makeReq({data: "https://example.com", image: ""}));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.image).toBe("https://blob.example.com/qr-abc123.png");
    expect(mockPut).toHaveBeenCalledTimes(1);
    expect(mockRedisSet).toHaveBeenCalledTimes(1);
  });

  it("returns 500 when the QR code API call fails", async () => {
    mockRedisGet.mockResolvedValueOnce(null);
    mockFetch.mockResolvedValueOnce({ok: false});

    const res = await POST(makeReq({data: "https://example.com"}));
    expect(res.status).toBe(500);
  });

  it("returns 503 when the circuit breaker is open", async () => {
    mockRedisCircuit.mockRejectedValue(
      new Error("Circuit breaker OPEN for Redis. Service unavailable."),
    );
    const res = await POST(makeReq({data: "https://example.com"}));
    expect(res.status).toBe(503);
  });

  it("uses a deterministic cache key based on data and image inputs", async () => {
    mockRedisGet.mockResolvedValueOnce(null);

    await POST(makeReq({data: "https://example.com", image: "logo.png"}));
    const cacheKey = mockRedisGet.mock.calls[0][0] as string;
    expect(cacheKey).toMatch(/^qr:url:[a-f0-9]{64}$/);
  });
});
