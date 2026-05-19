import {parseImageFileName, replaceUrlVariables, toBase64} from "@/app/helper";

describe("replaceUrlVariables", () => {
  it("replaces a single variable in a URL template", () => {
    expect(replaceUrlVariables("https://example.com/{owner}", {owner: "octocat"})).toBe(
      "https://example.com/octocat",
    );
  });

  it("replaces multiple variables in a URL template", () => {
    const result = replaceUrlVariables("https://example.com/{owner}/{repo}", {
      owner: "octocat",
      repo: "Hello-World",
    });
    expect(result).toBe("https://example.com/octocat/Hello-World");
  });

  it("leaves unmatched placeholders as-is when key is missing from variables", () => {
    const result = replaceUrlVariables("https://example.com/{owner}/{repo}", {owner: "octocat"});
    expect(result).toBe("https://example.com/octocat/{repo}");
  });

  it("returns the template unchanged when there are no placeholders", () => {
    const url = "https://example.com/static";
    expect(replaceUrlVariables(url, {owner: "octocat"})).toBe(url);
  });

  it("returns the template unchanged when variables is empty object", () => {
    const url = "https://example.com/{owner}";
    expect(replaceUrlVariables(url, {})).toBe("https://example.com/{owner}");
  });

  it("handles empty string template", () => {
    expect(replaceUrlVariables("", {owner: "octocat"})).toBe("");
  });

  it("replaces a variable that appears multiple times", () => {
    const result = replaceUrlVariables("/{owner}/{owner}", {owner: "octocat"});
    expect(result).toBe("/octocat/octocat");
  });

  it("handles variables with numeric string values", () => {
    const result = replaceUrlVariables("/page/{page}", {page: "42"});
    expect(result).toBe("/page/42");
  });
});

describe("parseImageFileName", () => {
  it("extracts the file name from a full URL path", () => {
    expect(parseImageFileName("https://example.com/path/to/image.png")).toBe("image.png");
  });

  it("extracts the file name from a path with multiple segments", () => {
    expect(parseImageFileName("/a/b/c/file.jpg")).toBe("file.jpg");
  });

  it("returns the input unchanged when there is no slash", () => {
    expect(parseImageFileName("image.png")).toBe("image.png");
  });

  it("returns empty string for a trailing slash URL", () => {
    expect(parseImageFileName("https://example.com/")).toBe("");
  });

  it("handles filenames with dots and dashes", () => {
    expect(parseImageFileName("/images/my-file.v2.png")).toBe("my-file.v2.png");
  });
});

describe("toBase64", () => {
  it("encodes a simple ASCII string to base64", () => {
    // In jsdom environment, window.btoa is used
    const result = toBase64("Hello");
    expect(result).toBe("SGVsbG8=");
  });

  it("encodes an empty string to empty base64", () => {
    expect(toBase64("")).toBe("");
  });

  it("encodes a string with special characters", () => {
    expect(toBase64("Hello World")).toBe("SGVsbG8gV29ybGQ=");
  });
});
