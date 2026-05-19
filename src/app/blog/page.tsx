"use client";

import React, {useState, useEffect, useMemo, useRef} from "react";
import AppLayout from "@/components/AppLayout";
import {getAllBlogPosts} from "@/services/blog";
import {Search, ChevronLeft, ChevronRight, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";
import BlogListItem from "@/components/blog/BlogListItem";
import BlogListSkeleton from "@/components/blog/BlogListSkeleton";
import RssFeedButton from "@/components/blog/RssFeedButton";
import type {BlogPostFrontMatter} from "@/lib/types";

const POSTS_PER_PAGE = 7;

function useBlogPosts(page: number, q: string, category: string) {
  const [data, setData] = useState<{posts: BlogPostFrontMatter[]; total: number}>({
    posts: [],
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAllBlogPosts(page, POSTS_PER_PAGE, q, category || null).then((res) => {
      setData({posts: res.posts, total: res.total ?? 0});
      setLoading(false);
    });
  }, [page, q, category]);

  return {...data, loading};
}

function buildHref(page: number, q: string, category: string) {
  const p = new URLSearchParams();
  if (page > 1) p.set("page", String(page));
  if (q) p.set("q", q);
  if (category) p.set("category", category);
  const qs = p.toString();
  return `/blog${qs ? `?${qs}` : ""}`;
}

const BlogPostList: React.FC<{page: number; q: string; category: string}> = ({
  page,
  q,
  category,
}) => {
  const {posts, total, loading} = useBlogPosts(page, q, category);
  const totalPages = useMemo(() => Math.ceil(total / POSTS_PER_PAGE), [total]);

  if (loading) return <BlogListSkeleton />;

  if (!posts.length)
    return (
      <div className="text-center py-16 animate-fade-in">
        <Search size={32} className="mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-sm font-medium text-foreground mb-1">No articles found</p>
        <p className="text-xs text-muted-foreground">
          {q && `No results for "${q}". `}
          {category && `No posts in "${category}". `}
          Try a different search.
        </p>
      </div>
    );

  return (
    <>
      <div className="divide-y divide-border/40">
        {posts.map((post, i) => (
          <div
            key={post.slug}
            className="animate-fade-in"
            style={{animationDelay: `${(i + 1) * 50}ms`}}
          >
            <BlogListItem post={post} />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12 animate-fade-in">
          <Button variant="outline" size="sm" asChild disabled={page === 1} className="gap-1.5 h-9">
            <a href={buildHref(page - 1, q, category)}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </a>
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({length: totalPages}, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={buildHref(p, q, category)}
                className={cn(
                  "w-9 h-9 rounded-lg text-sm font-medium transition-all flex items-center justify-center",
                  page === p
                    ? "bg-github-blue text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {p}
              </a>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            asChild
            disabled={page === totalPages}
            className="gap-1.5 h-9"
          >
            <a href={buildHref(page + 1, q, category)}>
              Next
              <ChevronRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      )}
    </>
  );
};

function getSearchParams() {
  if (typeof window === "undefined") return {page: 1, q: "", category: ""};
  const p = new URLSearchParams(window.location.search);
  return {
    page: Number(p.get("page")) || 1,
    q: p.get("q") || "",
    category: p.get("category") || "",
  };
}

export default function Blog() {
  const [{page, q, category}, setParams] = useState(getSearchParams);
  const [searchValue, setSearchValue] = useState(q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const onPop = () => setParams(getSearchParams());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const p = new URLSearchParams(window.location.search);
      if (value) p.set("q", value);
      else p.delete("q");
      p.delete("page");
      const qs = p.toString();
      window.history.pushState({}, "", `/blog${qs ? `?${qs}` : ""}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }, 400);
  };

  return (
    <AppLayout>
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8">
        {/* ── Hero ──────────────────────────────────────── */}
        <div className="text-center mb-10 animate-fade-in">
          <p
            className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em]
                         uppercase text-github-blue dark:text-blue-400 mb-3"
          >
            <span className="w-6 h-px bg-current opacity-60" />
            iLoveGithub
            <span className="w-6 h-px bg-current opacity-60" />
          </p>

          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight leading-tight mb-3">
            <span className="text-foreground">Engineering </span>
            <span className="bg-gradient-to-r from-github-blue to-github-green bg-clip-text text-transparent">
              Blog
            </span>
          </h1>

          <p className="text-sm sm:text-base xl:text-lg text-muted-foreground max-w-2xl mx-auto mb-5">
            Insights, tutorials, and best practices for modern development
          </p>

          <div className="flex items-center justify-center mb-6">
            <RssFeedButton />
          </div>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              type="search"
              placeholder="Search articles…"
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 pr-9 h-11 focus-visible:ring-github-blue/40"
            />
            {searchValue && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── Post list ─────────────────────────────────── */}
        <div className="max-w-5xl mx-auto">
          <BlogPostList page={page} q={q} category={category} />
        </div>
      </div>
    </AppLayout>
  );
}
