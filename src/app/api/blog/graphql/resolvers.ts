import {unstable_cache} from "next/cache";
import {getBlogPosts, rankPosts} from "@/lib/mdx";
import {BlogPostDetail} from "@/lib/types";

const getCachedPosts = unstable_cache(async () => getBlogPosts(), ["all-blog-posts"], {
  revalidate: 60, // ISR: regenerate every 60s
  tags: ["blog"],
});

export const getSearchIndex = unstable_cache(
  async (posts: BlogPostDetail[], query: string) => rankPosts(posts, query),
  ["blog-search-index"],
  {revalidate: 3600},
);

export const resolvers = {
  Query: {
    blogs: async (
      _: unknown,
      {query = "", page = 1, count = 10}: {query?: string; page?: number; count?: number},
    ) => {
      let posts = await getCachedPosts();

      if (query) {
        // posts = await getSearchIndex(posts, query);
        posts = await rankPosts(posts, query);
      }

      const start = (page - 1) * count;
      const paginated = posts.slice(start, start + count);

      return {
        posts: paginated,
        total: posts.length,
        page,
        count,
      };
    },

    blog: async (_: unknown, {slug}: {slug: string}) => {
      const posts = await getCachedPosts();
      return posts.find((p) => p.slug === slug) || null;
    },
  },
};
