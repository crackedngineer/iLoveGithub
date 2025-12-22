"use client";

import {useMemo} from "react";
import {notFound} from "next/navigation";
import Link from "next/link";
import {ArrowLeft, Calendar, Check, Clock, Copy, Linkedin, Twitter, User} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import SEOHead from "@/components/blog/SeoHead";
import Header from "@/components/Header";
import ReadingProgress from "@/components/blog/ReadingProgress";
import {BlogPostDetail, BlogPostFrontMatter} from "@/lib/types";
import {fullRootDomain} from "@/lib/utils";

// Fetch all posts (adjust the path as needed)
async function getAllPosts(): Promise<BlogPostFrontMatter[]> {
  const res = await fetch(`${fullRootDomain}/api/blog`, {cache: "force-cache"});
  const data = await res.json();
  return data.posts;
}

// Fetch a single post by slug
async function getPost(
  slug: string,
): Promise<{frontMatter: BlogPostDetail; contentHtml: string} | null> {
  const res = await fetch(`${fullRootDomain}/api/blog/${slug}`, {cache: "force-cache"});
  if (!res.ok) return null;
  return res.json();
}

// Generate static params for all slugs
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({slug: post.slug}));
}

export default async function BlogPost(
  props: {params: {slug: string}} | Promise<{params: {slug: string}}>,
) {
  const {params} = await props;
  const post = await getPost(params.slug);
  const allPosts = await getAllPosts();

  if (!post) notFound();

  // Related posts logic
  let relatedPosts = allPosts
    .filter((p) => p.slug !== params.slug)
    .filter((p) => {
      if (post.frontMatter.tags && p.tags) {
        return p.tags.some((tag: string) => post.frontMatter.tags?.includes(tag));
      }
      return false;
    })
    .slice(0, 3);

  if (relatedPosts.length < 3) {
    const recentPosts = allPosts
      .filter((p) => p.slug !== params.slug)
      .filter((p) => !relatedPosts.some((rp) => rp.slug === p.slug))
      .slice(0, 3 - relatedPosts.length);

    relatedPosts = [...relatedPosts, ...recentPosts];
  }

  const seriesInfo = useMemo(() => {
    return slug ? getSeriesInfo(slug) : null;
  }, [slug]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={post.frontMatter.title}
        description={post.frontMatter.description}
        image={post.frontMatter.coverImage || undefined}
        type="article"
        author={post.frontMatter.author}
        publishedTime={post.frontMatter.created}
        tags={post.frontMatter.tags}
      />
      <ReadingProgress />
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12">
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-primary hover:underline mb-8 animate-fade-in"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        <div className="flex gap-8">
          {/* Main Content */}
          <article className="flex-1 max-w-4xl animate-fade-in">
            {/* Series Badge */}
            {seriesInfo && (
              <div className="mb-4">
                <Badge variant="outline" className="text-primary border-primary">
                  {seriesInfo.name} • Part {seriesInfo.currentIndex + 1} of {seriesInfo.total}
                </Badge>
              </div>
            )}

            {/* Cover Image */}
            {post.coverImage && (
              <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8 shadow-lg">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}

            {/* Header */}
            <header className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                {post.frontMatter.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-muted-foreground border-b border-border pb-6">
                <Link
                  href={`/author/${encodeURIComponent(post.frontMatter.author)}`}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <User className="h-5 w-5" />
                  {post.frontMatter.author}
                </Link>
                <span className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {new Date(post.frontMatter.created).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {post.frontMatter.readTime}
                </span>
                {/* <ViewCounter slug={post.slug} trackView /> */}
              </div>

              {/* Share Buttons, Bookmark & Theme Selector */}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Share:</span>
                  <Button variant="outline" size="sm" className="h-9 w-9 p-0" onClick={handleShare}>
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="outline" size="sm" className="h-9 w-9 p-0" asChild>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="h-9 w-9 p-0" asChild>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </Button>
                  <BookmarkButton slug={post.slug} title={post.frontMatter.title} />
                </div>

                {/* <CodeThemeSelector value={codeTheme} onChange={setCodeTheme} /> */}
              </div>
            </header>

            {/* Series Navigation (Top) */}
            {seriesInfo && (
              <div className="mb-8">
                <SeriesNavigation series={seriesInfo} />
              </div>
            )}

            {/* Content */}
            <div className="bg-card rounded-xl shadow-lg p-6 md:p-10 border border-border">
              <MarkdownRenderer
                content={post.content}
                isDarkMode={isDarkMode}
                codeTheme={codeTheme}
              />
            </div>

            {/* Series Navigation (Bottom) */}
            {seriesInfo && (
              <div className="mt-8">
                <SeriesNavigation series={seriesInfo} />
              </div>
            )}

            {/* Newsletter */}
            <div className="mt-8">
              <NewsletterSubscribe />
            </div>

            {/* Related Posts */}
            <div className="bg-card rounded-xl shadow-lg p-6 md:p-10 mt-8 border border-border">
              <RelatedPosts currentSlug={post.slug} currentTags={post.tags} />
            </div>

            {/* GitHub Comments Section */}
            <div className="bg-card rounded-xl shadow-lg p-6 md:p-10 mt-8 border border-border">
              <GiscusComments postId={post.slug} postTitle={post.title} />
            </div>
          </article>

          {/* Table of Contents Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <TableOfContents content={post.content} />
          </aside>
        </div>
      </main>
    </div>
  );
}
