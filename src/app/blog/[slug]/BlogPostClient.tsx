"use client";

import {useEffect, useMemo, useRef, useState, type TouchEvent} from "react";
import {useParams, useRouter} from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Copy,
  Linkedin,
  Twitter,
  User,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import BookmarkButton from "@/components/blog/BookmarkButton";
import Header from "@/components/Header";
import ReadingProgress from "@/components/blog/ReadingProgress";
import MarkdownRenderer from "@/components/blog/MarkdownRenderer";
import TableOfContents from "@/components/blog/TableOfContents";
import RelatedPosts from "@/components/blog/RelatedPosts";
import ViewCounter from "@/components/blog/ViewCounter";
import GiscusComments from "@/components/blog/GiscusComments";
import {getAllBlogPosts, getBlogPostBySlug} from "@/services/blog";
import {BlogPostDetail, BlogPostFrontMatter} from "@/lib/types";
import {useTheme} from "next-themes";
import {Skeleton} from "@/components/ui/skeleton";
import {cn} from "@/lib/utils";

const SWIPE_THRESHOLD = 80;
const PANEL_REST_WIDTH = 20; // px — chevron peek at rest
const PANEL_MAX_WIDTH = 154; // px — fully expanded

/* ── Loading skeleton ───────────────────────────────────────── */
function PostSkeleton() {
  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-10 animate-pulse-subtle">
      <Skeleton className="h-4 w-24 mb-8" />
      <Skeleton className="h-[240px] sm:h-[360px] lg:h-[420px] rounded-2xl mb-8" />
      <div className="max-w-5xl">
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-10 w-4/5 max-w-4xl mb-3" />
        <Skeleton className="h-10 w-3/5 max-w-3xl mb-6" />
        <div className="flex gap-4 mb-8">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-full max-w-5xl mb-2" />
        <Skeleton className="h-4 w-full max-w-5xl mb-2" />
        <Skeleton className="h-4 w-3/4 max-w-4xl mb-2" />
      </div>
    </div>
  );
}

