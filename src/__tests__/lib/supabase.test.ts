// Mock @supabase/supabase-js before supabase.ts loads
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnThis(),
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
    },
  }),
}));

import {checkSupabaseConnection} from "@/lib/supabase";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("checkSupabaseConnection", () => {
  it("resolves when the health endpoint returns a 200 with healthy status", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({healthy: true}),
    });
    await expect(checkSupabaseConnection()).resolves.toBeUndefined();
  });

  it("resolves when the health endpoint returns a 200 with no status field", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    await expect(checkSupabaseConnection()).resolves.toBeUndefined();
  });

  it("throws when the response has a non-ok HTTP status", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({}),
    });
    await expect(checkSupabaseConnection()).rejects.toThrow("Supabase connection failed");
  });

  it("throws when the health response reports healthy: false", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({healthy: false}),
    });
    await expect(checkSupabaseConnection()).rejects.toThrow("Supabase connection failed");
  });

  it("throws when the health response reports status: 'error'", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({status: "error"}),
    });
    await expect(checkSupabaseConnection()).rejects.toThrow("Supabase connection failed");
  });

  it("throws and wraps the error message when fetch itself rejects", async () => {
    mockFetch.mockRejectedValueOnce(new Error("DNS lookup failed"));
    await expect(checkSupabaseConnection()).rejects.toThrow(
      "Supabase connection failed: DNS lookup failed",
    );
  });
});
