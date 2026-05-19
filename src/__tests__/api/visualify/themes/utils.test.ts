import {escapeXml, formatNumber, truncateText} from "@/app/api/visualify/generate/themes/utils";

describe("formatNumber", () => {
  describe("numbers below 1000", () => {
    it("returns '0' for zero", () => {
      expect(formatNumber(0)).toBe("0");
    });

    it("returns string representation for single digits", () => {
      expect(formatNumber(1)).toBe("1");
      expect(formatNumber(9)).toBe("9");
    });

    it("returns string representation for three-digit numbers", () => {
      expect(formatNumber(999)).toBe("999");
      expect(formatNumber(500)).toBe("500");
    });
  });

  describe("thousands formatting", () => {
    it("formats exactly 1000 as '1.0k'", () => {
      expect(formatNumber(1000)).toBe("1.0k");
    });

    it("formats 1500 as '1.5k'", () => {
      expect(formatNumber(1500)).toBe("1.5k");
    });

    it("formats mid-thousands correctly", () => {
      expect(formatNumber(4200)).toBe("4.2k");
      expect(formatNumber(10000)).toBe("10.0k");
    });
  });

  describe("millions formatting", () => {
    it("formats exactly 1000000 as '1.0M'", () => {
      expect(formatNumber(1000000)).toBe("1.0M");
    });

    it("formats 1500000 as '1.5M'", () => {
      expect(formatNumber(1500000)).toBe("1.5M");
    });

    it("formats large millions correctly", () => {
      expect(formatNumber(5000000)).toBe("5.0M");
    });
  });

  describe("negative numbers", () => {
    it("returns string representation for negative numbers below -1000", () => {
      expect(formatNumber(-1)).toBe("-1");
      expect(formatNumber(-999)).toBe("-999");
    });

    it("does not apply 'k' suffix to negative thousands", () => {
      // -1000 < 1000 threshold so no suffix applied
      expect(formatNumber(-1000)).toBe("-1000");
    });
  });
});

describe("escapeXml", () => {
  it("returns empty string unchanged", () => {
    expect(escapeXml("")).toBe("");
  });

  it("returns plain text without special characters unchanged", () => {
    expect(escapeXml("Hello World")).toBe("Hello World");
  });

  it("escapes ampersand to &amp;", () => {
    expect(escapeXml("a&b")).toBe("a&amp;b");
  });

  it("escapes less-than to &lt;", () => {
    expect(escapeXml("a<b")).toBe("a&lt;b");
  });

  it("escapes greater-than to &gt;", () => {
    expect(escapeXml("a>b")).toBe("a&gt;b");
  });

  it("escapes double quote to &quot;", () => {
    expect(escapeXml('say "hello"')).toBe("say &quot;hello&quot;");
  });

  it("does not escape single quotes", () => {
    expect(escapeXml("it's fine")).toBe("it's fine");
  });

  it("escapes multiple special characters in one string", () => {
    expect(escapeXml('<script>alert("xss")</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
    );
  });

  it("escapes ampersand before other characters to avoid double-encoding", () => {
    expect(escapeXml("&amp;")).toBe("&amp;amp;");
  });

  it("handles a mix of safe and unsafe characters", () => {
    expect(escapeXml("owner/repo & more <info>")).toBe("owner/repo &amp; more &lt;info&gt;");
  });
});

describe("truncateText", () => {
  it("returns text unchanged when shorter than maxChars", () => {
    expect(truncateText("Hello", 10)).toBe("Hello");
  });

  it("returns text unchanged when length equals maxChars", () => {
    expect(truncateText("Hello", 5)).toBe("Hello");
  });

  it("truncates and appends ellipsis when longer than maxChars", () => {
    expect(truncateText("Hello World!", 10)).toBe("Hello Wor…");
  });

  it("truncates to exactly maxChars - 1 chars plus ellipsis", () => {
    const text = "ABCDE";
    const result = truncateText(text, 4);
    expect(result).toBe("ABC…");
  });

  it("returns empty string unchanged", () => {
    expect(truncateText("", 5)).toBe("");
  });

  it("handles a single character string within limit", () => {
    expect(truncateText("A", 1)).toBe("A");
  });

  it("truncates a single long word correctly", () => {
    expect(truncateText("superlongword", 6)).toBe("super…");
  });
});
