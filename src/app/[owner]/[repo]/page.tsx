"use client";
import axios from "axios";
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
import { useSession, signIn, getSession } from "next-auth/react";

export default function RepoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams() as { owner: string; repo: string };
  const { owner, repo } = params;

  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<"rate-limit" | "generic" | null>(null);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false); // New state for sign-in loading

  useEffect(() => {
    if (status === "unauthenticated" && !isSigningIn) {
      setIsSigningIn(true); // Trigger signing in state

      const pendingUrl = `https://github.com/${owner}/${repo}`;

      if (pendingUrl) {
        sessionStorage.setItem("pendingRepoUrl", pendingUrl);
      }

      signIn("github", { callbackUrl: window.location.href });
      return;
    }

    if (status === "authenticated") {
      const pendingUrl = sessionStorage.getItem("pendingRepoUrl");

      if (pendingUrl) {
        sessionStorage.removeItem("pendingRepoUrl");
        window.location.href = pendingUrl; // 🔁 Redirect after login
      } else {
        fetchRepoData();
      }
    }
  }, [owner, repo, status]); // Trigger on session change

  const fetchRepoData = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const stored: RepoData[] = JSON.parse(
        localStorage.getItem(RECENT_REPO_LOCAL_STORAGE_KEY) || "[]"
      );
      const fullName = `${owner}/${repo}`.toLowerCase();
      const cached = stored.find((r) => r.fullName.toLowerCase() === fullName);

      const isCacheValid =
        cached?.cachedAt && Date.now() - cached.cachedAt < 5 * 60 * 1000; // 5 minutes cache validity

      if (isCacheValid && cached) {
        setRepoData(cached);
        updateRecentRepos(cached); // Refresh LRU
        return;
      }

      // Get token from NextAuth session
      const session = await getSession();
      const token = session?.accessToken;

      const response = await axios.get(
        `/api/repo?owner=${owner}&repo=${repo}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const githubData = response.data;

      const transformedData: RepoData = {
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
        cachedAt: Date.now(),
      };

      setRepoData(transformedData);
      updateRecentRepos(transformedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("generic");
    } finally {
      setIsLoading(false);
      setIsSigningIn(false); // Reset sign-in loading state after fetching data
    }
  };

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

        {isSigningIn && !isLoading && !repoData && (
          <div className="w-full text-center">
            <p className="text-xl">Signing in to GitHub...</p>
          </div>
        )}

        {error && (
          <div className="text-center text-red-500">
            <p>Oops, something went wrong. Please try again later.</p>
          </div>
        )}

        {!isLoading && !error && repoData && (
          <>
            <RepoInfo repo={repoData} />
            <GitHubTools
              owner={repoData.owner}
              repo={repoData.name}
              default_branch={repoData.default_branch}
            />
          </>
        )}
      </main>
    </AppLayout>
  );
}
