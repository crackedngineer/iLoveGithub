"use client";

import React, {useEffect, useState, useRef, useCallback} from "react";
import Image from "next/image";
import {
  Search,
  GitFork,
  Star,
  Eye,
  Calendar,
  GitBranch,
  FileCode,
  Clock,
  Info,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Rocket,
} from "lucide-react";
import {formatDistanceToNow} from "date-fns";
import {Card} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
import {cn} from "@/lib/utils";
import {useAuth} from "./AuthProvider";
import ShareQRCodeModal from "./ShareQRCodeModal";
import {ViewCodeDropdown} from "./ViewCodeDropdown";
import {RECENT_REPO_LOCAL_STORAGE_KEY, RECENT_TRENDING_REPO_UI_MAXCOUNT} from "@/constants";
import type {Tool} from "@/lib/types";

/* ── Language colour map ────────────────────────────────────── */
const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#fa7343",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Scala: "#c22d40",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  Lua: "#000080",
  R: "#198CE7",
};

function fmtStat(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".0", "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(".0", "") + "k";
  return n.toLocaleString();
}

/* ── Trending repo shape ────────────────────────────────────── */
interface TrendingRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  language: string;
  owner: {login: string; avatar_url: string};
}

/* ── Props ──────────────────────────────────────────────────── */
interface RepoExplorerProps {
  value?: string;
  trending?: boolean;
  onRepoSubmit: (owner: string, repo: string) => void;
  /* details-page props */
  repoData?: RepoData | null;
  tools?: Tool[];
  isLoading?: boolean;
  fetchError?: "rate-limit" | "generic" | null;
  isLoggedIn?: boolean;
}

/* ── Small sub-components ───────────────────────────────────── */
function StatRow({
  icon,
  value,
  label,
  accent,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", accent)}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-mono font-bold leading-none tracking-tight">{value}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

function MetaItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground/60 shrink-0">{icon}</span>
      <span className="text-muted-foreground w-16 shrink-0">{label}</span>
      <span className="text-foreground font-medium truncate">{children}</span>
    </div>
  );
}

export interface RepoData {
  name: string;
  owner: string;
  fullName: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  watchers: number;
  language: string;
  createdAt: string;
  updatedAt: string;
  topics: string[];
  default_branch: string;
  cachedAt: number;
}

