/**
 * @jest-environment node
 */

jest.mock("fs/promises", () => ({
  readFile: jest.fn(),
}));

import {NextRequest} from "next/server";
import {GET} from "@/app/api/tools/route";
import fs from "fs/promises";

const mockReadFile = fs.readFile as jest.Mock;

const sampleTools = [
  {
    name: "github-stats",
    title: "GitHub Stats",
    description: "View stats",
    homepage: "https://github-stats.example.com",
    url: "https://github-stats.example.com/{owner}/{repo}/{branch}",
    icon: null,
    category: "analytics",
    iframe: true,
    created_at: "2024-01-01",
  },
];

function makeReq(params: Record<string, string | undefined> = {}) {
  const url = new URL("http://localhost/api/tools");
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) url.searchParams.set(k, v);
  });
  return new NextRequest(url.toString());
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/tools", () => {
  it("returns 400 when owner is missing", async () => {
    const res = await GET(makeReq({repo: "repo", branch: "main"}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/owner/i);
  });

  it("returns 400 when repo is missing", async () => {
    const res = await GET(makeReq({owner: "octocat", branch: "main"}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/repo/i);
  });

  it("returns 400 when branch is missing", async () => {
    const res = await GET(makeReq({owner: "octocat", repo: "repo"}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/branch/i);
  });

  it("returns 200 with tools list when all params are present", async () => {
    mockReadFile.mockResolvedValueOnce(JSON.stringify(sampleTools));
    const res = await GET(makeReq({owner: "octocat", repo: "Hello-World", branch: "main"}));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].name).toBe("github-stats");
  });

  it("adds a 'link' field with owner/repo/branch substituted into the root-domain URL", async () => {
    mockReadFile.mockResolvedValueOnce(JSON.stringify(sampleTools));
    const res = await GET(makeReq({owner: "octocat", repo: "Hello-World", branch: "main"}));
    const data = await res.json();
    expect(data[0].link).toContain("octocat");
    expect(data[0].link).toContain("Hello-World");
    expect(data[0].link).toContain("main");
  });

  it("returns 500 when reading tools.json fails", async () => {
    mockReadFile.mockRejectedValueOnce(new Error("File not found"));
    const res = await GET(makeReq({owner: "octocat", repo: "Hello-World", branch: "main"}));
    expect(res.status).toBe(500);
  });
});
