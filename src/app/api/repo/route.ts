import {NextRequest, NextResponse} from "next/server";
import {redis} from "@/lib/redis";
import {redisCircuit} from "@/lib/circuit-breaker";
import {getRepoDetails} from "@/lib/utils";

export async function GET(req: NextRequest) {
  const {searchParams} = new URL(req.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const token = req.headers.get("Authorization") || "";

  if (!owner || !repo) {
    return NextResponse.json({error: "Missing 'owner', 'repo'"}, {status: 400});
  }

  const cacheKey = `github:repo:${owner}/${repo}`;
  const cachedDataStr = await redisCircuit.execute(async () => await redis.get(cacheKey));

  if (cachedDataStr) {
    return NextResponse.json(cachedDataStr);
  }

  try {
    const repoDetails = await getRepoDetails(token, owner, repo);

    const data = {
      ...repoDetails,
      cached_at: new Date().toISOString(),
    };

    // Cache the data with TTL of 1 hour
    await redisCircuit.execute(async () => await redis.set(cacheKey, data, {ex: 3600}));

    return NextResponse.json(data);
  } catch (error: unknown) {
    // Check if it's a circuit breaker error
    if (error instanceof Error && error.message.includes("Circuit breaker OPEN")) {
      return NextResponse.json(
        {
          error: "Service Temporarily Unavailable",
          message: "Database service is temporarily unavailable. Please try again later.",
        },
        {status: 503},
      );
    }

    const axiosError = error as {
      response?: {status?: number; headers?: Record<string, string>; data?: unknown};
    };
    const status = axiosError.response?.status;
    const rateLimitRemaining = axiosError.response?.headers?.["x-ratelimit-remaining"];

    if (status === 403 && rateLimitRemaining === "0") {
      return NextResponse.json(
        {
          error: "GitHub API rate limit exceeded. Please try again later.",
        },
        {status: 429},
      );
    }

    if (error instanceof Error) {
      console.error("GitHub API error:", axiosError.response?.data || error.message);
    } else {
      console.error("GitHub API error:", axiosError.response?.data || "Unknown error");
    }

    return NextResponse.json({error: "Failed to fetch repository details"}, {status: 500});
  }
}
