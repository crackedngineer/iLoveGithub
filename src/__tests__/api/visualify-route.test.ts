/**
 * @jest-environment node
 */

jest.mock("@/lib/utils", () => ({
  ...jest.requireActual("@/lib/utils"),
  getRepoDetails: jest.fn(),
}));

jest.mock("@/app/api/visualify/generate/themes/factory", () => ({
  getCardGeneratorFactory: jest.fn(),
}));

import {NextRequest} from "next/server";
import {GET} from "@/app/api/visualify/generate/route";
import {getRepoDetails} from "@/lib/utils";
import {getCardGeneratorFactory} from "@/app/api/visualify/generate/themes/factory";

const mockGetRepoDetails = getRepoDetails as jest.Mock;
const mockGetFactory = getCardGeneratorFactory as jest.Mock;

const mockRepoData = {
  id: 1,
  name: "Hello-World",
  full_name: "octocat/Hello-World",
  description: "A test repo",
  stargazers_count: 100,
  language: "TypeScript",
  owner: {login: "octocat", avatar_url: "", html_url: ""},
  open_issues: 5,
  watchers: 10,
  forks_count: 20,
};

const mockSvg = "<svg><text>Hello-World</text></svg>";

function makeReq(params: Record<string, string | undefined> = {}) {
  const url = new URL("http://localhost/api/visualify/generate");
  const defaults = {owner: "octocat", repo: "Hello-World", theme: "light-classic"};
  Object.entries({...defaults, ...params}).forEach(([k, v]) => {
    if (v !== undefined) url.searchParams.set(k, v);
  });
  return new NextRequest(url.toString());
}

beforeEach(() => {
  jest.clearAllMocks();
  const mockGenerator = {
    setConfig: jest.fn(),
    generateCard: jest.fn().mockResolvedValue(mockSvg),
  };
  mockGetFactory.mockReturnValue(mockGenerator);
  mockGetRepoDetails.mockResolvedValue(mockRepoData);
});

describe("GET /api/visualify/generate", () => {
  it("returns 400 when owner is missing", async () => {
    const res = await GET(makeReq({owner: undefined}));
    expect(res.status).toBe(400);
  });

  it("returns 400 when repo is missing", async () => {
    const res = await GET(makeReq({repo: undefined}));
    expect(res.status).toBe(400);
  });

  it("returns an SVG response with Content-Type image/svg+xml on success", async () => {
    const res = await GET(makeReq());
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/svg+xml");
    const body = await res.text();
    expect(body).toBe(mockSvg);
  });

  it("sets a Cache-Control header for public caching", async () => {
    const res = await GET(makeReq());
    expect(res.headers.get("Cache-Control")).toContain("public");
    expect(res.headers.get("Cache-Control")).toContain("max-age=3600");
  });

  it("calls getRepoDetails with the authorization header token", async () => {
    const req = makeReq();
    req.headers.set("authorization", "Bearer my-token");
    await GET(req);
    expect(mockGetRepoDetails).toHaveBeenCalledWith("Bearer my-token", "octocat", "Hello-World");
  });

  it("returns 500 when getRepoDetails throws an error", async () => {
    mockGetRepoDetails.mockRejectedValueOnce(new Error("GitHub API error"));
    const res = await GET(makeReq());
    expect(res.status).toBe(500);
  });

  it("passes URLSearchParams to the card generator's setConfig", async () => {
    const mockGenerator = {
      setConfig: jest.fn(),
      generateCard: jest.fn().mockResolvedValue(mockSvg),
    };
    mockGetFactory.mockReturnValue(mockGenerator);

    await GET(makeReq({width: "600", height: "400"}));
    expect(mockGenerator.setConfig).toHaveBeenCalledTimes(1);
  });
});
