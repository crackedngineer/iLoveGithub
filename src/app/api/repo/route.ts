import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const token = req.headers.get("Authorization");

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Missing 'owner', 'repo'" },
      { status: 400 }
    );
  }

  const githubClient = axios.create({
    baseURL: "https://api.github.com",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
    },
  });

  const headers = {
    Accept: "application/vnd.github.mercy-preview+json",
    Authorization: token || `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
  };

  try {
    const [repoRes, topicsRes] = await Promise.all([
      githubClient.get(`/repos/${owner}/${repo}`, { headers: headers }),
      githubClient.get(`/repos/${owner}/${repo}/topics`, {
        headers: headers,
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
