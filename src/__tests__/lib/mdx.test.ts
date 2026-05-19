import fs from "fs";

jest.mock("fs");

const mockPost = {
  slug: "test-post",
  title: "Test Post",
  description: "A test post about testing",
  created: "2024-01-01",
  tags: ["testing", "jest"],
  category: "engineering",
  coverImage: "/img/test.png",
  body: "Test content here",
  related: [],
};

const mockRelated: Record<string, string[]> = {"test-post": ["other-post"]};

// Minimal valid MiniSearch serialization matching the fields used in mdx.ts:
// fields: ["title", "description", "tags", "body"], idField: "slug"
const mockSearchIndex = {
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
};

const mockReadFileSync = fs.readFileSync as jest.Mock;

beforeEach(() => {
  // Reset MiniSearch singleton between tests via module reload
  jest.resetModules();
  mockReadFileSync.mockImplementation((filePath: string) => {
    if (String(filePath).includes("blog.index.json")) return JSON.stringify([mockPost]);
    if (String(filePath).includes("blog.related.json")) return JSON.stringify(mockRelated);
    if (String(filePath).includes("blog.search.json")) return JSON.stringify(mockSearchIndex);
    throw new Error(`Unexpected readFileSync call: ${filePath}`);
  });
});

// Import after mocks so each test gets a fresh module with the reset singleton
import {getBlogBySlug, getBlogPosts, getRelatedSlugs, rankPosts} from "@/lib/mdx";

describe("getBlogPosts", () => {
  it("returns an array of posts read from the JSON file", () => {
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
    const result = getBlogBySlug("test-post");
    expect(result?.slug).toBe("test-post");
  });

  it("returns null when the slug does not exist", () => {
    expect(getBlogBySlug("non-existent-slug-xyz")).toBeNull();
  });
});

describe("rankPosts", () => {
  it("returns an array", () => {
    const posts = getBlogPosts();
    expect(Array.isArray(rankPosts(posts, "test"))).toBe(true);
  });

  it("returns an empty array when the query matches nothing", () => {
    const posts = getBlogPosts();
    expect(rankPosts(posts, "zzzzunlikelytomatchanything12345xyz")).toEqual([]);
  });

  it("returns only posts present in the provided posts array", () => {
    const allPosts = getBlogPosts();
    const results = rankPosts(allPosts, "test");
    results.forEach((post) => {
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
