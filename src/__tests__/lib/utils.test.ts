jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    create: jest.fn(),
    isAxiosError: jest.fn(),
  },
}));

import axios from "axios";
import {
  cn,
  extractSubdomainFromHostname,
  getHostnameFromUrl,
  getRepoDetails,
  newGithubClient,
} from "@/lib/utils";

describe("getHostnameFromUrl", () => {
  it("returns the hostname from an HTTPS URL", () => {
    expect(getHostnameFromUrl("https://example.com")).toBe("example.com");
  });

  it("returns the hostname from an HTTP URL", () => {
    expect(getHostnameFromUrl("http://example.com")).toBe("example.com");
  });

  it("returns the hostname from a URL with a path", () => {
    expect(getHostnameFromUrl("https://example.com/some/path")).toBe("example.com");
  });

  it("returns the hostname from a URL with query parameters", () => {
    expect(getHostnameFromUrl("https://example.com?q=test")).toBe("example.com");
  });

  it("returns the hostname including subdomain", () => {
    expect(getHostnameFromUrl("https://api.example.com/v1")).toBe("api.example.com");
  });

  it("returns the hostname without the port", () => {
    expect(getHostnameFromUrl("https://example.com:8080/path")).toBe("example.com");
  });

  it("returns null for an invalid URL string", () => {
    expect(getHostnameFromUrl("not-a-url")).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(getHostnameFromUrl("")).toBeNull();
  });

  it("returns null for a plain domain without protocol", () => {
    expect(getHostnameFromUrl("example.com")).toBeNull();
  });
});

// In the test environment, NEXT_PUBLIC_ROOT_DOMAIN is not set,
// so rootDomain defaults to "localhost".
describe("extractSubdomainFromHostname (rootDomain = 'localhost')", () => {
  it("returns null for the root domain itself", () => {
    expect(extractSubdomainFromHostname("localhost")).toBeNull();
  });

  it("returns null for the www-prefixed root domain", () => {
    expect(extractSubdomainFromHostname("www.localhost")).toBeNull();
  });

  it("returns the subdomain for a .localhost hostname", () => {
    expect(extractSubdomainFromHostname("app.localhost")).toBe("app");
  });

  it("returns the first part of a multi-segment .localhost hostname", () => {
    expect(extractSubdomainFromHostname("org.localhost")).toBe("org");
  });

  it("returns null for a 127.0.0.1 address without .localhost suffix", () => {
    expect(extractSubdomainFromHostname("127.0.0.1")).toBeNull();
  });

  it("extracts the tenant from a Vercel preview URL (--- pattern)", () => {
    expect(extractSubdomainFromHostname("myapp---branch-name.vercel.app")).toBe("myapp");
  });

  it("returns null for a completely unrelated hostname", () => {
    expect(extractSubdomainFromHostname("example.com")).toBeNull();
  });

  it("returns null for a hostname without any recognisable subdomain pattern", () => {
    expect(extractSubdomainFromHostname("api.github.com")).toBeNull();
  });
});

describe("cn (class name utility)", () => {
  it("returns a single class name unchanged", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("joins multiple class names with a space", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("ignores falsy conditional values", () => {
    expect(cn("foo", false && "bar")).toBe("foo");
    expect(cn("foo", null)).toBe("foo");
    expect(cn("foo", undefined)).toBe("foo");
  });

  it("returns empty string when given no arguments", () => {
    expect(cn()).toBe("");
  });

  it("merges conflicting Tailwind classes, keeping the last one", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("handles object syntax where keys are class names and values are booleans", () => {
    expect(cn({foo: true, bar: false})).toBe("foo");
  });

  it("handles array syntax for class names", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });
});

describe("newGithubClient", () => {
  it("calls axios.create and returns the created instance", () => {
    const fakeInstance = {get: jest.fn()};
    (axios.create as jest.Mock).mockReturnValue(fakeInstance);

    const client = newGithubClient("ghp_token123");
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: "https://api.github.com",
      }),
    );
    expect(client).toBe(fakeInstance);
  });

  it("includes the Authorization header from the provided token", () => {
    const fakeInstance = {get: jest.fn()};
    (axios.create as jest.Mock).mockReturnValue(fakeInstance);

    newGithubClient("my-token");
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({Authorization: "my-token"}),
      }),
    );
  });
});

describe("getRepoDetails", () => {
  it("returns repository data when the API call succeeds", async () => {
    const repoData = {name: "Hello-World", full_name: "octocat/Hello-World"};
    const mockGet = jest.fn().mockResolvedValue({data: repoData});
    (axios.create as jest.Mock).mockReturnValue({get: mockGet});

    const result = await getRepoDetails("token", "octocat", "Hello-World");
    expect(result).toEqual(repoData);
  });

  it("calls the correct GitHub API endpoint", async () => {
    const mockGet = jest.fn().mockResolvedValue({data: {}});
    (axios.create as jest.Mock).mockReturnValue({get: mockGet});

    await getRepoDetails("token", "octocat", "Hello-World");
    expect(mockGet).toHaveBeenCalledWith("/repos/octocat/Hello-World");
  });

  it("returns undefined when the API call throws", async () => {
    const mockGet = jest.fn().mockRejectedValue(new Error("Not found"));
    (axios.create as jest.Mock).mockReturnValue({get: mockGet});

    const result = await getRepoDetails("token", "octocat", "missing-repo");
    expect(result).toBeUndefined();
  });
});
