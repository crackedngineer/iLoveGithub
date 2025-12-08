import {cn, getHostnameFromUrl, extractSubdomainFromHostname, protocol, rootDomain} from "./utils";

describe("Utils", () => {
  describe("protocol", () => {
    it("returns correct protocol based on NODE_ENV", () => {
      expect(["http", "https"]).toContain(protocol);
    });
  });

  describe("rootDomain", () => {
    it("returns a valid domain", () => {
      expect(rootDomain).toBeDefined();
      expect(typeof rootDomain).toBe("string");
    });
  });

  describe("cn", () => {
    it("merges class names correctly", () => {
      const result = cn("class1", "class2");
      expect(result).toBe("class1 class2");
    });

    it("handles conditional classes", () => {
      const result = cn("base", false && "hidden", "visible");
      expect(result).toBe("base visible");
    });

    it("merges Tailwind classes correctly", () => {
      const result = cn("px-2 py-1", "px-4");
      expect(result).toBe("py-1 px-4");
    });

    it("handles empty inputs", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("handles null and undefined", () => {
      const result = cn("base", null, undefined, "end");
      expect(result).toBe("base end");
    });
  });

  describe("getHostnameFromUrl", () => {
    it("extracts hostname from valid http URL", () => {
      const result = getHostnameFromUrl("http://example.com/path");
      expect(result).toBe("example.com");
    });

    it("extracts hostname from valid https URL", () => {
      const result = getHostnameFromUrl("https://subdomain.example.com");
      expect(result).toBe("subdomain.example.com");
    });

    it("extracts hostname with port", () => {
      const result = getHostnameFromUrl("http://localhost:3000");
      expect(result).toBe("localhost");
    });

    it("extracts hostname from URL with query params", () => {
      const result = getHostnameFromUrl("https://example.com/path?query=value");
      expect(result).toBe("example.com");
    });

    it("returns null for invalid URL", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const result = getHostnameFromUrl("not-a-valid-url");
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith("Invalid URL:", "not-a-valid-url");
      consoleSpy.mockRestore();
    });

    it("returns null for empty string", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const result = getHostnameFromUrl("");
      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });

    it("handles URLs with special characters", () => {
      const result = getHostnameFromUrl("https://example.com/path%20with%20spaces");
      expect(result).toBe("example.com");
    });
  });

  describe("extractSubdomainFromHostname", () => {
    const originalEnv = process.env.NEXT_PUBLIC_ROOT_DOMAIN;

    beforeEach(() => {
      // Reset to default for each test
      process.env.NEXT_PUBLIC_ROOT_DOMAIN = "example.com";
    });

    afterAll(() => {
      process.env.NEXT_PUBLIC_ROOT_DOMAIN = originalEnv;
    });

    describe("root domain handling", () => {
      it("returns null for root domain", () => {
        const result = extractSubdomainFromHostname("example.com");
        expect(result).toBeNull();
      });

      it("returns null for www subdomain", () => {
        const result = extractSubdomainFromHostname("www.example.com");
        expect(result).toBeNull();
      });

      it("handles root domain with port", () => {
        process.env.NEXT_PUBLIC_ROOT_DOMAIN = "example.com:3000";
        const result = extractSubdomainFromHostname("example.com");
        expect(result).toBeNull();
      });
    });

    describe("localhost development", () => {
      beforeEach(() => {
        process.env.NEXT_PUBLIC_ROOT_DOMAIN = "localhost";
      });

      it("extracts subdomain from .localhost", () => {
        const result = extractSubdomainFromHostname("org.localhost");
        expect(result).toBe("org");
      });

      it("extracts subdomain from nested .localhost", () => {
        const result = extractSubdomainFromHostname("tenant.localhost");
        expect(result).toBe("tenant");
      });

      it("returns null for plain localhost", () => {
        const result = extractSubdomainFromHostname("localhost");
        expect(result).toBeNull();
      });

      it("returns null for 127.0.0.1", () => {
        const result = extractSubdomainFromHostname("127.0.0.1");
        expect(result).toBeNull();
      });

      it("handles localhost with http:// in rootDomain", () => {
        process.env.NEXT_PUBLIC_ROOT_DOMAIN = "http://tenant.localhost";
        const result = extractSubdomainFromHostname("tenant.localhost");
        expect(result).toBe("tenant");
      });
    });

    describe("Vercel preview deployments", () => {
      it("extracts tenant from preview URL", () => {
        const result = extractSubdomainFromHostname("myorg---branch-name.vercel.app");
        expect(result).toBe("myorg");
      });

      it("extracts tenant from preview URL with complex branch name", () => {
        const result = extractSubdomainFromHostname("tenant---feature-new-design.vercel.app");
        expect(result).toBe("tenant");
      });

      it("handles preview URL with multiple dashes", () => {
        const result = extractSubdomainFromHostname("my-org---my-branch.vercel.app");
        expect(result).toBe("my-org");
      });

      it("does not match vercel.app without ---", () => {
        const result = extractSubdomainFromHostname("myapp.vercel.app");
        expect(result).toBeNull();
      });
    });
  });
});
