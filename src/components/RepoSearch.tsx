"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RECENT_REPO_LOCAL_STORAGE_KEY,
  RECENT_TRENDING_REPO_UI_MAXCOUNT,
} from "@/constants";
import { RepoData } from "./RepoInfo";

interface TrendingRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  language: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}

type RepoSubmitHandler = {
  e: React.FormEvent;
  owner?: string;
  repo?: string;
  repoUrl?: string;
  onSubmit: (owner: string, repo: string) => void;
  onError?: (error: any) => void;
};

const RepoSearch = ({
  value = "",
  onError,
  trending = true,
  onRepoSubmit,
}: {
  value: string;
  onError?: (error: string | null) => void;
  trending: boolean;
  onRepoSubmit: (owner: string, repo: string) => void;
}) => {
  const { data: session, status } = useSession();
  const [repoUrl, setRepoUrl] = useState(value);
  const [error, setError] = useState("");
  const [trendingRepos, setTrendingRepos] = useState<TrendingRepo[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const extractRepoDetails = (
    url: string
  ): { owner: string; repo: string } | null => {
    setError("");
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/]+)/,
      /^([^\/]+)\/([^\/]+)$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const [, owner, repo] = match;
        return {
          owner,
          repo: repo.replace(".git", "").split("#")[0].split("?")[0],
        };
      }
    }

    setError("Invalid repository URL format.");
    return null;
  };

  const handleRepoSubmit = ({
    e,
    owner,
    repo,
    repoUrl,
    onSubmit,
    onError,
  }: RepoSubmitHandler) => {
    e.preventDefault();

    const isUnauthenticated = !status || status === "unauthenticated";

    if (isUnauthenticated) {
      const pendingUrl =
        repoUrl?.trim() ||
        (owner && repo ? `https://github.com/${owner}/${repo}` : null);

      if (pendingUrl) {
        sessionStorage.setItem("pendingRepoUrl", pendingUrl);
      }

      signIn("github", { callbackUrl: window.location.href });
      return;
    }

    if (repoUrl?.trim()) {
      const details = extractRepoDetails(repoUrl);
      if (details) {
        onSubmit(details.owner, details.repo);
      } else {
        onError?.(null);
      }
    } else if (owner && repo) {
      onSubmit(owner, repo);
    } else {
      onError?.("Please enter a valid repository URL");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    handleRepoSubmit({
      e,
      repoUrl,
      onSubmit: onRepoSubmit,
      onError: setError,
    });
  };

  const onTrendingRepoSubmit = (
    e: React.FormEvent,
    owner: string,
    repo: string
  ) => {
    handleRepoSubmit({
      e,
      owner,
      repo,
      onSubmit: onRepoSubmit,
    });
  };

  useEffect(() => {
    const recent = JSON.parse(
      localStorage.getItem(RECENT_REPO_LOCAL_STORAGE_KEY) || "[]"
    ) as RepoData[];
    setRecent(
      recent
        .slice(0, RECENT_TRENDING_REPO_UI_MAXCOUNT)
        .map((item) => item.fullName)
    );
  }, []);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/repo/trending");
        if (!res.ok) throw new Error("Failed to fetch trending.json");

        const data = await res.json();
        setTrendingRepos(data);
      } catch (e) {
        console.error("Failed to fetch trending repositories", e);
      } finally {
        setLoading(false);
      }
    };

    if (trending) fetchTrending();
  }, []);

  // Add a useEffect to check for pending repo URL after authentication
  useEffect(() => {
    if (status === "authenticated") {
      const pendingRepoUrl = sessionStorage.getItem("pendingRepoUrl");
      if (pendingRepoUrl) {
        setRepoUrl(pendingRepoUrl);
        sessionStorage.removeItem("pendingRepoUrl");

        // Optionally auto-submit the form
        const repoDetails = extractRepoDetails(pendingRepoUrl);
        if (repoDetails) {
          onRepoSubmit(repoDetails.owner, repoDetails.repo);
        }
      }
    }
  }, [status]);

  const handleRecentClick = (entry: string) => {
    const [owner, repo] = entry.split("/");
    setRepoUrl(`https://github.com/${entry}`);
    onRepoSubmit(owner, repo);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto animate-fade-in px-4 sm:px-6">
      <CardContent className="pt-6 pb-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Enter GitHub URL (e.g., https://github.com/subhomoy-roy-choudhury/iLoveGithub) or user/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="pr-10 h-12"
              />
              <Search
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>
            <Button
              type="submit"
              className="h-12 w-full md:w-auto bg-github-blue hover:bg-blue-700 text-white"
            >
              {status === "authenticated"
                ? "🚀 Analyze Repository"
                : "✨ Sign In to Analyze"}
            </Button>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>

        {/* Recent Searches */}
        {recent.length > 0 && status === "authenticated" && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Recent Searches
            </h4>
            <div className="flex flex-wrap gap-2">
              {recent.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  onClick={() => handleRecentClick(entry)}
                  className="max-w-[200px] truncate px-3 py-1 text-sm rounded-md bg-muted hover:bg-accent text-foreground transition-colors duration-200 ease-in-out"
                  title={entry} // Show full text on hover
                >
                  <span className="truncate block">{entry}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trending */}
        {trending && (
          <div className="mt-8">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Top Trending GitHub Repositories
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[80px] rounded-xl" />
                  ))
                : trendingRepos.map((repo) => (
                    <Card
                      key={repo.id}
                      className="p-4 hover:shadow-sm cursor-pointer transition"
                      onClick={(event) =>
                        onTrendingRepoSubmit(event, repo.owner.login, repo.name)
                      }
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {repo.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {repo.description || "No description"}
                          </p>
                        </div>
                        <img
                          src={repo.owner.avatar_url}
                          alt={repo.owner.login}
                          className="w-8 h-8 rounded-full"
                        />
                      </div>
                    </Card>
                  ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RepoSearch;
