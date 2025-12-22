import {getFileBySlug} from "@/lib/mdx";
import {NextResponse} from "next/server";
import path from "path";

export async function GET(request: Request, context: {params: {slug: string}}) {
  try {
    const {params} = context;
    console.log("Fetching blog post with slug:", params);
    const slug = params.slug;
    const mdxpath = path.join("blog", "posts");
    const posts = await getFileBySlug(mdxpath, slug);
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json({error: "Failed to fetch blog post"}, {status: 500});
  }
}
