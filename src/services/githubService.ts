import axios from "axios";

export interface RateLimitResponse {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

export class RateLimitError extends Error {
  constructor(public response: RateLimitResponse) {
    super("GitHub API rate limit exceeded");
    this.name = "RateLimitError";
  }
}

export const fetchRateLimit = async (): Promise<RateLimitResponse> => {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
  };

  try {
    const response = await axios.get("https://api.github.com/rate_limit", {
      headers,
    });
    const rate = response.data.rate as RateLimitResponse;

    if (rate.remaining === 0) {
      throw new RateLimitError(rate);
    }

    return rate;
  } catch (error: any) {
    if (error instanceof RateLimitError) {
      throw error;
    }

    console.error(
      "Error fetching rate limit:",
      error?.response?.data || error.message
    );

    return {
      limit: 60,
      remaining: 0,
      reset: Math.floor(Date.now() / 1000) + 3600,
      used: 0,
    };
  }
};
