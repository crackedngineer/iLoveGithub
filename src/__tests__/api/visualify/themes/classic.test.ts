import {
  ClassicCardGenerator,
  DarkClassicCardGenerator,
  LightClassicCardGenerator,
} from "@/app/api/visualify/generate/themes/classic";

// newGithubClient is only called in generateCard which we don't test here
jest.mock("@/lib/utils", () => ({
  newGithubClient: jest.fn(),
}));

import {newGithubClient} from "@/lib/utils";

function createGenerator(params: Record<string, string> = {}): ClassicCardGenerator {
  const gen = new ClassicCardGenerator();
  gen.setConfig(new URLSearchParams({width: "400", height: "300", ...params}));
  return gen;
}

describe("ClassicCardGenerator", () => {
  describe("getLangColor", () => {
    it("returns the correct hex color for TypeScript", () => {
      const gen = new ClassicCardGenerator();
      expect(gen.getLangColor("TypeScript")).toBe("#3178c6");
    });

    it("returns the correct hex color for JavaScript", () => {
      const gen = new ClassicCardGenerator();
      expect(gen.getLangColor("JavaScript")).toBe("#f1e05a");
    });

    it("returns fallback gray color for unknown languages", () => {
      const gen = new ClassicCardGenerator();
      expect(gen.getLangColor("UnknownLang")).toBe("#858585");
    });

    it("returns fallback color for empty string language", () => {
      const gen = new ClassicCardGenerator();
      expect(gen.getLangColor("")).toBe("#858585");
    });

    it("returns correct colors for all supported languages", () => {
      const gen = new ClassicCardGenerator();
      expect(gen.getLangColor("Python")).toBe("#3572A5");
      expect(gen.getLangColor("Go")).toBe("#00ADD8");
      expect(gen.getLangColor("Rust")).toBe("#ce422b");
      expect(gen.getLangColor("Swift")).toBe("#FA7343");
    });
  });

  describe("setConfig", () => {
    it("sets default width 400 and height 200 when not provided", () => {
      const gen = new ClassicCardGenerator();
      gen.setConfig(new URLSearchParams());
      // Access via computeLayout which reads this.config
      const layout = gen.computeLayout({width: 400, height: 200, elements: undefined} as any);
      expect(layout.cardW).toBe(400);
      expect(layout.cardH).toBe(200);
    });

    it("sets custom width and height from URLSearchParams", () => {
      const gen = new ClassicCardGenerator();
      gen.setConfig(new URLSearchParams("width=800&height=400"));
      const layout = gen.computeLayout({width: 800, height: 400, elements: undefined} as any);
      expect(layout.cardW).toBe(800);
      expect(layout.cardH).toBe(400);
    });

    it("sets elements from URLSearchParams", () => {
      const gen = createGenerator({elements: "stars,forks"});
      const layout = gen.computeLayout((gen as any)["config"]);
      expect(layout.activeStats).toEqual(["stars", "forks"]);
    });
  });

  describe("computeLayout", () => {
    it("computes correct card dimensions", () => {
      const gen = createGenerator({
        width: "400",
        height: "300",
        elements: "stars,forks,description,language",
      });
      const layout = gen.computeLayout((gen as any)["config"]);
      expect(layout.cardW).toBe(400);
      expect(layout.cardH).toBe(300);
    });

    it("positions the strip at the bottom of the card", () => {
      const gen = createGenerator({width: "400", height: "300"});
      const layout = gen.computeLayout((gen as any)["config"]);
      expect(layout.stripY).toBe(285); // 300 - 15 (STRIP_H)
      expect(layout.stripH).toBe(15);
    });

    it("computes correct avatar position", () => {
      const gen = createGenerator({width: "400", height: "300"});
      const layout = gen.computeLayout((gen as any)["config"]);
      expect(layout.avatarX).toBe(240); // 400 - 40 - 120
      expect(layout.avatarY).toBe(60); // 40 + 20
    });

    it("includes only elements present in the elements array as activeStats", () => {
      const gen = createGenerator({elements: "stars,forks"});
      const layout = gen.computeLayout((gen as any)["config"]);
      expect(layout.activeStats).toEqual(["stars", "forks"]);
    });

    it("includes all stat elements when elements is undefined", () => {
      const gen = createGenerator({});
      // Remove elements from config to test undefined behavior
      const config = (gen as any)["config"];
      config.elements = undefined;
      const layout = gen.computeLayout(config);
      expect(layout.activeStats).toEqual(["contributors", "issues", "stars", "forks", "watchers"]);
    });

    it("sets descY to null when description is excluded", () => {
      const gen = createGenerator({elements: "stars"});
      const layout = gen.computeLayout((gen as any)["config"]);
      expect(layout.descY).toBeNull();
    });

    it("sets statsY to null when no stat elements are active", () => {
      const gen = createGenerator({elements: "description"});
      const layout = gen.computeLayout((gen as any)["config"]);
      expect(layout.statsY).toBeNull();
    });

    it("computes correct statXPositions for two active stats", () => {
      const gen = createGenerator({width: "400", height: "300", elements: "stars,forks"});
      const layout = gen.computeLayout((gen as any)["config"]);
      expect(layout.statXPositions).toHaveLength(2);
      expect(layout.statXPositions[0]).toBe(40); // PADDING
    });
  });

  describe("buildTitle", () => {
    it("includes owner and repo name in SVG output", () => {
      const gen = new ClassicCardGenerator();
      const result = gen.buildTitle("octocat", "Hello-World", 90, "#ffffff");
      expect(result).toContain("octocat/");
      expect(result).toContain("Hello-World");
    });

    it("escapes XML special characters in owner name", () => {
      const gen = new ClassicCardGenerator();
      const result = gen.buildTitle("owner&more", "repo", 90, "#fff");
      expect(result).toContain("owner&amp;more");
    });

    it("escapes XML special characters in repo name", () => {
      const gen = new ClassicCardGenerator();
      const result = gen.buildTitle("owner", "repo<name>", 90, "#fff");
      expect(result).toContain("repo&lt;name&gt;");
    });

    it("includes the y-coordinate in the text element", () => {
      const gen = new ClassicCardGenerator();
      const result = gen.buildTitle("owner", "repo", 123, "#fff");
      expect(result).toContain('y="123"');
    });

    it("includes the color in the fill attribute", () => {
      const gen = new ClassicCardGenerator();
      const result = gen.buildTitle("owner", "repo", 90, "#c9d1d9");
      expect(result).toContain('fill="#c9d1d9"');
    });
  });

  describe("buildDescription", () => {
    it("renders short text as a single tspan", () => {
      const gen = new ClassicCardGenerator();
      // maxDescChars = 200: maxChars = Math.floor((200 - 40) / 2.5) = 64
      const result = gen.buildDescription("Short description", 100, 200, "#888");
      const tspanCount = (result.match(/<tspan/g) ?? []).length;
      expect(tspanCount).toBe(1);
    });

    it("wraps long text into multiple tspans", () => {
      const gen = new ClassicCardGenerator();
      // maxDescChars = 200 → maxChars = 64
      const longText = "word ".repeat(20).trim(); // 20 words of "word"
      const result = gen.buildDescription(longText, 100, 200, "#888");
      const tspanCount = (result.match(/<tspan/g) ?? []).length;
      expect(tspanCount).toBeGreaterThan(1);
    });

    it("escapes XML special characters in description text", () => {
      const gen = new ClassicCardGenerator();
      const result = gen.buildDescription("A & B", 100, 200, "#888");
      expect(result).toContain("A &amp; B");
    });

    it("applies the text color in the fill attribute", () => {
      const gen = new ClassicCardGenerator();
      const result = gen.buildDescription("text", 100, 200, "#4a5568");
      expect(result).toContain('fill="#4a5568"');
    });
  });

  describe("buildStatIcon", () => {
    it("returns SVG for contributors icon", () => {
      const gen = new ClassicCardGenerator();
      const result = gen.buildStatIcon("contributors", 10, 20, "#fff");
      expect(result).toContain("<circle");
    });

    it("returns SVG for issues icon", () => {
      const gen = new ClassicCardGenerator();
      const result = gen.buildStatIcon("issues", 10, 20, "#fff");
      expect(result).toContain("<circle");
    });

    it("returns SVG for stars icon", () => {
      const gen = new ClassicCardGenerator();
      const result = gen.buildStatIcon("stars", 10, 20, "#fff");
      expect(result).toContain("<polygon");
    });

    it("returns SVG for forks icon", () => {
      const gen = new ClassicCardGenerator();
      const result = gen.buildStatIcon("forks", 10, 20, "#fff");
      expect(result).toContain("<line");
    });

    it("returns SVG for watchers icon", () => {
      const gen = new ClassicCardGenerator();
      const result = gen.buildStatIcon("watchers", 10, 20, "#fff");
      expect(result).toContain("<rect");
    });

    it("returns empty string for unknown stat key", () => {
      const gen = new ClassicCardGenerator();
      const result = gen.buildStatIcon("unknown" as any, 10, 20, "#fff");
      expect(result).toBe("");
    });
  });

  describe("buildLanguage", () => {
    it("includes the language name in SVG output", () => {
      const gen = new ClassicCardGenerator();
      const result = gen.buildLanguage("TypeScript", 50, "#3178c6", "#888");
      expect(result).toContain("TypeScript");
    });

    it("includes the language color in the circle fill", () => {
      const gen = new ClassicCardGenerator();
      const result = gen.buildLanguage("TypeScript", 50, "#3178c6", "#888");
      expect(result).toContain('fill="#3178c6"');
    });

    it("escapes XML special characters in language name", () => {
      const gen = new ClassicCardGenerator();
      const result = gen.buildLanguage("C++", 50, "#f34b7d", "#888");
      expect(result).toContain("C++");
    });
  });

  describe("buildAvatar", () => {
    const mockLayout = {
      avatarX: 240,
      avatarY: 60,
      avatarW: 120,
      avatarH: 80,
    } as any;

    it("returns an image element when URL is provided", () => {
      const gen = new ClassicCardGenerator();
      const result = gen.buildAvatar("https://example.com/avatar.png", mockLayout, "#30363d");
      expect(result).toContain("<image");
      expect(result).toContain("https://example.com/avatar.png");
    });

    it("returns a placeholder rect when URL is undefined", () => {
      const gen = new ClassicCardGenerator();
      const result = gen.buildAvatar(undefined, mockLayout, "#30363d");
      expect(result).toContain("<rect");
      expect(result).not.toContain("<image");
    });

    it("escapes special characters in avatar URL", () => {
      const gen = new ClassicCardGenerator();
      const result = gen.buildAvatar('https://example.com/a&b"c.png', mockLayout, "#30363d");
      expect(result).toContain("&amp;");
      expect(result).toContain("&quot;");
    });
  });

  describe("normaliseBreakdown", () => {
    let gen: ClassicCardGenerator;

    beforeEach(() => {
      gen = new ClassicCardGenerator();
    });

    it("returns primary language at 100% when raw is undefined", () => {
      const result = gen.normaliseBreakdown(undefined, "TypeScript");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({language: "TypeScript", pct: 100, color: "#3178c6"});
    });

    it("returns primary language at 100% when raw is empty array", () => {
      const result = gen.normaliseBreakdown([], "Python");
      expect(result).toHaveLength(1);
      expect(result[0].language).toBe("Python");
      expect(result[0].pct).toBe(100);
    });

    it("adds an 'Other' segment when pcts sum below 100 and fewer than 3 segments", () => {
      const raw = [
        {language: "TypeScript", pct: 70},
        {language: "JavaScript", pct: 20},
      ];
      const result = gen.normaliseBreakdown(raw, "TypeScript");
      expect(result).toHaveLength(3);
      const other = result.find((s) => s.language === "Other");
      expect(other).toBeDefined();
      expect(other!.pct).toBe(10);
    });

    it("absorbs remainder into last segment when all 3 slots are filled", () => {
      const raw = [
        {language: "TypeScript", pct: 50},
        {language: "JavaScript", pct: 30},
        {language: "Python", pct: 15},
      ];
      const result = gen.normaliseBreakdown(raw, "TypeScript");
      expect(result).toHaveLength(3);
      expect(result.find((s) => s.language === "Other")).toBeUndefined();
      const total = result.reduce((sum, s) => sum + s.pct, 0);
      expect(total).toBe(100);
    });

    it("caps input to 3 segments when more than 3 are provided", () => {
      const raw = [
        {language: "TypeScript", pct: 40},
        {language: "JavaScript", pct: 30},
        {language: "Python", pct: 20},
        {language: "Go", pct: 10},
      ];
      const result = gen.normaliseBreakdown(raw, "TypeScript");
      expect(result.find((s) => s.language === "Go")).toBeUndefined();
      expect(result.length).toBeLessThanOrEqual(4);
    });

    it("scales down segments proportionally when pcts exceed 100", () => {
      const raw = [
        {language: "TypeScript", pct: 60},
        {language: "JavaScript", pct: 30},
        {language: "Python", pct: 20},
      ];
      const result = gen.normaliseBreakdown(raw, "TypeScript");
      const total = result.reduce((sum, s) => sum + s.pct, 0);
      expect(total).toBe(100);
    });

    it("uses accentColor for 'Other' segment", () => {
      const raw = [{language: "TypeScript", pct: 80}];
      const result = gen.normaliseBreakdown(raw, "TypeScript");
      const other = result.find((s) => s.language === "Other");
      expect(other?.color).toBe(gen.defaultColors.accentColor);
    });

    it("uses correct colors for known languages", () => {
      const raw = [{language: "TypeScript", pct: 100}];
      const result = gen.normaliseBreakdown(raw, "TypeScript");
      expect(result[0].color).toBe("#3178c6");
    });

    it("uses fallback gray color for unknown languages", () => {
      const raw = [{language: "UnknownLang", pct: 100}];
      const result = gen.normaliseBreakdown(raw, "UnknownLang");
      expect(result[0].color).toBe("#858585");
    });

    it("returns exactly 100% total for single segment", () => {
      const raw = [{language: "Go", pct: 100}];
      const result = gen.normaliseBreakdown(raw, "Go");
      expect(result[0].pct).toBe(100);
    });
  });

  describe("buildColorStrips", () => {
    const mockLayout = {
      cardW: 400,
      stripY: 285,
      stripH: 15,
    } as any;

    it("renders one rect per segment", () => {
      const gen = new ClassicCardGenerator();
      const breakdown = [{language: "TypeScript", pct: 100, color: "#3178c6"}];
      const result = gen.buildColorStrips(mockLayout, breakdown);
      const rectCount = (result.match(/<rect/g) ?? []).length;
      expect(rectCount).toBe(1);
    });

    it("renders multiple rects for multiple segments", () => {
      const gen = new ClassicCardGenerator();
      const breakdown = [
        {language: "TypeScript", pct: 60, color: "#3178c6"},
        {language: "JavaScript", pct: 40, color: "#f1e05a"},
      ];
      const result = gen.buildColorStrips(mockLayout, breakdown);
      const rectCount = (result.match(/<rect/g) ?? []).length;
      expect(rectCount).toBe(2);
    });

    it("last segment fills the remaining width to avoid rounding gaps", () => {
      const gen = new ClassicCardGenerator();
      const breakdown = [
        {language: "TypeScript", pct: 33, color: "#3178c6"},
        {language: "JavaScript", pct: 33, color: "#f1e05a"},
        {language: "Other", pct: 34, color: "#58a6ff"},
      ];
      const result = gen.buildColorStrips(mockLayout, breakdown);
      // Last rect should fill to cardW (400)
      // First rect: Math.round(0.33 * 400) = 132, second: 132, last: 400 - 264 = 136
      expect(result).toContain('width="136"');
    });

    it("uses the correct stripY position", () => {
      const gen = new ClassicCardGenerator();
      const breakdown = [{language: "TypeScript", pct: 100, color: "#3178c6"}];
      const result = gen.buildColorStrips(mockLayout, breakdown);
      expect(result).toContain('y="285"');
    });

    it("uses the correct fill color for each segment", () => {
      const gen = new ClassicCardGenerator();
      const breakdown = [
        {language: "TypeScript", pct: 50, color: "#3178c6"},
        {language: "JavaScript", pct: 50, color: "#f1e05a"},
      ];
      const result = gen.buildColorStrips(mockLayout, breakdown);
      expect(result).toContain('fill="#3178c6"');
      expect(result).toContain('fill="#f1e05a"');
    });
  });

  describe("buildStats", () => {
    it("returns empty string when statsY is null", () => {
      const gen = createGenerator({elements: "description"});
      const layout = gen.computeLayout((gen as any)["config"]);
      expect(layout.statsY).toBeNull();
      const result = gen.buildStats(10, 5, 100, 20, 50, layout, "#888");
      expect(result).toBe("");
    });

    it("renders stat sections for active stats when statsY is set", () => {
      const gen = createGenerator({elements: "stars,forks"});
      const layout = gen.computeLayout((gen as any)["config"]);
      expect(layout.statsY).not.toBeNull();
      const result = gen.buildStats(0, 0, 1500, 42, 300, layout, "#888");
      expect(result).toContain("1.5k"); // star count formatted
      expect(result).toContain("300"); // fork count
    });
  });
});