/* ── Swipe navigation edge panels ──────────────────────────── */
function SwipeNavOverlay({
  previousPost,
  nextPost,
  swipeDelta,
}: {
  previousPost: BlogPostFrontMatter | null;
  nextPost: BlogPostFrontMatter | null;
  swipeDelta: number;
}) {
  if (!previousPost && !nextPost) return null;

  const progress = Math.min(Math.abs(swipeDelta) / SWIPE_THRESHOLD, 1);
  const isSwipingRight = swipeDelta > 12 && !!previousPost;
  const isSwipingLeft = swipeDelta < -12 && !!nextPost;

  const leftWidth = isSwipingRight
    ? PANEL_REST_WIDTH + Math.round(progress * (PANEL_MAX_WIDTH - PANEL_REST_WIDTH))
    : PANEL_REST_WIDTH;

  const rightWidth = isSwipingLeft
    ? PANEL_REST_WIDTH + Math.round(progress * (PANEL_MAX_WIDTH - PANEL_REST_WIDTH))
    : PANEL_REST_WIDTH;

  const edgePanel =
    "flex items-center h-full bg-white/95 dark:bg-[#0d1117]/95 " +
    "border-y shadow-xl overflow-hidden";

  return (
    <div className="lg:hidden fixed inset-0 z-40 pointer-events-none" aria-hidden>
      {/* ── Left edge — previous post ──────────────────── */}
      {previousPost && (
        <>
          <div
            className="absolute left-0 top-0 h-full overflow-hidden"
            style={{
              width: `${leftWidth}px`,
              opacity: isSwipingRight ? 0.35 + progress * 0.6 : 0.4,
              transition: isSwipingRight ? "none" : "width 0.35s ease, opacity 0.35s ease",
            }}
          >
            <div
              className={cn(
                edgePanel,
                "gap-1.5 px-1.5 rounded-r-2xl border-r border-gray-200 dark:border-gray-700/80",
              )}
            >
              <ChevronLeft size={14} className="shrink-0 text-github-blue" />
              {isSwipingRight && progress > 0.38 && (
                <span className="text-[10px] font-semibold text-foreground line-clamp-4 leading-tight">
                  {previousPost.title}
                </span>
              )}
            </div>
          </div>
          {isSwipingRight && (
            <div
              className="absolute inset-y-0 left-0 w-24"
              style={{
                background: `linear-gradient(to right, rgba(59,130,246,${(progress * 0.1).toFixed(2)}), transparent)`,
              }}
            />
          )}
        </>
      )}

      {/* ── Right edge — next post ─────────────────────── */}
      {nextPost && (
        <>
          <div
            className="absolute right-0 top-0 h-full overflow-hidden"
            style={{
              width: `${rightWidth}px`,
              opacity: isSwipingLeft ? 0.35 + progress * 0.6 : 0.4,
              transition: isSwipingLeft ? "none" : "width 0.35s ease, opacity 0.35s ease",
            }}
          >
            <div
              className={cn(
                edgePanel,
                "justify-end gap-1.5 px-1.5 rounded-l-2xl border-l border-gray-200 dark:border-gray-700/80",
              )}
            >
              {isSwipingLeft && progress > 0.38 && (
                <span className="text-[10px] font-semibold text-foreground line-clamp-4 leading-tight text-right">
                  {nextPost.title}
                </span>
              )}
              <ChevronRight size={14} className="shrink-0 text-github-blue" />
            </div>
          </div>
          {isSwipingLeft && (
            <div
              className="absolute inset-y-0 right-0 w-24"
              style={{
                background: `linear-gradient(to left, rgba(59,130,246,${(progress * 0.1).toFixed(2)}), transparent)`,
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

/* ── One-time swipe discoverability hint ──────────────────── */
function SwipeHint({
  previousPost,
  nextPost,
  visible,
}: {
  previousPost: BlogPostFrontMatter | null;
  nextPost: BlogPostFrontMatter | null;
  visible: boolean;
}) {
  if (!previousPost && !nextPost) return null;

  return (
    <div
      className={cn(
        "fixed bottom-24 inset-x-0 flex justify-center z-50 lg:hidden pointer-events-none",
        "transition-all duration-500 ease-in-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
      )}
      aria-hidden
    >
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full
                   bg-gray-900/85 dark:bg-gray-800/90 text-white
                   text-[11px] font-medium shadow-xl backdrop-blur-sm
                   border border-white/10"
      >
        {previousPost && <ChevronLeft size={11} />}
        <span>Swipe to navigate</span>
        {nextPost && <ChevronRight size={11} />}
      </div>
    </div>
  );
}

/* ── Blog post interactive client component ─────────────────── */
export default function BlogPostClient() {
  const {slug} = useParams() as {slug: string};
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPostFrontMatter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageUrl, setPageUrl] = useState("");
  const [tocOpen, setTocOpen] = useState(false);
  const [swipeDelta, setSwipeDelta] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const touchStart = useRef<{x: number; y: number} | null>(null);
  const {theme} = useTheme();
  const isDarkMode = theme === "dark";

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    (async () => {
      const [fetchedPost, postsRes] = await Promise.all([
        getBlogPostBySlug(slug),
        getAllBlogPosts(1, 1000),
      ]);
      setPost(fetchedPost);
      setAllPosts(postsRes.posts);
      setIsLoading(false);
    })();
  }, [slug]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pageUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const {previousPost, nextPost} = useMemo(() => {
    const index = allPosts.findIndex((item) => item.slug === slug);
    return {
      previousPost: index > 0 ? allPosts[index - 1] : null,
      nextPost: index >= 0 && index < allPosts.length - 1 ? allPosts[index + 1] : null,
    };
  }, [allPosts, slug]);

  /* Show swipe hint once per session when adjacent posts exist */
  useEffect(() => {
    if (!post || (!previousPost && !nextPost)) return;
    if (typeof window !== "undefined" && sessionStorage.getItem("blog-swipe-hint-seen")) return;
    const showId = setTimeout(() => setShowSwipeHint(true), 1200);
    const hideId = setTimeout(() => {
      setShowSwipeHint(false);
      sessionStorage.setItem("blog-swipe-hint-seen", "1");
    }, 4700);
    return () => {
      clearTimeout(showId);
      clearTimeout(hideId);
    };
  }, [post, previousPost, nextPost]);

  const goToPost = (targetSlug?: string) => {
    if (targetSlug) router.push(`/blog/${targetSlug}`);
  };

  const isSwipeSafeTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return true;
    return !target.closest("a,button,input,textarea,select,pre,code,table,.giscus");
  };

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    if (!isSwipeSafeTarget(event.target)) return;
    const touch = event.touches[0];
    touchStart.current = {x: touch.clientX, y: touch.clientY};
  };

  const handleTouchMove = (event: TouchEvent<HTMLElement>) => {
    if (!touchStart.current || !isSwipeSafeTarget(event.target)) return;
    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    if (Math.abs(deltaX) > Math.abs(deltaY) * 0.8) {
      setSwipeDelta(deltaX);
    } else if (Math.abs(deltaY) > 16) {
      setSwipeDelta(0);
    }
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (!touchStart.current || !isSwipeSafeTarget(event.target)) {
      touchStart.current = null;
      setSwipeDelta(0);
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    touchStart.current = null;
    setSwipeDelta(0);
    setShowSwipeHint(false);

    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY) * 1.4) return;

    if (deltaX < 0) goToPost(nextPost?.slug);
    if (deltaX > 0) goToPost(previousPost?.slug);
  };

  /* ── Loading ────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <ReadingProgress />
        <Header />
        <PostSkeleton />
      </div>
    );
  }

  /* ── Not found ──────────────────────────────────────────── */
  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4 animate-fade-in">
            <p className="font-mono text-xs text-muted-foreground mb-3 uppercase tracking-widest">
              404
            </p>
            <h1 className="text-3xl font-bold text-foreground mb-3">Post not found</h1>
            <p className="text-muted-foreground mb-6 text-sm">
              This article doesn&apos;t exist or may have been moved.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-github-blue hover:underline font-medium"
            >
              <ArrowLeft size={14} />
              Back to Blog
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const formattedDate = new Date(post.created).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <ReadingProgress />
      <Header />

      <SwipeNavOverlay previousPost={previousPost} nextPost={nextPost} swipeDelta={swipeDelta} />

      <SwipeHint previousPost={previousPost} nextPost={nextPost} visible={showSwipeHint} />

      <main
        className="flex-1 w-full min-w-0"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 2xl:px-12 py-6 sm:py-8 lg:py-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground
                       hover:text-github-blue transition-colors mb-6 sm:mb-8 font-mono"
          >
            <ArrowLeft size={13} />
            Blog
          </Link>

          <div className="flex w-full min-w-0 flex-col lg:flex-row gap-8 lg:gap-10 xl:gap-14 2xl:gap-16 items-start">
            <article className="w-full flex-1 min-w-0 max-w-none lg:max-w-[calc(100%-15rem)] xl:max-w-[calc(100%-18rem)]">
              {post.coverImage && (
                <div className="relative h-44 min-[420px]:h-56 sm:h-72 md:h-80 lg:h-[420px] 2xl:h-[480px] rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8 shadow-md">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              )}

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <a
                      key={tag}
                      href={`/blog?category=${encodeURIComponent(tag)}`}
                      className="inline-flex max-w-full items-center px-2.5 py-0.5 rounded-full text-[11px]
                                 font-mono font-medium
                                 bg-github-blue/8 text-github-blue border border-github-blue/20
                                 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/40
                                 hover:bg-github-blue/15 transition-colors break-all"
                    >
                      #{tag}
                    </a>
                  ))}
                </div>
              )}

              <h1
                className="font-display text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-bold
                             text-foreground leading-[1.12] tracking-tight mb-5 break-words"
              >
                {post.title}
              </h1>

              <div
                className="flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-2
                              text-xs text-muted-foreground font-mono pb-5 mb-5
                              border-b border-border"
              >
                {post.author && (
                  <span className="flex min-w-0 items-center gap-1.5">
                    <User size={12} />
                    <span className="truncate">{post.author}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  {formattedDate}
                </span>
                {post.readTimeMinutes && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} />
                    {post.readTimeMinutes} min read
                  </span>
                )}
                <ViewCounter slug={post.slug} />
              </div>

              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-8">
                <span className="w-full text-xs text-muted-foreground sm:w-auto">Share:</span>
                <button
                  onClick={handleCopy}
                  className="w-8 h-8 flex items-center justify-center rounded-lg
                             border border-border hover:border-github-blue/40
                             hover:bg-github-blue/5 transition-all"
                  title="Copy link"
                >
                  {copied ? (
                    <Check size={13} className="text-green-500" />
                  ) : (
                    <Copy size={13} className="text-muted-foreground" />
                  )}
                </button>
                {pageUrl && (
                  <>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(pageUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center rounded-lg
                                 border border-border hover:border-github-blue/40
                                 hover:bg-github-blue/5 transition-all"
                      title="Share on Twitter"
                    >
                      <Twitter size={13} className="text-muted-foreground" />
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center rounded-lg
                                 border border-border hover:border-github-blue/40
                                 hover:bg-github-blue/5 transition-all"
                      title="Share on LinkedIn"
                    >
                      <Linkedin size={13} className="text-muted-foreground" />
                    </a>
                  </>
                )}
                <BookmarkButton slug={post.slug} title={post.title} className="h-8 text-xs" />
              </div>

              <div className="lg:hidden mb-6">
                <button
                  onClick={() => setTocOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl
                             border border-border bg-muted/30 text-sm font-medium"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen size={14} className="text-github-blue" />
                    Table of Contents
                  </span>
                  <span className="text-muted-foreground text-xs">{tocOpen ? "Hide" : "Show"}</span>
                </button>
                {tocOpen && (
                  <div className="mt-1 border border-border rounded-xl overflow-hidden">
                    <TableOfContents content={post.body} className="static" />
                  </div>
                )}
              </div>

              <div className="w-full min-w-0 max-w-full">
                <MarkdownRenderer content={post.body} isDarkMode={isDarkMode} />
              </div>

              {(previousPost || nextPost) && (
                <nav
                  aria-label="Blog post navigation"
                  className="mt-12 grid grid-cols-1 gap-3 border-t border-border pt-8 sm:grid-cols-2"
                >
                  {previousPost ? (
                    <Link
                      href={`/blog/${previousPost.slug}`}
                      className="group flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-github-blue/40 hover:shadow-md"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:text-github-blue">
                        <ChevronLeft size={18} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                          Previous
                        </span>
                        <span className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-github-blue">
                          {previousPost.title}
                        </span>
                      </span>
                    </Link>
                  ) : (
                    <span />
                  )}

                  {nextPost && (
                    <Link
                      href={`/blog/${nextPost.slug}`}
                      className="group flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 text-right transition-all hover:border-github-blue/40 hover:shadow-md"
                    >
                      <span className="min-w-0">
                        <span className="block text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                          Next
                        </span>
                        <span className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-github-blue">
                          {nextPost.title}
                        </span>
                      </span>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:text-github-blue">
                        <ChevronRight size={18} />
                      </span>
                    </Link>
                  )}
                </nav>
              )}

              {post.related.length > 0 && (
                <div className="mt-12 pt-8 border-t border-border">
                  <RelatedPosts posts={post.related} />
                </div>
              )}

              <section className="mt-12 pt-8 border-t border-border">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-5">
                  Discussion
                </p>
                <GiscusComments slug={post.slug} />
              </section>

              <div className="mt-12 pt-6 border-t border-border">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 text-sm text-github-blue hover:underline font-medium"
                >
                  <ArrowLeft size={14} />
                  Back to all posts
                </Link>
              </div>
            </article>

            <aside className="hidden lg:block w-56 xl:w-64 2xl:w-72 shrink-0">
              <TableOfContents content={post.body} />
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
