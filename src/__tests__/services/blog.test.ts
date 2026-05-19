import {getAllBlogPosts, getBlogPostBySlug} from "@/services/blog";

jest.mock("@/lib/graphqlClient", () => ({
  graphqlRequest: jest.fn(),
}));

import {graphqlRequest} from "@/lib/graphqlClient";

const mockGraphqlRequest = graphqlRequest as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getAllBlogPosts", () => {
  const mockPostsResponse = {
    blogs: {
      total: 10,
      page: 1,
      count: 5,
      posts: [
        {
          slug: "my-post",
          title: "My Post",
          created: "2024-01-01",
          tags: ["jest", "testing"],
          category: "engineering",
          description: "A test post",
          excerpt: "Short excerpt",
          readTimeMinutes: 3,
          coverImage: "/img.png",
        },
      ],
    },
  };

  it("returns the blogs data from the graphql response", async () => {
    mockGraphqlRequest.mockResolvedValueOnce(mockPostsResponse);

    const result = await getAllBlogPosts(1, 5);
    expect(result).toEqual(mockPostsResponse.blogs);
  });

  it("calls graphqlRequest with page and count parameters", async () => {
    mockGraphqlRequest.mockResolvedValueOnce(mockPostsResponse);

    await getAllBlogPosts(2, 10);
    expect(mockGraphqlRequest).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({page: 2, count: 10}),
    );
  });

  it("passes null for empty searchQuery", async () => {
    mockGraphqlRequest.mockResolvedValueOnce(mockPostsResponse);

    await getAllBlogPosts(1, 5, "");
    expect(mockGraphqlRequest).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({query: null}),
    );
  });

  it("passes the searchQuery string when provided", async () => {
    mockGraphqlRequest.mockResolvedValueOnce(mockPostsResponse);

    await getAllBlogPosts(1, 5, "jest testing");
    expect(mockGraphqlRequest).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({query: "jest testing"}),
    );
  });

  it("passes the category when provided", async () => {
    mockGraphqlRequest.mockResolvedValueOnce(mockPostsResponse);

    await getAllBlogPosts(1, 5, "", "engineering");
    expect(mockGraphqlRequest).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({category: "engineering"}),
    );
  });

  it("passes null as default category when not provided", async () => {
    mockGraphqlRequest.mockResolvedValueOnce(mockPostsResponse);

    await getAllBlogPosts(1, 5);
    expect(mockGraphqlRequest).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({category: null}),
    );
  });
});

describe("getBlogPostBySlug", () => {
  const mockBlogResponse = {
    blog: {
      slug: "my-post",
      title: "My Post",
      description: "A test post",
      created: "2024-01-01",
      tags: ["jest"],
      category: "engineering",
      excerpt: "Short excerpt",
      coverImage: "/img.png",
      readTimeMinutes: 5,
      body: "# Hello\n\nContent here",
      related: [],
    },
  };

  it("returns the blog post from the graphql response", async () => {
    mockGraphqlRequest.mockResolvedValueOnce(mockBlogResponse);

    const result = await getBlogPostBySlug("my-post");
    expect(result).toEqual(mockBlogResponse.blog);
  });

  it("calls graphqlRequest with the slug parameter", async () => {
    mockGraphqlRequest.mockResolvedValueOnce(mockBlogResponse);

    await getBlogPostBySlug("getting-started");
    expect(mockGraphqlRequest).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({slug: "getting-started"}),
    );
  });
});
