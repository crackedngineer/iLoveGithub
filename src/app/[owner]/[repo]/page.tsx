"use client";

import {useCallback, useMemo, useEffect, useState} from "react";
import {useRouter, useParams} from "next/navigation";
import RepoExplorer from "@/components/RepoExplorer";
import GitHubTools from "@/components/GitHubTools";
import AppLayout from "@/components/AppLayout";
import {Introduction} from "@/components/Introduction";
import {RECENT_REPO_LOCAL_STORAGE_KEY, RECENT_TRENDING_REPO_CACHE_MAXCOUNT} from "@/constants";
import {useApiLimit} from "@/components/ApiLimitContext";
import {Tool} from "@/lib/types";
import {useAuth} from "@/components/AuthProvider";
import {fetchRepoDetails} from "@/services/github";
import {fetchToolList} from "@/services/tools";
import type {RepoData} from "@/components/RepoExplorer";

export default function RepoPage() {
  const {session, loading} = useAuth();
  const router = useRouter();
  const params = useParams() as {owner: string; repo: string};
  const {owner, repo} = params;
  const {remaining} = useApiLimit();

  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<"rate-limit" | "generic" | null>(null);

  const fullName = useMemo(() => `${owner}/${repo}`.toLowerCase(), [owner, repo]);
  const token = useMemo(() => session?.provider_token, [session?.provider_token]);

  const updateRecentRepos = (details: RepoData) => {
    const stored = JSON.parse(
      localStorage.getItem(RECENT_REPO_LOCAL_STORAGE_KEY) || "[]",
    ) as string[];
    const updated = [details.fullName, ...stored.filter((n) => n !== details.fullName)].slice(
      0,
      RECENT_TRENDING_REPO_CACHE_MAXCOUNT,
    );
    localStorage.setItem(RECENT_REPO_LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  const fetchRepoData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!session && !remaining) {
        setError("rate-limit");
        setRepoData({
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
        });
        return;
      }
      const githubData = await fetchRepoDetails(owner, repo, token);
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
    } catch {
      setError("generic");
    } finally {
      setIsLoading(false);
    }
  }, [session, owner, repo, fullName, token, remaining]);

  const fetchTools = useCallback(async () => {
    if (!repoData) return;
    try {
      const t = await fetchToolList(repoData.owner, repoData.name, repoData.default_branch);
      setTools(t);
    } catch {
      setTools([]);
    }
  }, [repoData]);

  useEffect(() => {
    if (!loading) fetchRepoData();
  }, [loading, fetchRepoData]);
  useEffect(() => {
    if (repoData) fetchTools();
  }, [repoData, fetchTools]);

  return (
    <AppLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Introduction />

        <RepoExplorer
          key={`${owner}-${repo}`}
          value={`${owner}/${repo}`}
          trending={false}
          onRepoSubmit={(o, r) => {
            if (o.trim() && r.trim()) router.push(`/${o}/${r}`);
          }}
          repoData={repoData}
          tools={tools.filter((t) => t.type === "application")}
          isLoading={isLoading}
          fetchError={error}
          isLoggedIn={!!session || !!remaining}
        />

        <GitHubTools tools={tools.filter((t) => t.type !== "application")} />
      </div>
    </AppLayout>
  );
}
