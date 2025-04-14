import { NextRequest } from "next/server";
import { GitHubRepo } from "@/lib/types";

const GITHUB_API_URL = "https://api.github.com/search/repositories";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function GET(request: NextRequest): Promise<Response> {
  const searchParams = request.nextUrl.searchParams;
  const language = searchParams.get("language") || "";
  const per_page = parseInt(searchParams.get("per_page") || "10", 10);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const formattedDate = oneWeekAgo.toISOString().split("T")[0];

  const query = `created:>${formattedDate}${
    language ? ` language:${language}` : ""
  }`;

  const url = `${GITHUB_API_URL}?q=${encodeURIComponent(
    query
  )}&sort=stars&order=desc&per_page=${per_page}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(GITHUB_TOKEN && { Authorization: `Bearer ${GITHUB_TOKEN}` }),
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch trending repositories" }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const items: GitHubRepo[] = data.items.map((repo: any) => ({
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

    return new Response(JSON.stringify(items), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: "Internal Server Error", detail: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
