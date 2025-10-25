import axios from "axios";
import {DefaultGithubRepo, GITHUB_API_URL} from "../constants";

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

export const fetchRepoDetails = async (owner: string, repo: string, token?: string | null) => {
  try {
    const header = token ? {Authorization: `Bearer ${token}`} : {};
    const response = await axios.get(`/api/repo?owner=${owner}&repo=${repo}`, {
      headers: header,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching repo data:", error);
    throw error;
  }
};

export const fetchRateLimit = async (): Promise<RateLimitResponse> => {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    ...(process.env.NEXT_PUBLIC_GITHUB_TOKEN
      ? {Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`}
      : {}),
  };

  try {
    const response = await axios.get(`${GITHUB_API_URL}/rate_limit`, {
      headers,
    });
    const rate = response.data.rate as RateLimitResponse;

    if (rate.remaining === 0) {
      throw new RateLimitError(rate);
    }

    return rate;
  } catch (error: unknown) {
    if (error instanceof RateLimitError) {
      throw error;
    }

    if (axios.isAxiosError(error))
      console.error("Error fetching rate limit:", error?.response?.data || error.message);

    return {
      limit: 60,
      remaining: 0,
      reset: Math.floor(Date.now() / 1000) + 3600,
      used: 0,
    };
  }
};

export const getRepoDefaultBranch = async (
  owner: string,
  repo: string,
  token?: string,
): Promise<string> => {
  try {
    const response = await fetchRepoDetails(owner, repo, token);
    return response.default_branch;
  } catch (error) {
    console.error("Error fetching default branch:", error);
    return DefaultGithubRepo.branch;
  }
};
