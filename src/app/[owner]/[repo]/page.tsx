"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import RepoInfo, { RepoData } from "@/components/RepoInfo";
import GitHubTools from "@/components/GitHubTools";
import RepoSearch from "@/components/RepoSearch";
import AppLayout from "@/components/AppLayout";
import { Introduction } from "@/components/Introduction";
import {
  RECENT_REPO_LOCAL_STORAGE_KEY,
  RECENT_TRENDING_REPO_CACHE_MAXCOUNT,
} from "@/constants";

export default function RepoPage() {
  const router = useRouter();
  const params = useParams() as { owner: string; repo: string };
  const { owner, repo } = params;

  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<"rate-limit" | "generic" | null>(null);

  useEffect(() => {
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const stored = JSON.parse(
          localStorage.getItem(RECENT_REPO_LOCAL_STORAGE_KEY) || "[]"
        ) as RepoData[];

        const cached = stored.find(
          (r) => r.fullName.toLowerCase() === `${owner}/${repo}`.toLowerCase()
        );

        const isCacheValid =
          cached &&
          cached.cachedAt &&
          Date.now() - cached.cachedAt < CACHE_DURATION;

        if (isCacheValid) {
          setRepoData(cached);
          updateRecentRepos(cached); // refresh LRU order
          return;
        }

        const response = await fetch(`/api/repo?owner=${owner}&repo=${repo}`);

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("rate limit");
          }
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to load data");
        }

        const githubData = await response.json();

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
        updateRecentRepos(transformedData);
      } catch (error: any) {
        console.error("Error fetching data:", error);

        if (error.message?.includes("rate limit")) {
          setError("rate-limit");
        } else {
          setError("generic");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [owner, repo]);

  const updateRecentRepos = (details: RepoData) => {
    const stored = JSON.parse(
      localStorage.getItem(RECENT_REPO_LOCAL_STORAGE_KEY) || "[]"
    ) as RepoData[];

    const timestamped = { ...details, cachedAt: Date.now() };

    const updated = [
      timestamped,
      ...stored.filter((r) => r.fullName !== details.fullName),
    ].slice(0, RECENT_TRENDING_REPO_CACHE_MAXCOUNT);

    localStorage.setItem(
      RECENT_REPO_LOCAL_STORAGE_KEY,
      JSON.stringify(updated)
    );
  };

  return (
    <AppLayout>
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Introduction />

        <RepoSearch
          key={`${owner}-${repo}-${Date.now()}`}
          value={`${owner}/${repo}`}
          trending={false}
          onError={() => setError(null)}
          onRepoSubmit={(owner: string, repo: string) => {
            if (owner.trim() && repo.trim()) {
              router.push(`/${owner}/${repo}`);
            }
          }}
        />

        {isLoading && (
          <div className="w-full max-w-4xl mx-auto mt-8 flex justify-center px-4">
            <div className="animate-pulse-subtle flex flex-col items-center w-full">
              <div className="h-6 w-2/3 sm:w-1/2 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
              <div className="h-4 w-5/6 sm:w-2/3 bg-gray-200 dark:bg-gray-800 rounded mb-3"></div>
              <div className="h-4 w-4/5 sm:w-1/2 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
        )}

        {/* Rate limit error UI */}
        {error === "rate-limit" && (
          <div className="w-full max-w-xl mx-auto mt-12 p-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg text-center">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3">
              🚀 Join to Continue
            </h2>
            <p className="text-base sm:text-lg mb-6">
              Please log in with GitHub to use the application. It's completely
              free.
            </p>
            <button
              onClick={() => router.push("/auth/github")}
              className="px-5 py-2.5 bg-black text-white rounded-full hover:bg-gray-800 transition"
            >
              Login with GitHub
            </button>
          </div>
        )}

        {/* Generic error fallback */}
        {error === "generic" && (
          <div className="w-full max-w-4xl mx-auto mt-8 p-4 bg-red-100 text-red-800 border border-red-300 rounded-md text-center text-sm sm:text-base">
            Failed to load repository data. Please try again.
          </div>
        )}

        {!isLoading && !error && repoData && <RepoInfo repo={repoData} />}
        {!isLoading && !error && repoData && (
          <GitHubTools
            owner={repoData.owner}
            repo={repoData.name}
            default_branch={repoData.default_branch}
          />
        )}
      </main>
    </AppLayout>
  );
}
