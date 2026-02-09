"use client";

import React, {useState, useEffect, useMemo} from "react";
import AppLayout from "@/components/AppLayout";
import {getAllBlogPosts} from "@/services/blog";
import {Search, ChevronLeft, ChevronRight} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";
import BlogListItem from "@/components/blog/BlogListItem";
import BlogListSkeleton from "@/components/blog/BlogListSkeleton";
import RssFeedButton from "@/components/blog/RssFeedButton";

const POSTS_PER_PAGE = 7;

function useBlogPosts(page: number, q: string, category: string) {
  const [data, setData] = useState<{posts: any[]; total: number}>({posts: [], total: 0});
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

const BlogItemsContent: React.FC<{
  page: number;
  q: string;
  category: string;
}> = ({page, q, category}) => {
  const {posts, total, loading} = useBlogPosts(page, q, category);
  const totalPages = useMemo(() => Math.ceil(total / POSTS_PER_PAGE), [total]);

  if (loading) return <BlogListSkeleton />;

  if (!posts || posts.length === 0)
    return (
      <div className="text-center py-12 animate-fade-in">
        <p className="text-muted-foreground">
          No articles found{q && ` matching "${q}"`}
          {category && ` in "${category}"`}
        </p>
      </div>
    );

  return (
    <>
      <div className="divide-y divide-border/50">
        {posts.map((post, index) => (
          <div
            key={post.slug}
            className="animate-fade-in"
            style={{animationDelay: `${(index + 1) * 50}ms`}}
          >
            <BlogListItem post={post} />
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div
          className="flex items-center justify-center gap-2 mt-12 animate-fade-in"
          style={{animationDelay: "300ms"}}
        >
          <Button variant="outline" size="sm" asChild disabled={page === 1} className="gap-1">
            <a
              href={`/blog?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}${category ? `&category=${encodeURIComponent(category)}` : ""}`}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </a>
          </Button>
          <div className="flex items-center gap-1 px-4">
            {Array.from({length: totalPages}, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={`/blog?page=${p}${q ? `&q=${encodeURIComponent(q)}` : ""}${category ? `&category=${encodeURIComponent(category)}` : ""}`}
                className={cn(
                  "w-8 h-8 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center",
                  page === p
                    ? "bg-primary text-primary-foreground"
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
            className="gap-1"
          >
            <a
              href={`/blog?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}${category ? `&category=${encodeURIComponent(category)}` : ""}`}
            >
              <ChevronRight className="h-4 w-4" />
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
  const params = new URLSearchParams(window.location.search);
  return {
    page: Number(params.get("page")) || 1,
    q: params.get("q") || "",
    category: params.get("category") || "",
  };
}

export default function Blog() {
  const [{page, q, category}, setParams] = useState(getSearchParams());
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const onPopState = () => setParams(getSearchParams());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return (
    <AppLayout>
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1 max-w-4xl">
              <div className="text-center mb-12 animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-github-blue to-github-green bg-clip-text text-transparent pt-6 pb-4">
                  Engineering Blog
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-4">
                  Insights, tutorials, and best practices for modern development
                </p>
                <div className="flex items-center justify-center gap-4 mb-6 sm:mb-8">
                  <RssFeedButton />
                </div>
                <form
                  className="relative max-w-md mx-auto mb-6 animate-fade-in"
                  style={{animationDelay: "50ms"}}
                  action="/blog"
                  method="get"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    name="q"
                    placeholder="Search articles..."
                    defaultValue={q}
                    className="pl-10 bg-background border-border focus:border-primary transition-colors"
                    onChange={(() => {
                      let debounceTimer: NodeJS.Timeout;
                      return (e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value;
                        clearTimeout(debounceTimer);
                        debounceTimer = setTimeout(() => {
                          const params = new URLSearchParams(window.location.search);
                          if (value) {
                            params.set("q", value);
                          } else {
                            params.delete("q");
                          }
                          params.delete("page");
                          window.history.pushState({}, "", `/blog?${params.toString()}`);
                          window.dispatchEvent(new PopStateEvent("popstate"));
                        }, 400);
                      };
                    })()}
                  />
                </form>
              </div>
              <BlogItemsContent page={page} q={q} category={category} />
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
