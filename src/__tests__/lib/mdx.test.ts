// The JSON files are real fixtures in /public — no mocking needed.
// MiniSearch integration is tested through rankPosts.

import {getBlogBySlug, getBlogPosts, getRelatedSlugs, rankPosts} from "@/lib/mdx";

describe("getBlogPosts", () => {
  it("returns an array", () => {
    const posts = getBlogPosts();
    expect(Array.isArray(posts)).toBe(true);
  });

  it("returns BlogPostDetail objects with required fields", () => {
    const posts = getBlogPosts();
    if (posts.length > 0) {
      const post = posts[0];
      expect(post).toHaveProperty("slug");
      expect(post).toHaveProperty("title");
    }
  });
});

describe("getBlogBySlug", () => {
  it("returns the post that matches the given slug", () => {
    const posts = getBlogPosts();
    if (posts.length > 0) {
      const target = posts[0];
      const result = getBlogBySlug(target.slug);
      expect(result?.slug).toBe(target.slug);
    }
  });

  it("returns null when the slug does not exist", () => {
    const result = getBlogBySlug("non-existent-slug-xyz");
    expect(result).toBeNull();
  });
});

describe("rankPosts", () => {
  it("returns an array of blog posts matching the query", () => {
    const posts = getBlogPosts();
    const results = rankPosts(posts, "github");
    expect(Array.isArray(results)).toBe(true);
  });

  it("returns an empty array when the query matches nothing", () => {
    const posts = getBlogPosts();
    const results = rankPosts(posts, "zzzzunlikelytomatchanything12345xyz");
    expect(results).toEqual([]);
  });

  it("returns only posts that are present in the provided posts array", () => {
    const allPosts = getBlogPosts();
    const results = rankPosts(allPosts, "badge");
    results.forEach((post) => {
      expect(allPosts.some((p) => p.slug === post.slug)).toBe(true);
    });
  });

  it("uses the existing MiniSearch instance on a second call (no re-initialisation error)", () => {
    const posts = getBlogPosts();
    // Call twice to exercise the singleton miniSearch branch
    rankPosts(posts, "shields");
    expect(() => rankPosts(posts, "shields")).not.toThrow();
  });
});

describe("getRelatedSlugs", () => {
  it("returns an array of slugs", () => {
    const slugs = getRelatedSlugs("custom-shields-io-badges-guide");
    expect(Array.isArray(slugs)).toBe(true);
  });

  it("returns an empty array for a slug with no related entries", () => {
    const slugs = getRelatedSlugs("totally-unknown-slug");
    expect(slugs).toEqual([]);
  });

  it("respects the limit parameter", () => {
    const posts = getBlogPosts();
    if (posts.length > 0) {
      const slugs = getRelatedSlugs(posts[0].slug, 1);
      expect(slugs.length).toBeLessThanOrEqual(1);
    }
  });

  it("defaults to a limit of 3", () => {
    const posts = getBlogPosts();
    if (posts.length > 0) {
      const slugs = getRelatedSlugs(posts[0].slug);
      expect(slugs.length).toBeLessThanOrEqual(3);
    }
  });
});
