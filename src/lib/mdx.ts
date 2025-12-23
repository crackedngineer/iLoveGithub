import type {BlogPostDetail} from "@/lib/types";
import MiniSearch from "minisearch";
import RelatedPosts from "../../public/blog.related.json";
import BlogList from "../../public/blog.index.json";
import BlogSearch from "../../public/blog.search.json";

let miniSearch: MiniSearch | null = null;

export function getBlogPosts(): BlogPostDetail[] {
  return BlogList as BlogPostDetail[];
}

export function getBlogBySlug(slug: string) {
  return BlogList.find((p) => p.slug === slug) ?? null;
}

export function rankPosts(posts: BlogPostDetail[], query: string) {
  const q = query.toLowerCase();
  if (!miniSearch) {
    miniSearch = MiniSearch.loadJSON(JSON.stringify(BlogSearch), {
      fields: ["title", "description", "tags", "body"],
      idField: "slug",
    });
  }

  const results = miniSearch.search(q, {prefix: true});

  const postMap = new Map(posts.map((p) => [p.slug, p]));

  return results.map((r) => postMap.get(r.id)).filter(Boolean) as BlogPostDetail[];
}

export function getRelatedSlugs(slug: string, limit = 3): string[] {
  return RelatedPosts[slug as keyof typeof RelatedPosts]?.slice(0, limit) ?? [];
}