/* ── Main ───────────────────────────────────────────────────── */
export default function RepoExplorer({
  value = "",
  trending = false,
  onRepoSubmit,
  repoData,
  tools = [],
  isLoading = false,
  fetchError = null,
  isLoggedIn = false,
}: RepoExplorerProps) {
  const {session, signInWithGitHub} = useAuth();

  /* search state */
  const [repoUrl, setRepoUrl] = useState(value);
  const [inputError, setInputError] = useState("");
  const repoInputRef = useRef<HTMLInputElement>(null);

  /* trending */
  const [trendingRepos, setTrendingRepos] = useState<TrendingRepo[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(false);

  /* recent */
  const [recent, setRecent] = useState<string[]>([]);

  /* repo detail actions */
  const [isQROpen, setIsQROpen] = useState(false);
  const [cloneCopied, setCloneCopied] = useState(false);

  /* ── URL parser ─────────────────────────────────────────── */
  const extractRepo = useCallback((url: string): {owner: string; repo: string} | null => {
    setInputError("");
    const patterns = [/github\.com\/([^\/]+)\/([^\/]+)/, /^([^\/]+)\/([^\/]+)$/];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return {owner: m[1], repo: m[2].replace(".git", "").split(/[#?]/)[0]};
    }
    setInputError("Enter a GitHub URL or owner/repo");
    return null;
  }, []);

  /* ── Submit ─────────────────────────────────────────────── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const details = extractRepo(repoInputRef.current?.value || "");
    if (details) onRepoSubmit(details.owner, details.repo);
  };

  /* ── Trending fetch ─────────────────────────────────────── */
  useEffect(() => {
    if (!trending) return;
    setTrendingLoading(true);
    fetch("/api/repo/trending?limit=6&offset=0")
      .then((r) => r.json())
      .then((d) => setTrendingRepos(d.items ?? []))
      .catch(() => {})
      .finally(() => setTrendingLoading(false));
  }, [trending]);

  /* ── Recent from localStorage ───────────────────────────── */
  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem(RECENT_REPO_LOCAL_STORAGE_KEY) ?? "[]",
    ) as string[];
    setRecent(stored.slice(0, RECENT_TRENDING_REPO_UI_MAXCOUNT));
  }, []);

  /* ── Post-auth pending redirect ─────────────────────────── */
  useEffect(() => {
    if (!session) return;
    const pending = sessionStorage.getItem("pendingRepoUrl");
    if (!pending) return;
    sessionStorage.removeItem("pendingRepoUrl");
    setRepoUrl(pending);
    const details = extractRepo(pending);
    if (details) onRepoSubmit(details.owner, details.repo);
  }, [session, extractRepo, onRepoSubmit]);

  /* ── Sync input when URL param changes ─────────────────── */
  useEffect(() => {
    setRepoUrl(value);
  }, [value]);

  /* ── Clone copy ─────────────────────────────────────────── */
  const copyClone = async () => {
    if (!repoData) return;
    await navigator.clipboard
      .writeText(`https://github.com/${repoData.owner}/${repoData.name}.git`)
      .catch(() => {});
    setCloneCopied(true);
    setTimeout(() => setCloneCopied(false), 2000);
  };

  /* ── Sign-in (login wall) ───────────────────────────────── */
  const handleSignIn = () => {
    if (repoData) {
      sessionStorage.setItem(
        "pendingRepoUrl",
        `https://github.com/${repoData.owner}/${repoData.name}`,
      );
    }
    signInWithGitHub();
  };

  const langColor = repoData ? (LANG_COLORS[repoData.language] ?? "#8b949e") : "#8b949e";
  const showLoginWall = !isLoggedIn && !!repoData && !isLoading;

  return (
    <>
      <Card className="w-full mt-6 animate-fade-in overflow-hidden gap-0">
        {/* ── Search zone ─────────────────────────────────── */}
        <div className="px-5 py-5 bg-muted/30 dark:bg-muted/10">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                ref={repoInputRef}
                type="text"
                placeholder="https://github.com/owner/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="pl-9 h-11"
              />
            </div>
            <Button
              type="submit"
              className="h-11 shrink-0 bg-github-blue hover:bg-blue-700 text-white gap-2"
            >
              <Rocket size={15} />
              Analyze
            </Button>
          </form>

          {inputError && <p className="mt-2 text-xs text-red-500">{inputError}</p>}

          {/* Recent searches */}
          {recent.length > 0 && !!session && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="text-[11px] text-muted-foreground mr-1 self-center">Recent:</span>
              {recent.map((entry) => {
                const [owner, repo] = entry.split("/");
                return (
                  <button
                    key={entry}
                    onClick={() => {
                      setRepoUrl(`https://github.com/${entry}`);
                      onRepoSubmit(owner, repo);
                    }}
                    className="px-2.5 py-0.5 text-xs rounded-full font-mono
                               bg-background border border-border
                               hover:border-github-blue/40 hover:text-github-blue
                               transition-colors truncate max-w-[180px]"
                    title={entry}
                  >
                    {entry}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Content zone ────────────────────────────────── */}
        <div className="border-t border-border">
          {/* HOME — trending repos */}
          {trending && (
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                Top Trending Repositories
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3">
                {trendingLoading
                  ? Array.from({length: 6}).map((_, i) => (
                      <Skeleton key={i} className="h-20 rounded-xl" />
                    ))
                  : trendingRepos.map((repo) => (
                      <button
                        key={repo.id}
                        onClick={() => onRepoSubmit(repo.owner.login, repo.name)}
                        className="flex items-start gap-3 p-3 rounded-xl text-left
                                   border border-border bg-background
                                   hover:border-github-blue/40 hover:shadow-sm
                                   transition-all duration-150"
                      >
                        <Image
                          src={repo.owner.avatar_url}
                          alt={repo.owner.login}
                          width={32}
                          height={32}
                          className="rounded-full shrink-0 mt-0.5"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground truncate leading-tight">
                            {repo.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {repo.description || "No description"}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[11px] text-yellow-500 font-medium">
                              ★ {repo.stargazers_count.toLocaleString()}
                            </span>
                            {repo.language && (
                              <span className="text-[11px] text-muted-foreground">
                                {repo.language}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
              </div>
            </div>
          )}

          {/* REPO — loading skeleton */}
          {!trending && isLoading && (
            <div className="p-6 space-y-4 animate-pulse-subtle">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <div className="grid grid-cols-3 gap-3 mt-2">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            </div>
          )}

          {/* REPO — generic error */}
          {!trending && fetchError === "generic" && (
            <div className="p-8 flex flex-col items-center gap-2 text-center">
              <AlertCircle size={28} className="text-red-400" />
              <p className="text-sm font-medium text-foreground">Something went wrong</p>
              <p className="text-xs text-muted-foreground">
                Could not load repository data. Please try again.
              </p>
            </div>
          )}

          {/* REPO — details */}
          {!trending && repoData && !isLoading && (
            <div className="relative">
              {/* Blurred content when login wall active */}
              <div
                className={cn(showLoginWall && "filter blur-sm pointer-events-none select-none")}
              >
                {/* Language accent strip */}
                <div className="h-[3px]" style={{background: langColor}} />

                {/* Repo header */}
                <div className="px-6 pt-5 pb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0 space-y-2">
                    {/* Breadcrumb */}
                    <div className="font-mono text-sm text-muted-foreground flex items-center gap-1">
                      <span>{repoData.owner}</span>
                      <span className="text-border px-0.5">/</span>
                      <span className="text-foreground font-bold">{repoData.name}</span>
                    </div>
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge className="text-[10px] h-5 px-2 py-0 bg-github-blue/10 text-github-blue border-github-blue/20 dark:bg-github-blue/20">
                        Public
                      </Badge>
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] h-5 px-2 py-0 gap-1"
                      >
                        <GitBranch size={9} />
                        {repoData.default_branch}
                      </Badge>
                      {repoData.language && (
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] h-5 px-2 py-0 gap-1.5"
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{background: langColor}}
                          />
                          {repoData.language}
                        </Badge>
                      )}
                      {repoData.cachedAt && (
                        <span
                          className="text-[10px] text-muted-foreground italic flex items-center gap-1"
                          title={new Date(repoData.cachedAt).toLocaleString()}
                        >
                          <Info size={10} />
                          synced{" "}
                          {formatDistanceToNow(new Date(repoData.cachedAt), {addSuffix: true})}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs font-mono"
                      onClick={copyClone}
                    >
                      {cloneCopied ? (
                        <>
                          <Check size={12} className="text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          Clone
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => setIsQROpen(true)}
                    >
                      <QrCode size={12} />
                      QR
                    </Button>
                    <ViewCodeDropdown
                      owner={repoData.owner}
                      repo={repoData.name}
                      branch={repoData.default_branch}
                      tools={tools}
                    />
                  </div>
                </div>

                {/* 2-column body */}
                <div className="px-6 pb-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left: description + meta + topics */}
                  <div className="md:col-span-2 space-y-4">
                    {repoData.description && (
                      <p
                        className="text-sm text-muted-foreground leading-relaxed border-l-2 pl-3"
                        style={{borderColor: langColor + "50"}}
                      >
                        {repoData.description}
                      </p>
                    )}

                    <div
                      className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 rounded-xl
                                    bg-muted/30 border border-border"
                    >
                      <MetaItem icon={<FileCode size={12} />} label="Language">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{background: langColor}} />
                          {repoData.language || "—"}
                        </span>
                      </MetaItem>
                      <MetaItem icon={<GitBranch size={12} />} label="Branch">
                        <span className="font-mono">{repoData.default_branch}</span>
                      </MetaItem>
                      <MetaItem icon={<Calendar size={12} />} label="Created">
                        {new Date(repoData.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </MetaItem>
                      <MetaItem icon={<Clock size={12} />} label="Updated">
                        {formatDistanceToNow(new Date(repoData.updatedAt), {addSuffix: true})}
                      </MetaItem>
                    </div>

                    {repoData.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {repoData.topics.map((topic) => (
                          <a
                            key={topic}
                            href={`https://github.com/topics/${topic}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full
                                       text-[11px] font-mono font-medium
                                       bg-github-blue/8 text-github-blue border border-github-blue/20
                                       dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/40
                                       hover:bg-github-blue/15 transition-colors"
                          >
                            #{topic}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: stats + health */}
                  <div
                    className="flex flex-col gap-4 p-4 rounded-xl
                                  bg-muted/30 border border-border"
                  >
                    <StatRow
                      icon={<Star size={16} className="text-yellow-500" />}
                      value={fmtStat(repoData.stars)}
                      label="Stars"
                      accent="bg-yellow-50 dark:bg-yellow-900/20"
                    />
                    <StatRow
                      icon={<GitFork size={16} className="text-github-blue" />}
                      value={fmtStat(repoData.forks)}
                      label="Forks"
                      accent="bg-blue-50 dark:bg-blue-900/20"
                    />
                    <StatRow
                      icon={<Eye size={16} className="text-purple-500" />}
                      value={fmtStat(repoData.watchers)}
                      label="Watchers"
                      accent="bg-purple-50 dark:bg-purple-900/20"
                    />
                    {/* Health bar */}
                    <div className="pt-3 border-t border-border">
                      {(() => {
                        const daysSince =
                          (Date.now() - new Date(repoData.updatedAt).getTime()) / 86_400_000;
                        const score = Math.min(
                          Math.round(
                            (repoData.stars > 0 ? Math.min(repoData.stars / 1000, 1) * 25 : 0) +
                              (repoData.forks > 0 ? Math.min(repoData.forks / 500, 1) * 20 : 0) +
                              (repoData.watchers > 0
                                ? Math.min(repoData.watchers / 200, 1) * 15
                                : 0) +
                              (repoData.topics.length > 0 ? 10 : 0) +
                              (daysSince < 30 ? 20 : 0) +
                              (repoData.description?.length > 50 ? 10 : 0),
                          ),
                          100,
                        );
                        const color = score >= 80 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444";
                        const label =
                          score >= 80 ? "Healthy" : score >= 50 ? "Moderate" : "Needs attention";
                        return (
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                                Health
                              </span>
                              <span className="text-[10px] font-mono font-semibold" style={{color}}>
                                {score}% · {label}
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{width: `${score}%`, background: color}}
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-border flex items-center justify-between">
                  <a
                    href={repoData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-github-blue hover:underline font-medium"
                  >
                    <ExternalLink size={12} />
                    View on GitHub
                  </a>
                  <span className="font-mono text-[10px] text-muted-foreground/50">
                    {repoData.fullName}
                  </span>
                </div>
              </div>

              {/* Login wall overlay */}
              {showLoginWall && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-background border border-border rounded-xl shadow-lg p-6 max-w-xs w-full mx-4 text-center">
                    <Info size={20} className="text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-sm font-semibold mb-2">Analysis limit reached</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Sign in to continue analysing repositories without limits.
                    </p>
                    <button
                      onClick={handleSignIn}
                      className="text-xs text-github-blue hover:underline font-medium"
                    >
                      Sign in with GitHub →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {repoData && (
        <ShareQRCodeModal
          isOpen={isQROpen}
          onClose={() => setIsQROpen(false)}
          repoName={repoData.name}
        />
      )}
    </>
  );
}