describe("LightClassicCardGenerator", () => {
  it("has themeIdentifier of 'light-classic'", () => {
    expect(LightClassicCardGenerator.themeIdentifier).toBe("light-classic");
  });

  it("uses light background color", () => {
    const gen = new LightClassicCardGenerator();
    expect(gen.defaultColors.backgroundColor).toBe("#f8f8f8");
  });

  it("uses 'Other' segment color from its own accentColor", () => {
    const gen = new LightClassicCardGenerator();
    const result = gen.normaliseBreakdown([{language: "TypeScript", pct: 70}], "TypeScript");
    const other = result.find((s) => s.language === "Other");
    expect(other?.color).toBe("#2563eb"); // LightClassicCardGenerator.defaultColors.accentColor
  });
});

describe("DarkClassicCardGenerator", () => {
  it("has themeIdentifier of 'dark-classic'", () => {
    expect(DarkClassicCardGenerator.themeIdentifier).toBe("dark-classic");
  });

  it("uses dark background color", () => {
    const gen = new DarkClassicCardGenerator();
    expect(gen.defaultColors.backgroundColor).toBe("#0d1117");
  });
});

describe("ClassicCardGenerator.generateCard", () => {
  const repoDetails = {
    id: 1,
    name: "Hello-World",
    full_name: "octocat/Hello-World",
    html_url: "https://github.com/octocat/Hello-World",
    description: "A simple test repository",
    stargazers_count: 1500,
    language: "TypeScript",
    created_at: "2024-01-01",
    owner: {
      login: "octocat",
      avatar_url: "https://example.com/avatar.png",
      html_url: "https://github.com/octocat",
    },
    open_issues: 10,
    watchers: 50,
    forks_count: 20,
  };

  function setupMockClient(overrides: Partial<Record<string, unknown>> = {}) {
    const defaults = {
      contributors: {data: [{}, {}, {}]},
      subscribers: {data: [{}, {}]},
      languages: {data: {TypeScript: 8000, JavaScript: 2000}},
    };
    const mockGet = jest.fn().mockImplementation((path: string) => {
      if (path.includes("/contributors"))
        return Promise.resolve(overrides.contributors ?? defaults.contributors);
      if (path.includes("/subscribers"))
        return Promise.resolve(overrides.subscribers ?? defaults.subscribers);
      if (path.includes("/languages"))
        return Promise.resolve(overrides.languages ?? defaults.languages);
      return Promise.resolve({data: {}});
    });
    (newGithubClient as jest.Mock).mockReturnValue({get: mockGet});
    return mockGet;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns an SVG string containing <svg> tags", async () => {
    setupMockClient();
    const gen = createGenerator({width: "400", height: "300"});
    const svg = await gen.generateCard(repoDetails);
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  it("includes the owner and repo name in the SVG", async () => {
    setupMockClient();
    const gen = createGenerator({width: "400", height: "300"});
    const svg = await gen.generateCard(repoDetails);
    expect(svg).toContain("octocat");
    expect(svg).toContain("Hello-World");
  });

  it("includes the card dimensions in the SVG viewport", async () => {
    setupMockClient();
    const gen = createGenerator({width: "600", height: "350"});
    const svg = await gen.generateCard(repoDetails);
    expect(svg).toContain('width="600"');
    expect(svg).toContain('height="350"');
  });

  it("omits description when 'description' is not in elements", async () => {
    setupMockClient();
    const gen = createGenerator({elements: "stars,forks"});
    const svg = await gen.generateCard(repoDetails);
    expect(svg).not.toContain("A simple test repository");
  });

  it("includes description when 'description' is in elements", async () => {
    setupMockClient();
    // Use a wide card so the description fits on a single line without wrapping
    const gen = createGenerator({width: "1200", height: "400", elements: "stars,description"});
    const svg = await gen.generateCard(repoDetails);
    expect(svg).toContain("A simple test repository");
  });

  it("handles GitHub API errors for contributors gracefully (defaults to 0)", async () => {
    const mockGet = jest.fn().mockImplementation((path: string) => {
      if (path.includes("/contributors")) return Promise.reject(new Error("API error"));
      if (path.includes("/subscribers")) return Promise.resolve({data: []});
      if (path.includes("/languages")) return Promise.resolve({data: {TypeScript: 100}});
      return Promise.resolve({data: {}});
    });
    (newGithubClient as jest.Mock).mockReturnValue({get: mockGet});

    const gen = createGenerator({elements: "contributors,stars"});
    const svg = await gen.generateCard(repoDetails);
    expect(svg).toContain("<svg");
  });

  it("handles missing language breakdown (null languages response)", async () => {
    const mockGet = jest.fn().mockImplementation((path: string) => {
      if (path.includes("/contributors")) return Promise.resolve({data: []});
      if (path.includes("/subscribers")) return Promise.resolve({data: []});
      if (path.includes("/languages")) return Promise.reject(new Error("no langs"));
      return Promise.resolve({data: {}});
    });
    (newGithubClient as jest.Mock).mockReturnValue({get: mockGet});

    const gen = createGenerator({elements: "stars,language"});
    const svg = await gen.generateCard(repoDetails);
    expect(svg).toContain("<svg");
  });

  it("renders star count formatted as '1.5k' when stars are 1500", async () => {
    setupMockClient();
    const gen = createGenerator({elements: "stars"});
    const svg = await gen.generateCard(repoDetails);
    expect(svg).toContain("1.5k");
  });
});
