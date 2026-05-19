import {Redis} from "@upstash/redis";

const redisUrl = process.env.KV_REST_API_URL;
const redisToken = process.env.KV_REST_API_TOKEN;

export const redis = new Redis({
  url: redisUrl!,
  token: redisToken!,
});

export async function checkRedisConnection(): Promise<void> {
  try {
    const testKey = "healthcheck:test";
    await redis.set(testKey, "test", {ex: 10});
    const value = await redis.get(testKey);
    if (value !== "test") {
      throw new Error("Redis health check failed: unexpected value");
    }
  } catch (error) {
    throw new Error(
      `Redis connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
