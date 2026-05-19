import {
  fetchRateLimit,
  fetchRepoDetails,
  getRepoDefaultBranch,
  RateLimitError,
} from "@/services/github";

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
const mockIsAxiosError = axios.isAxiosError as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockIsAxiosError.mockReturnValue(false);
});

describe("RateLimitError", () => {
  it("has name 'RateLimitError'", () => {
    const err = new RateLimitError({limit: 60, remaining: 0, reset: 9999, used: 60});
    expect(err.name).toBe("RateLimitError");
  });

  it("has the standard rate-limit exceeded message", () => {
    const err = new RateLimitError({limit: 60, remaining: 0, reset: 9999, used: 60});
    expect(err.message).toBe("GitHub API rate limit exceeded");
  });

  it("stores the rate-limit response on the instance", () => {
    const response = {limit: 60, remaining: 0, reset: 9999, used: 60};
    const err = new RateLimitError(response);
    expect(err.response).toEqual(response);
  });

  it("is an instance of Error", () => {
    const err = new RateLimitError({limit: 60, remaining: 0, reset: 9999, used: 60});
    expect(err).toBeInstanceOf(Error);
  });
});

describe("fetchRateLimit", () => {
  it("returns rate limit data when the API responds successfully", async () => {
    const rateData = {limit: 60, remaining: 50, reset: 1700000000, used: 10};
    mockGet.mockResolvedValueOnce({data: {rate: rateData}});

    const result = await fetchRateLimit();
    expect(result).toEqual(rateData);
  });

  it("throws RateLimitError when remaining is 0 in the response", async () => {
    const rateData = {limit: 60, remaining: 0, reset: 1700000000, used: 60};
    mockGet.mockResolvedValueOnce({data: {rate: rateData}});

    await expect(fetchRateLimit()).rejects.toBeInstanceOf(RateLimitError);
  });

  it("re-throws RateLimitError that originates within the try block", async () => {
    const rateData = {limit: 60, remaining: 0, reset: 1700000000, used: 60};
    mockGet.mockResolvedValueOnce({data: {rate: rateData}});

    try {
      await fetchRateLimit();
      fail("expected RateLimitError to be thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(RateLimitError);
      expect((err as RateLimitError).response).toEqual(rateData);
    }
  });

  it("returns fallback defaults when a network error occurs", async () => {
    mockGet.mockRejectedValueOnce(new Error("network error"));

    const result = await fetchRateLimit();
    expect(result.limit).toBe(60);
    expect(result.remaining).toBe(0);
    expect(result.used).toBe(0);
    expect(result.reset).toBeGreaterThan(0);
  });

  it("returns fallback defaults when an Axios error occurs", async () => {
    const axiosError = new Error("Request failed") as any;
    axiosError.response = {data: {message: "Unauthorized"}};
    mockIsAxiosError.mockReturnValue(true);
    mockGet.mockRejectedValueOnce(axiosError);

    const result = await fetchRateLimit();
    expect(result.limit).toBe(60);
    expect(result.remaining).toBe(0);
  });

  it("calls the GitHub API rate_limit endpoint", async () => {
    const rateData = {limit: 60, remaining: 50, reset: 1700000000, used: 10};
    mockGet.mockResolvedValueOnce({data: {rate: rateData}});

    await fetchRateLimit();
    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining("/rate_limit"),
      expect.any(Object),
    );
  });
});

describe("fetchRepoDetails", () => {
  it("returns repository data on success", async () => {
    const repoData = {name: "Hello-World", full_name: "octocat/Hello-World", stargazers_count: 100};
    mockGet.mockResolvedValueOnce({data: repoData});

    const result = await fetchRepoDetails("octocat", "Hello-World");
    expect(result).toEqual(repoData);
  });

  it("includes the owner and repo in the request URL", async () => {
    mockGet.mockResolvedValueOnce({data: {}});

    await fetchRepoDetails("octocat", "Hello-World");
    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining("owner=octocat"),
      expect.any(Object),
    );
    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining("repo=Hello-World"),
      expect.any(Object),
    );
  });

  it("includes the Authorization header when a token is provided", async () => {
    mockGet.mockResolvedValueOnce({data: {}});

    await fetchRepoDetails("octocat", "Hello-World", "my-token");
    expect(mockGet).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({Authorization: "Bearer my-token"}),
      }),
    );
  });

  it("sends no Authorization header when token is null", async () => {
    mockGet.mockResolvedValueOnce({data: {}});

    await fetchRepoDetails("octocat", "Hello-World", null);
    expect(mockGet).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({headers: {}}),
    );
  });

  it("re-throws errors from the API call", async () => {
    mockGet.mockRejectedValueOnce(new Error("not found"));

    await expect(fetchRepoDetails("octocat", "missing-repo")).rejects.toThrow("not found");
  });
});

describe("getRepoDefaultBranch", () => {
  it("returns the default_branch from the repo details", async () => {
    mockGet.mockResolvedValueOnce({data: {default_branch: "main"}});

    const result = await getRepoDefaultBranch("octocat", "Hello-World");
    expect(result).toBe("main");
  });

  it("returns the fallback branch name when fetchRepoDetails throws", async () => {
    mockGet.mockRejectedValueOnce(new Error("network error"));

    const result = await getRepoDefaultBranch("octocat", "Hello-World");
    expect(result).toBe("main"); // DefaultGithubRepo.branch
  });
});
