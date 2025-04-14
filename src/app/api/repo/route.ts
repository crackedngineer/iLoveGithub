import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const githubClient = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github+json",
    ...(GITHUB_TOKEN && { Authorization: `Bearer ${GITHUB_TOKEN}` }),
  },
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Missing 'owner' or 'repo' query params" },
      { status: 400 }
    );
  }

  try {
    const [repoRes, topicsRes] = await Promise.all([
      githubClient.get(`/repos/${owner}/${repo}`),
      githubClient.get(`/repos/${owner}/${repo}/topics`, {
        headers: {
          Accept: "application/vnd.github.mercy-preview+json",
        },
      }),
    ]);

    const data = {
      ...repoRes.data,
      topics: topicsRes.data.names || [],
    };

    return NextResponse.json(data);
  } catch (error: any) {
    const status = error?.response?.status;
    const rateLimitRemaining =
      error?.response?.headers?.["x-ratelimit-remaining"];

    // Rate limit exceeded
    if (status === 403 && rateLimitRemaining === "0") {
      return NextResponse.json(
        {
          error: "GitHub API rate limit exceeded. Please try again later.",
        },
        { status: 429 }
      );
    }

    console.error("GitHub API error:", error?.response?.data || error.message);

    return NextResponse.json(
      { error: "Failed to fetch repository details" },
      { status: 500 }
    );
  }
}
