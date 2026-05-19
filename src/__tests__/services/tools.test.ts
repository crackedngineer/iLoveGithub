import {fetchToolList} from "@/services/tools";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    create: jest.fn(() => ({get: jest.fn(), post: jest.fn()})),
    isAxiosError: jest.fn().mockReturnValue(false),
  },
}));

import axios from "axios";

const mockGet = axios.get as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("fetchToolList", () => {
  const mockTool = {
    name: "github-stats",
    title: "GitHub Stats",
    description: "View repository statistics",
    homepage: "https://github-stats.example.com",
    url: "https://github-stats.example.com/{owner}/{repo}",
    icon: null,
    category: "analytics",
    iframe: true,
    created_at: "2024-01-01",
  };

  it("returns the list of tools from the API response", async () => {
    mockGet.mockResolvedValueOnce({data: [mockTool]});

    const result = await fetchToolList("octocat", "Hello-World", "main");
    expect(result).toEqual([mockTool]);
  });

  it("includes owner, repo, and branch in the request URL", async () => {
    mockGet.mockResolvedValueOnce({data: []});

    await fetchToolList("octocat", "Hello-World", "main");
    const calledUrl = mockGet.mock.calls[0][0] as string;
    expect(calledUrl).toContain("owner=octocat");
    expect(calledUrl).toContain("repo=Hello-World");
    expect(calledUrl).toContain("branch=main");
  });

  it("returns an empty array when the API returns no tools", async () => {
    mockGet.mockResolvedValueOnce({data: []});

    const result = await fetchToolList("owner", "repo", "main");
    expect(result).toEqual([]);
  });

  it("re-throws errors from the API call", async () => {
    mockGet.mockRejectedValueOnce(new Error("tools API failed"));

    await expect(fetchToolList("owner", "repo", "main")).rejects.toThrow("tools API failed");
  });

  it("returns multiple tools when the API responds with a list", async () => {
    const tools = [mockTool, {...mockTool, name: "github-readme"}];
    mockGet.mockResolvedValueOnce({data: tools});

    const result = await fetchToolList("owner", "repo", "develop");
    expect(result).toHaveLength(2);
  });
});
