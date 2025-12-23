import type {BlogPostDetail} from "@/lib/types";
import {fullRootDomain} from "./utils";
import MiniSearch from "minisearch";

let miniSearch: MiniSearch | null = null;

const BLOG_INDEX_URL = `${fullRootDomain}/blog.index.json`;
const BLOG_SEARCH_URL = `${fullRootDomain}/blog.search.json`;

export async function getBlogPosts(): Promise<BlogPostDetail[]> {
  const res = await fetch(BLOG_INDEX_URL, {
    next: {
      revalidate: 60,
      tags: ["blog"],
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load blog index");
  }

  return res.json();
}

export async function getBlogBySlug(slug: string) {
  const posts = await getBlogPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function rankPosts(posts: BlogPostDetail[], query: string) {
  const q = query.toLowerCase();
  if (!miniSearch) {
    const res = await fetch(BLOG_SEARCH_URL, {
      next: {
        revalidate: 3600,
        tags: ["blog"],
      },
    });
    const data = await res.json();
    miniSearch = MiniSearch.loadJSON(JSON.stringify(data), {
      fields: ["title", "description", "tags", "body"],
      idField: "slug",
    });
  }

  const results = miniSearch.search(q, {prefix: true});

  const postMap = new Map(posts.map((p) => [p.slug, p]));

  return results.map((r) => postMap.get(r.id)).filter(Boolean) as BlogPostDetail[];
}
