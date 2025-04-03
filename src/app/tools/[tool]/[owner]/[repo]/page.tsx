"use client";
import { useState, useEffect } from "react";
import ToolViewer from "@/components/ToolViewer";
import { RepoData } from "@/components/RepoInfo";
import { fetchRepoDetails } from "@/services/githubService";
import { GithubToolsList } from "@/constants";
import { replaceUrlVariables } from "@/app/helper";

interface PageProps {
  params: {
    tool: string;
    owner: string;
    repo: string;
  };
}

export default function ToolsPage({ params }: PageProps) {
  const { tool, owner, repo } = params;
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const toolData = GithubToolsList[tool as keyof typeof GithubToolsList];
  const toolLink = toolData?.url
    ? replaceUrlVariables(toolData.url, { owner, repo })
    : null;

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const githubData = await fetchRepoDetails(owner, repo);

        if (!githubData) {
          throw new Error("GitHub API returned no data");
        }

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
        };

        setRepoData(transformedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [owner, repo]); // Removed `params` since `owner` and `repo` cover all changes

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <main>
      {repoData && toolLink ? (
        <ToolViewer url={toolLink} repoData={repoData} />
      ) : (
        <p>Error fetching repository data.</p>
      )}
    </main>
  );
}
