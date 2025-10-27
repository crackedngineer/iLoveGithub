// app/api/trending/route.ts
import {NextResponse} from "next/server";
import {GITHUB_API_URL, TRENDING_REPO_TTL} from "@/constants";
import {GitHubRepo} from "@/lib/types";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function GET(req: Request) {
  const {searchParams} = new URL(req.url);
  const language = searchParams.get("language") || "";
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  // GitHub API requires per_page + page
  const page = Math.floor(offset / limit) + 1;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const formattedDate = oneWeekAgo.toISOString().split("T")[0];

  let query = `created:>${formattedDate}`;
  if (language) query += ` language:${language}`;

  const url = `${GITHUB_API_URL}/search/repositories?q=${encodeURIComponent(
    query,
  )}&sort=stars&order=desc&per_page=${limit}&page=${page}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(GITHUB_TOKEN ? {Authorization: `Bearer ${GITHUB_TOKEN}`} : {}),
      },
      next: {revalidate: TRENDING_REPO_TTL},
    });

    if (!res.ok) {
      return NextResponse.json({error: `GitHub API error: ${res.status}`}, {status: res.status});
    }

    const data = await res.json();

    const items = data.items.map((repo: GitHubRepo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      html_url: repo.html_url,
      description: repo.description,
      stargazers_count: repo.stargazers_count,
      language: repo.language,
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url,
        html_url: repo.owner.html_url,
      },
    }));

    return NextResponse.json(
      {
        items,
        pagination: {
          limit,
          offset,
          total_count: data.total_count,
          next_offset: offset + limit,
          has_more: offset + limit < data.total_count,
        },
      },
      {
        headers: {
          "Cache-Control": "s-maxage=86400, stale-while-revalidate=3600",
        },
      },
    );
  } catch (err) {
    console.error("GitHub API fetch failed:", err);
    return NextResponse.json({error: "Failed to fetch trending repositories"}, {status: 500});
  }
}
