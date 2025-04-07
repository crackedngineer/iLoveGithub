"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import ToolViewer from "@/components/ToolViewer";
import { RepoData } from "@/components/RepoInfo";
import { fetchRepoDetails } from "@/services/githubService";
import { GithubToolsList } from "@/constants";
import { replaceUrlVariables } from "@/app/helper";
import { useParams } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";

export default function ToolsPage() {
  const params = useParams() as { tool: string; owner: string; repo: string };
  const { tool, owner, repo } = params;
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const toolData = GithubToolsList.find((item) => item.name === tool);
  const toolLink = toolData?.url
    ? replaceUrlVariables(toolData.url, {
        owner,
        repo,
      })
    : null;

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const githubData = await fetchRepoDetails(owner, repo);

        if (!githubData) throw new Error("GitHub API returned no data");

        const transformedData: RepoData = {
          name: githubData.name,
          owner: owner,
          fullName: githubData.full_name,
          description: githubData.description || "No description provided",
          url: githubData.html_url,
          stars: githubData.stargazers_count,
          forks: githubData.forks_count,
          watchers: githubData.watchers_count,
          language: githubData.language || "Not specified",
          createdAt: githubData.created_at,
          updatedAt: githubData.updated_at,
          topics: githubData.topics || [],
          default_branch: githubData.default_branch,
        };

        setRepoData(transformedData);
      } catch (error) {
        console.error("Error fetching GitHub repo:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [owner, repo]);

  return (
    <div className="min-h-screen w-full overflow-hidden">
      {isLoading ? (
        <LoadingScreen tool={tool} owner={owner} repo={repo} />
      ) : repoData && toolLink ? (
        <ToolViewer url={toolLink} repoData={repoData} />
      ) : (
        <div className="w-full p-4 text-center text-red-500">
          Error fetching repository data.
        </div>
      )}
    </div>
  );
}
