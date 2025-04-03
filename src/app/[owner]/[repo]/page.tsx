"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RepoInfo, { RepoData } from "@/components/RepoInfo";
import GitHubTools from "@/components/GitHubTools";
import { fetchRepoDetails } from "@/services/githubService";
import RepoSearch from "@/components/RepoSearch";
import AppLayout from "@/components/AppLayout";

interface PageProps {
  params: {
    owner: string;
    repo: string;
  };
}

export default function RepoPage({ params }: PageProps) {
  const { owner, repo } = params;
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate fetching data based on the query parameter
    const fetchData = async (): Promise<void> => {
      try {
        // Simulate API call delay
        const githubData = await fetchRepoDetails(owner, repo);

        // Transform GitHub API response to our RepoData format
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
  }, [owner, params, repo]);

  return (
    <AppLayout>
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-github-gray dark:text-white mb-4">
            Discover GitHub Tools
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore GitHub repositories and find the best tools to enhance your
            GitHub experience
          </p>
        </div>
        <RepoSearch
          value={`${owner}/${repo}`}
          onRepoSubmit={(owner: string, repo: string) => {
            if (owner.trim() && repo.trim()) {
              router.push(`/${owner}/${repo}`);
            }
          }}
        />
        {isLoading && (
          <div className="w-full max-w-4xl mx-auto mt-8 flex justify-center">
            <div className="animate-pulse-subtle flex flex-col items-center">
              <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
              <div className="h-4 w-96 bg-gray-200 dark:bg-gray-800 rounded mb-3"></div>
              <div className="h-4 w-80 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
        )}

        {!isLoading && repoData && <RepoInfo repo={repoData} />}

        {repoData && (
          <GitHubTools owner={repoData.owner} repo={repoData.name} />
        )}
      </main>
    </AppLayout>
  );
}
