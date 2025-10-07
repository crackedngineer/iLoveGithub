"use client";
import axios from "axios";
import {useCallback, useMemo, useEffect, useState} from "react";
import {useRouter, useParams} from "next/navigation";
import RepoInfo, {RepoData} from "@/components/RepoInfo";
import GitHubTools from "@/components/GitHubTools";
import RepoSearch from "@/components/RepoSearch";
import AppLayout from "@/components/AppLayout";
import {Introduction} from "@/components/Introduction";
import {RECENT_REPO_LOCAL_STORAGE_KEY, RECENT_TRENDING_REPO_CACHE_MAXCOUNT} from "@/constants";
import {useSession} from "next-auth/react";
import {useApiLimit} from "@/components/ApiLimitContext";
import {Tool} from "@/lib/types";

export default function RepoPage() {
  const {data: session, status} = useSession();
  const router = useRouter();
  const params = useParams() as {owner: string; repo: string};
  const {owner, repo} = params;
  const {remaining} = useApiLimit();

  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<"rate-limit" | "generic" | null>(null);

  const fullName = useMemo(() => `${owner}/${repo}`.toLowerCase(), [owner, repo]);

  const token = useMemo(() => {
    return session?.accessToken;
  }, [status]);

  const updateRecentRepos = (details: RepoData) => {
    const stored = JSON.parse(
      localStorage.getItem(RECENT_REPO_LOCAL_STORAGE_KEY) || "[]",
    ) as string[];
    const updated = [details.fullName, ...stored.filter((name) => name !== details.fullName)].slice(
      0,
      RECENT_TRENDING_REPO_CACHE_MAXCOUNT,
    );
    localStorage.setItem(RECENT_REPO_LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  const fetchRepoData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (status !== "authenticated" && !remaining) {
        setError("rate-limit");
        const fallbackRepo: RepoData = {
          name: repo,
          owner,
          fullName,
          description: "This is dummy repo data used as a fallback.",
          url: `https://github.com/${owner}/${repo}`,
          stars: 0,
          forks: 0,
          watchers: 0,
          language: "Unknown",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          topics: [],
          default_branch: "main",
          cachedAt: Date.now(),
        };
        setRepoData(fallbackRepo);
        return;
      }

      const response = await axios.get(`/api/repo?owner=${owner}&repo=${repo}`, {
        headers: token ? {Authorization: `Bearer ${token}`} : {},
      });

      const githubData = response.data;
      const transformed: RepoData = {
        name: githubData.name,
        owner,
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
        cachedAt: githubData.cached_at || Date.now(),
      };

      setRepoData(transformed);
      updateRecentRepos(transformed);
    } catch (error) {
      console.error("Error fetching repo data:", error);
      setError("generic");
    } finally {
      setIsLoading(false);
    }
  }, [owner, repo, status, session, remaining, updateRecentRepos]);

  const fetchTools = useCallback(async () => {
    if (!repoData) return;
    try {
      const {data} = await axios.get(
        `/api/tools?owner=${repoData.owner}&repo=${repoData.name}&branch=${repoData.default_branch}`,
      );
      setTools(data);
    } catch (err) {
      console.error("Error fetching tools:", err);
      setTools([]);
    }
  }, [repoData]);

  useEffect(() => {
    if (status !== "loading") {
      fetchRepoData();
    }
  }, [owner, repo, status]);

  useEffect(() => {
    if (repoData) fetchTools();
  }, [repoData, fetchTools]);

  return (
    <AppLayout>
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Introduction />

        <RepoSearch
          key={`${owner}-${repo}`}
          value={`${owner}/${repo}`}
          trending={false}
          onError={() => setError(null)}
          onRepoSubmit={(owner, repo) => {
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

        {error === "generic" && (
          <div className="text-center text-red-500">
            <p>Oops, something went wrong. Please try again later.</p>
          </div>
        )}

        {!isLoading && repoData && (
          <>
            <RepoInfo repo={repoData} isLoggedIn={status === "authenticated" || !!remaining} />
            <GitHubTools tools={tools} />
          </>
        )}
      </main>
    </AppLayout>
  );
}
