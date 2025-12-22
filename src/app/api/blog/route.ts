import path from "path";
import {NextRequest, NextResponse} from "next/server";
import {getAllFilesFrontMatter} from "@/lib/mdx";

export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url);

    // Pagination
    const query = searchParams.get("query") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const count = parseInt(searchParams.get("count") || "10", 10);

    const mdxpath = path.join("blog", "posts");
    let posts = await getAllFilesFrontMatter(mdxpath);

    // Filter by search query
    if (query) {
      const lowerCaseQuery = query.toLowerCase();
      posts = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(lowerCaseQuery) ||
          post.description?.toLowerCase().includes(lowerCaseQuery) ||
          post.tags?.some((tag) => tag.toLowerCase().includes(lowerCaseQuery)),
      );
    }

    // Pagination logic
    const start = (page - 1) * count;
    const paginatedPosts = posts.slice(start, start + count);

    return NextResponse.json({
      posts: paginatedPosts,
      total: posts.length,
      page,
      count,
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json({error: "Failed to fetch blog posts"}, {status: 500});
  }
}
