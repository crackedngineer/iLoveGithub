// Mock the three public JSON fixtures that mdx.ts imports at the module level.
// { virtual: true } creates the module in Jest's registry without needing the
// files to exist on disk (they are generated artefacts not committed to source).
//
// Paths are resolved from this file's location so they match the absolute paths
// that mdx.ts reaches via its own relative imports.
jest.mock(
  "../../../public/blog.index.json",
  () => [
    {
      slug: "test-post",
      title: "Test Post",
      description: "A test post about testing",
      created: "2024-01-01",
      tags: ["testing", "jest"],
      category: "engineering",
      coverImage: "/img/test.png",
      body: "Test content here",
      related: [],
    },
  ],
  {virtual: true},
);

jest.mock("../../../public/blog.related.json", () => ({"test-post": ["other-post"]}), {
  virtual: true,
});

// Minimal valid MiniSearch serialization matching the fields used in mdx.ts:
// fields: ["title", "description", "tags", "body"], idField: "slug"
jest.mock(
  "../../../public/blog.search.json",
  () => ({
    documentCount: 1,
    nextId: 1,
    documentIds: {"0": "test-post"},
    fieldIds: {title: 0, description: 1, tags: 2, body: 3},
    fieldLength: {"0": [2, 5, 2, 3]},
    averageFieldLength: [2, 5, 2, 3],
    storedFields: {"0": {title: "Test Post"}},
    dirtCount: 0,
    index: [
      ["test", {"0": {"0": 1}}],
      ["post", {"0": {"0": 1}}],
      ["testing", {"2": {"0": 1}}],
      ["jest", {"2": {"0": 1}}],
    ],
    serializationVersion: 2,
  }),
  {virtual: true},
);

import {getBlogBySlug, getBlogPosts, getRelatedSlugs, rankPosts} from "@/lib/mdx";

describe("getBlogPosts", () => {
  it("returns an array of posts", () => {
    const posts = getBlogPosts();
    expect(Array.isArray(posts)).toBe(true);
    expect(posts).toHaveLength(1);
  });

  it("returns posts with slug and title fields", () => {
    const posts = getBlogPosts();
    expect(posts[0]).toHaveProperty("slug", "test-post");
    expect(posts[0]).toHaveProperty("title", "Test Post");
  });
});

describe("getBlogBySlug", () => {
  it("returns the post matching the given slug", () => {
    expect(getBlogBySlug("test-post")?.slug).toBe("test-post");
  });

  it("returns null when the slug does not exist", () => {
    expect(getBlogBySlug("non-existent-slug-xyz")).toBeNull();
  });
});

describe("rankPosts", () => {
  it("returns an array", () => {
    expect(Array.isArray(rankPosts(getBlogPosts(), "test"))).toBe(true);
  });

  it("returns an empty array when the query matches nothing", () => {
    expect(rankPosts(getBlogPosts(), "zzzzunlikelytomatchanything12345xyz")).toEqual([]);
  });

  it("returns only posts present in the provided posts array", () => {
    const allPosts = getBlogPosts();
    rankPosts(allPosts, "test").forEach((post) => {
      expect(allPosts.some((p) => p.slug === post.slug)).toBe(true);
    });
  });

  it("reuses the MiniSearch instance on a second call without error", () => {
    const posts = getBlogPosts();
    rankPosts(posts, "test");
    expect(() => rankPosts(posts, "post")).not.toThrow();
  });
});

describe("getRelatedSlugs", () => {
  it("returns the related slugs for a known post", () => {
    expect(getRelatedSlugs("test-post")).toEqual(["other-post"]);
  });

  it("returns an empty array for a slug with no related entries", () => {
    expect(getRelatedSlugs("totally-unknown-slug")).toEqual([]);
  });

  it("respects the limit parameter", () => {
    expect(getRelatedSlugs("test-post", 1).length).toBeLessThanOrEqual(1);
  });

  it("defaults to a limit of 3", () => {
    expect(getRelatedSlugs("test-post").length).toBeLessThanOrEqual(3);
  });
});
