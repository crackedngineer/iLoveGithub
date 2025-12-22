import AppLayout from "@/components/AppLayout";
import {getAllBlogPosts} from "@/services/blog";
import {Search, ChevronLeft, ChevronRight} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";
import BlogListItem from "@/components/blog/BlogListItem";
import {Suspense} from "react";
import BlogListSkeleton from "@/components/blog/BlogListSkeleton";

const POSTS_PER_PAGE = 7;

type BlogPageProps = {
  searchParams?: Promise<{
    page?: string;
    q?: string;
    category?: string;
  }>;
};

// Static params for pagination
export async function generateStaticParams() {
  // Fetch total number of posts to determine number of pages
  const allPosts = await getAllBlogPosts(1, POSTS_PER_PAGE, "", null);
  const totalPages = Math.ceil((allPosts.total ?? 0) / POSTS_PER_PAGE);

  return Array.from({length: totalPages}, (_, i) => ({page: (i + 1).toString()}));
}

const BlogItemsContent = async ({
  page,
  q,
  category,
}: {
  page: number;
  q?: string;
  category?: string;
}) => {
  const posts = await getAllBlogPosts(page, POSTS_PER_PAGE, q, category || null);
  const totalPages = Math.ceil((posts.total ?? 0) / POSTS_PER_PAGE);
  const categories = new Set<string>();
  posts.posts.forEach((post) => {
    post.tags.forEach((tag) => categories.add(tag));
  });
  return (
    <>
      {posts.posts && posts.posts.length > 0 ? (
        <>
          <div className="divide-y divide-border/50">
            {posts.posts.map((post, index) => (
              <div
                key={post.slug}
                className="animate-fade-in"
                style={{animationDelay: `${(index + 1) * 50}ms`}}
              >
                <BlogListItem post={post} />
              </div>
            ))}
          </div>
          {/* Pagination */}
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
      ) : (
        <div className="text-center py-12 animate-fade-in">
          <p className="text-muted-foreground">
            No articles found{q && ` matching "${q}"`}
            {category && ` in "${category}"`}
          </p>
        </div>
      )}
    </>
  );
};

export default async function Blog({searchParams}: BlogPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;
  const q = resolvedSearchParams?.q || "";
  const category = resolvedSearchParams?.category || "";

  return (
    <AppLayout>
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main Content */}
            <div className="flex-1 max-w-4xl">
              {/* Hero Section */}
              <div className="text-center mb-12 animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-github-blue to-github-green bg-clip-text text-transparent pt-6 pb-4">
                  Engineering Blog
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-4">
                  Insights, tutorials, and best practices for modern development
                </p>
                {/* Search */}
                <form
                  className="relative max-w-md mx-auto mb-6 animate-fade-in"
                  style={{animationDelay: "50ms"}}
                  action="/blog"
                  method="get"
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    name="q"
                    placeholder="Search articles..."
                    defaultValue={q}
                    className="pl-10 bg-background border-border focus:border-primary transition-colors"
                  />
                </form>
              </div>
              {/* Blog Posts List */}
              <Suspense fallback={<BlogListSkeleton />}>
                <BlogItemsContent page={page} q={q} category={category} />
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
