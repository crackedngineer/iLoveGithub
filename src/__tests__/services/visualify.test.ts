import {generateVisualifyCard} from "@/services/visualify";

describe("generateVisualifyCard", () => {
  it("returns a URL starting with /api/visualify/generate", () => {
    const url = generateVisualifyCard(
      "Hello-World",
      "octocat",
      "light-classic",
      "default",
      400,
      200,
    );
    expect(url).toMatch(/^\/api\/visualify\/generate\?/);
  });

  it("includes the repo parameter in the URL", () => {
    const url = generateVisualifyCard(
      "Hello-World",
      "octocat",
      "light-classic",
      "default",
      400,
      200,
    );
    expect(url).toContain("repo=Hello-World");
  });

  it("includes the owner parameter in the URL", () => {
    const url = generateVisualifyCard(
      "Hello-World",
      "octocat",
      "light-classic",
      "default",
      400,
      200,
    );
    expect(url).toContain("owner=octocat");
  });

  it("includes the width parameter in the URL", () => {
    const url = generateVisualifyCard("repo", "owner", "theme", "layout", 800, 400);
    expect(url).toContain("width=800");
  });

  it("includes the height parameter in the URL", () => {
    const url = generateVisualifyCard("repo", "owner", "theme", "layout", 800, 400);
    expect(url).toContain("height=400");
  });

  it("returns a different URL for different dimensions", () => {
    const url1 = generateVisualifyCard("repo", "owner", "theme", "layout", 400, 200);
    const url2 = generateVisualifyCard("repo", "owner", "theme", "layout", 800, 400);
    expect(url1).not.toBe(url2);
  });

  it("handles repos with special characters by encoding them", () => {
    const url = generateVisualifyCard("my repo", "octocat", "theme", "layout", 400, 200);
    // URLSearchParams encodes spaces as + or %20
    expect(url).toContain("repo=my+repo");
  });

  it("produces a valid query string format", () => {
    const url = generateVisualifyCard("repo", "owner", "theme", "layout", 400, 200);
    const queryString = url.split("?")[1];
    const params = new URLSearchParams(queryString);
    expect(params.get("repo")).toBe("repo");
    expect(params.get("owner")).toBe("owner");
    expect(params.get("width")).toBe("400");
    expect(params.get("height")).toBe("200");
  });
});
