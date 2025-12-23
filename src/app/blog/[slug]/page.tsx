"use client";

import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import Link from "next/link";
import {ArrowLeft, Calendar, Check, Clock, Copy, Linkedin, Twitter, User} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import SEOHead from "@/components/blog/SeoHead";
import BookmarkButton from "@/components/blog/BookmarkButton";
import Header from "@/components/Header";
import ReadingProgress from "@/components/blog/ReadingProgress";
import MarkdownRenderer from "@/components/blog/MarkdownRenderer";
import TableOfContents from "@/components/blog/TableOfContents";
import {getAllBlogPosts, getBlogPostBySlug} from "@/services/blog";
import {BlogPostDetail, BlogPostFrontMatter} from "@/lib/types";
import {useTheme} from "next-themes";

export default function BlogPost() {
  const {slug} = useParams() as {slug: string};
  const [copied, setCopied] = useState(false);
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPostFrontMatter[]>([]);
  const {theme} = useTheme();
  const isDarkMode = theme === "dark";

  useEffect(() => {
    (async () => {
      const fetchedPost = await getBlogPostBySlug(slug);
      setPost(fetchedPost);
      const resAllPosts = await getAllBlogPosts(1, 1000).then((res) => res.posts);
      setAllPosts(resAllPosts);
    })();
  }, [slug]);

  // Related posts logic
  let relatedPosts = allPosts
    .filter((p) => p.slug !== slug)
    .filter((p) => {
      if (post?.tags && p.tags) {
        return p.tags.some((tag: string) => post.tags?.includes(tag));
      }
      return false;
    })
    .slice(0, 3);

  if (relatedPosts.length < 3) {
    const recentPosts = allPosts
      .filter((p) => p.slug !== slug)
      .filter((p) => !relatedPosts.some((rp) => rp.slug === p.slug))
      .slice(0, 3 - relatedPosts.length);

    relatedPosts = [...relatedPosts, ...recentPosts];
  }

  const handleShare = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The blog post you are looking for does not exist.
            </p>
            <Button asChild>
              <Link href="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={post.title}
        description={post.description}
        image={post.coverImage || undefined}
        type="article"
        author={post.author}
        publishedTime={post.created}
        tags={post.tags}
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
            {/* {seriesInfo && (
              <div className="mb-4">
                <Badge variant="outline" className="text-primary border-primary">
                  {seriesInfo.name} • Part {seriesInfo.currentIndex + 1} of {seriesInfo.total}
                </Badge>
              </div>
            )} */}

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
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-muted-foreground border-b border-border pb-6">
                <Link
                  href={`/author/${encodeURIComponent(post.author || "unknown")}`}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <User className="h-5 w-5" />
                  {post.author}
                </Link>
                <span className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {new Date(post.created).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {post.readTimeMinutes}
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
                  <BookmarkButton slug={post.slug} title={post.title} />
                </div>

                {/* <CodeThemeSelector value={codeTheme} onChange={setCodeTheme} /> */}
              </div>
            </header>

            {/* Series Navigation (Top) */}
            {/* {seriesInfo && (
              <div className="mb-8">
                <SeriesNavigation series={seriesInfo} />
              </div>
            )} */}

            {/* Content */}
            <div className="bg-card rounded-xl shadow-lg p-6 md:p-10 border border-border">
              <MarkdownRenderer content={post.body} isDarkMode={isDarkMode} />
            </div>

            {/* Series Navigation (Bottom) */}
            {/* {seriesInfo && (
              <div className="mt-8">
                <SeriesNavigation series={seriesInfo} />
              </div>
            )} */}

            {/* Newsletter */}
            {/* <div className="mt-8">
              <NewsletterSubscribe />
            </div> */}

            {/* Related Posts */}
            {/* <div className="bg-card rounded-xl shadow-lg p-6 md:p-10 mt-8 border border-border">
              <RelatedPosts currentSlug={post.slug} currentTags={post.tags} />
            </div> */}

            {/* GitHub Comments Section */}
            {/* <div className="bg-card rounded-xl shadow-lg p-6 md:p-10 mt-8 border border-border">
              <GiscusComments postId={post.slug} postTitle={post.title} />
            </div> */}
          </article>

          {/* Table of Contents Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <TableOfContents content={post.body} />
          </aside>
        </div>
      </main>
    </div>
  );
}
