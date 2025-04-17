import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");

  if (!owner || !repo || !token) {
    return NextResponse.json(
      { error: "Missing 'owner', 'repo' or Authorization 'token'" },
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

  try {
    const [repoRes, topicsRes] = await Promise.all([
      githubClient.get(`/repos/${owner}/${repo}`),
      githubClient.get(`/repos/${owner}/${repo}/topics`, {
        headers: {
          Accept: "application/vnd.github.mercy-preview+json",
          Authorization: `Bearer ${token}`,
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
