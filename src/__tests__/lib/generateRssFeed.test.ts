jest.mock("@/services/blog", () => ({
  getAllBlogPosts: jest.fn(),
}));

import {getAllBlogPosts} from "@/services/blog";
import {copyRssFeedUrl, downloadRssFeed, generateRssFeed} from "@/lib/generateRssFeed";

const mockGetAllBlogPosts = getAllBlogPosts as jest.Mock;

// jsdom default: window.location.origin = "http://localhost"
const ORIGIN = "http://localhost";

const mockPosts = [
  {
    slug: "test-post",
    title: "Test Post",
    description: "A test post",
    excerpt: "Short excerpt",
    created: "2024-01-15",
    tags: ["testing", "jest"],
    category: "engineering",
    coverImage: "/img/cover.png",
    author: "Alice",
  },
];

beforeEach(() => {
  jest.clearAllMocks();

  // Mock URL.createObjectURL / revokeObjectURL
  global.URL.createObjectURL = jest.fn().mockReturnValue("blob:fake-url");
  global.URL.revokeObjectURL = jest.fn();

  // Mock document methods used by downloadRssFeed
  const mockAnchor = {href: "", download: "", click: jest.fn()};
  jest.spyOn(document, "createElement").mockReturnValue(mockAnchor as unknown as HTMLElement);
  jest.spyOn(document.body, "appendChild").mockImplementation((node) => node);
  jest.spyOn(document.body, "removeChild").mockImplementation((node) => node);

  // Mock navigator.clipboard
  Object.defineProperty(navigator, "clipboard", {
    value: {writeText: jest.fn().mockResolvedValue(undefined)},
    writable: true,
    configurable: true,
  });
});

describe("generateRssFeed", () => {
  it("returns a valid RSS XML string starting with the xml declaration", async () => {
    mockGetAllBlogPosts.mockResolvedValueOnce({posts: mockPosts});
    const rss = await generateRssFeed();
    expect(rss).toMatch(/^<\?xml version="1\.0"/);
  });

  it("includes the origin URL in the channel link", async () => {
    mockGetAllBlogPosts.mockResolvedValueOnce({posts: mockPosts});
    const rss = await generateRssFeed();
    expect(rss).toContain(`${ORIGIN}/blog`);
  });

  it("includes the rss version and namespace declaration", async () => {
    mockGetAllBlogPosts.mockResolvedValueOnce({posts: mockPosts});
    const rss = await generateRssFeed();
    expect(rss).toContain('version="2.0"');
    expect(rss).toContain("<channel>");
  });

  it("includes each post's title in an RSS item", async () => {
    mockGetAllBlogPosts.mockResolvedValueOnce({posts: mockPosts});
    const rss = await generateRssFeed();
    expect(rss).toContain("Test Post");
  });

  it("includes each post's slug in the item link URL", async () => {
    mockGetAllBlogPosts.mockResolvedValueOnce({posts: mockPosts});
    const rss = await generateRssFeed();
    expect(rss).toContain("/blog/test-post");
  });

  it("includes each post's excerpt as the item description", async () => {
    mockGetAllBlogPosts.mockResolvedValueOnce({posts: mockPosts});
    const rss = await generateRssFeed();
    expect(rss).toContain("Short excerpt");
  });

  it("escapes XML special characters in post titles", async () => {
    mockGetAllBlogPosts.mockResolvedValueOnce({
      posts: [{...mockPosts[0], title: "Post with <special> & characters"}],
    });
    const rss = await generateRssFeed();
    expect(rss).toContain("Post with &lt;special&gt; &amp; characters");
  });

  it("includes category tags for each post tag", async () => {
    mockGetAllBlogPosts.mockResolvedValueOnce({posts: mockPosts});
    const rss = await generateRssFeed();
    expect(rss).toContain("<category>testing</category>");
    expect(rss).toContain("<category>jest</category>");
  });

  it("produces an empty items list when there are no posts", async () => {
    mockGetAllBlogPosts.mockResolvedValueOnce({posts: []});
    const rss = await generateRssFeed();
    expect(rss).toContain("<channel>");
    expect(rss).not.toContain("<item>");
  });
});

describe("downloadRssFeed", () => {
  it("triggers a click on the anchor element to start the download", async () => {
    mockGetAllBlogPosts.mockResolvedValueOnce({posts: mockPosts});
    await downloadRssFeed();
    const anchor = (document.createElement as jest.Mock).mock.results[0].value;
    expect(anchor.click).toHaveBeenCalledTimes(1);
  });

  it("sets the correct download filename on the anchor", async () => {
    mockGetAllBlogPosts.mockResolvedValueOnce({posts: mockPosts});
    await downloadRssFeed();
    const anchor = (document.createElement as jest.Mock).mock.results[0].value;
    expect(anchor.download).toBe("rss.xml");
  });

  it("removes the anchor from the DOM after the download", async () => {
    mockGetAllBlogPosts.mockResolvedValueOnce({posts: mockPosts});
    await downloadRssFeed();
    expect(document.body.removeChild).toHaveBeenCalledTimes(1);
  });

  it("revokes the object URL after the download completes", async () => {
    mockGetAllBlogPosts.mockResolvedValueOnce({posts: mockPosts});
    await downloadRssFeed();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:fake-url");
  });
});

describe("copyRssFeedUrl", () => {
  it("writes a URL containing '/blog?format=rss' to the clipboard", () => {
    copyRssFeedUrl();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("/blog?format=rss"),
    );
  });

  it("prefixes the feed URL with the current origin", () => {
    copyRssFeedUrl();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining(ORIGIN));
  });
});
