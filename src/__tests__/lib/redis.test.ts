// Mock @upstash/redis BEFORE importing the module that uses it.
// Use inline jest.fn() — do NOT reference outer variables inside factory (temporal dead zone).
jest.mock("@upstash/redis", () => ({
  Redis: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    get: jest.fn(),
  })),
}));

import {checkRedisConnection, redis} from "@/lib/redis";

// The exported `redis` constant is the instance created by the mocked constructor.
const mockSet = redis.set as jest.Mock;
const mockGet = redis.get as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("checkRedisConnection", () => {
  it("resolves when set and get both succeed with the expected value", async () => {
    mockSet.mockResolvedValueOnce("OK");
    mockGet.mockResolvedValueOnce("test");
    await expect(checkRedisConnection()).resolves.toBeUndefined();
  });

  it("throws when get returns an unexpected value", async () => {
    mockSet.mockResolvedValueOnce("OK");
    mockGet.mockResolvedValueOnce("wrong-value");
    await expect(checkRedisConnection()).rejects.toThrow("Redis connection failed");
  });

  it("throws when set rejects", async () => {
    mockSet.mockRejectedValueOnce(new Error("Connection refused"));
    await expect(checkRedisConnection()).rejects.toThrow(
      "Redis connection failed: Connection refused",
    );
  });

  it("throws when get rejects", async () => {
    mockSet.mockResolvedValueOnce("OK");
    mockGet.mockRejectedValueOnce(new Error("Timeout"));
    await expect(checkRedisConnection()).rejects.toThrow("Redis connection failed: Timeout");
  });

  it("includes 'Unknown error' when a non-Error is thrown", async () => {
    mockSet.mockRejectedValueOnce("plain string error");
    await expect(checkRedisConnection()).rejects.toThrow("Unknown error");
  });
});
