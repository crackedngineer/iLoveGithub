/**
 * @jest-environment node
 */

const mockFetch = jest.fn();
global.fetch = mockFetch;

import {GET} from "@/app/api/repo/trending/route";

function makeReq(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return new Request(`http://localhost/api/repo/trending${qs ? `?${qs}` : ""}`);
}

const mockItems = [
  {
    id: 1,
    name: "cool-repo",
    full_name: "octocat/cool-repo",
    html_url: "https://github.com/octocat/cool-repo",
    description: "A cool repo",
    stargazers_count: 500,
    language: "TypeScript",
    owner: {
      login: "octocat",
      avatar_url: "https://avatars.example.com",
      html_url: "https://github.com/octocat",
    },
  },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/repo/trending", () => {
  it("returns 200 with items and pagination on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({items: mockItems, total_count: 1}),
    });

    const res = await GET(makeReq());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toHaveLength(1);
    expect(data.items[0].name).toBe("cool-repo");
    expect(data.pagination).toBeDefined();
  });

  it("returns 200 and passes the language filter to GitHub API", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({items: [], total_count: 0}),
    });

    await GET(makeReq({language: "rust"}));
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain("language%3Arust");
  });

  it("returns the correct pagination metadata", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({items: mockItems, total_count: 50}),
    });

    const res = await GET(makeReq({limit: "10", offset: "20"}));
    const data = await res.json();
    expect(data.pagination.limit).toBe(10);
    expect(data.pagination.offset).toBe(20);
    expect(data.pagination.next_offset).toBe(30);
    expect(data.pagination.has_more).toBe(true);
  });

  it("maps repository data to the expected shape", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({items: mockItems, total_count: 1}),
    });

    const res = await GET(makeReq());
    const data = await res.json();
    const item = data.items[0];
    expect(item).toHaveProperty("id");
    expect(item).toHaveProperty("name");
    expect(item).toHaveProperty("full_name");
    expect(item).toHaveProperty("owner");
    expect(item.owner).toHaveProperty("login");
  });

  it("returns the GitHub API error status when the GitHub request fails", async () => {
    mockFetch.mockResolvedValueOnce({ok: false, status: 422});
    const res = await GET(makeReq());
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error).toMatch(/422/);
  });

  it("returns 500 when fetch itself throws a network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("DNS failure"));
    const res = await GET(makeReq());
    expect(res.status).toBe(500);
  });

  it("sets Cache-Control headers on a successful response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({items: [], total_count: 0}),
    });

    const res = await GET(makeReq());
    expect(res.headers.get("Cache-Control")).toContain("s-maxage");
  });
});
