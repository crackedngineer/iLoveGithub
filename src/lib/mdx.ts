import type {BlogPostDetail} from "@/lib/types";
import MiniSearch from "minisearch";
import fs from "fs";
import path from "path";

function readJson<T>(filename: string): T {
  const filePath = path.join(process.cwd(), "public", filename);
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

let miniSearch: MiniSearch | null = null;

export function getBlogPosts(): BlogPostDetail[] {
  return readJson<BlogPostDetail[]>("blog.index.json");
}

export function getBlogBySlug(slug: string) {
  const list = readJson<BlogPostDetail[]>("blog.index.json");
  return list.find((p) => p.slug === slug) ?? null;
}

export function rankPosts(posts: BlogPostDetail[], query: string) {
  const q = query.toLowerCase();
  if (!miniSearch) {
    const searchIndex = readJson<object>("blog.search.json");
    miniSearch = MiniSearch.loadJSON(JSON.stringify(searchIndex), {
      fields: ["title", "description", "tags", "body"],
      idField: "slug",
    });
  }

  const results = miniSearch.search(q, {prefix: true});
  const postMap = new Map(posts.map((p) => [p.slug, p]));
  return results.map((r) => postMap.get(r.id)).filter(Boolean) as BlogPostDetail[];
}

export function getRelatedSlugs(slug: string, limit = 3): string[] {
  const related = readJson<Record<string, string[]>>("blog.related.json");
  return related[slug]?.slice(0, limit) ?? [];
}
