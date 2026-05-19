import React from "react";
import {render, screen, waitFor, act} from "@testing-library/react";
import {ApiLimitProvider, useApiLimit} from "@/components/ApiLimitContext";
import {fetchRateLimit, RateLimitError} from "@/services/github";

jest.mock("@/services/github", () => {
  class MockRateLimitError extends Error {
    response: Record<string, number>;
    constructor(response: Record<string, number>) {
      super("GitHub API rate limit exceeded");
      this.name = "RateLimitError";
      this.response = response;
    }
  }
  return {
    fetchRateLimit: jest.fn(),
    RateLimitError: MockRateLimitError,
  };
});

const mockFetchRateLimit = fetchRateLimit as jest.Mock;
const MockRateLimitError = RateLimitError as unknown as new (r: Record<string, number>) => Error;

// Helper component that exposes context values via data-testid attributes
function RateLimitConsumer() {
  const ctx = useApiLimit();
  return (
    <div>
      <span data-testid="percentage">{ctx.getPercentage()}</span>
      <span data-testid="color">{ctx.getColor()}</span>
      <span data-testid="reset-time">{ctx.getResetTime()}</span>
      <span data-testid="error">{ctx.apiLimitError ?? "none"}</span>
      <span data-testid="remaining">{ctx.remaining}</span>
      <span data-testid="limit">{ctx.limit}</span>
      <span data-testid="loading">{ctx.isApiLimitLoading ? "loading" : "done"}</span>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <ApiLimitProvider>
      <RateLimitConsumer />
    </ApiLimitProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ApiLimitProvider", () => {
  it("renders children without crashing", () => {
    mockFetchRateLimit.mockResolvedValue({limit: 60, remaining: 50, reset: 9999, used: 10});
    render(
      <ApiLimitProvider>
        <span data-testid="child">hello</span>
      </ApiLimitProvider>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("calls fetchRateLimit once on mount", async () => {
    mockFetchRateLimit.mockResolvedValue({limit: 60, remaining: 50, reset: 9999, used: 10});
    renderWithProvider();
    await waitFor(() => expect(mockFetchRateLimit).toHaveBeenCalledTimes(1));
  });

  it("populates remaining and limit from the API response", async () => {
    mockFetchRateLimit.mockResolvedValue({limit: 60, remaining: 45, reset: 9999, used: 15});
    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("remaining").textContent).toBe("45"));
    expect(screen.getByTestId("limit").textContent).toBe("60");
  });

  it("sets apiLimitError when fetchRateLimit throws a generic error", async () => {
    mockFetchRateLimit.mockRejectedValue(new Error("network error"));
    renderWithProvider();
    await waitFor(() =>
      expect(screen.getByTestId("error").textContent).toBe("Failed to fetch GitHub rate limit."),
    );
  });

  it("sets a specific error message when a RateLimitError is thrown", async () => {
    mockFetchRateLimit.mockRejectedValue(
      new MockRateLimitError({limit: 60, remaining: 0, reset: 9999, used: 60}),
    );
    renderWithProvider();
    await waitFor(() =>
      expect(screen.getByTestId("error").textContent).toBe("GitHub API rate limit exceeded."),
    );
  });

  it("sets a specific error when fetchRateLimit resolves with remaining = 0", async () => {
    const zeroResponse = {limit: 60, remaining: 0, reset: 9999, used: 60};
    // The provider throws RateLimitError internally when remaining === 0
    mockFetchRateLimit.mockResolvedValue(zeroResponse);
    renderWithProvider();
    await waitFor(() =>
      expect(screen.getByTestId("error").textContent).toBe("GitHub API rate limit exceeded."),
    );
  });
});

describe("useApiLimit hook", () => {
  it("throws an error when used outside an ApiLimitProvider", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    expect(() => render(<RateLimitConsumer />)).toThrow(
      "useApiLimit must be used within an ApiLimitProvider",
    );
    consoleError.mockRestore();
  });
});

describe("getPercentage()", () => {
  it("returns 0 when no rateLimit data has loaded yet", async () => {
    // Mock a never-resolving promise so data never loads
    mockFetchRateLimit.mockReturnValue(new Promise(() => {}));
    renderWithProvider();
    // Before fetch resolves, percentage should be 0
    expect(screen.getByTestId("percentage").textContent).toBe("0");
  });

  it("returns the correct percentage after data loads", async () => {
    mockFetchRateLimit.mockResolvedValue({limit: 60, remaining: 30, reset: 9999, used: 30});
    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("percentage").textContent).toBe("50"));
  });

  it("returns 100 when all requests are remaining", async () => {
    mockFetchRateLimit.mockResolvedValue({limit: 60, remaining: 60, reset: 9999, used: 0});
    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("percentage").textContent).toBe("100"));
  });
});

describe("getColor()", () => {
  it("returns 'github-green' when percentage is above 50", async () => {
    mockFetchRateLimit.mockResolvedValue({limit: 60, remaining: 40, reset: 9999, used: 20});
    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("color").textContent).toBe("github-green"));
  });

  it("returns 'yellow-500' when percentage is between 21 and 50", async () => {
    mockFetchRateLimit.mockResolvedValue({limit: 100, remaining: 30, reset: 9999, used: 70});
    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("color").textContent).toBe("yellow-500"));
  });

  it("returns 'red-500' when percentage is 20 or below", async () => {
    mockFetchRateLimit.mockResolvedValue({limit: 100, remaining: 10, reset: 9999, used: 90});
    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("color").textContent).toBe("red-500"));
  });

  it("returns 'red-500' when percentage is exactly 0", async () => {
    // Never resolves, so percentage stays 0
    mockFetchRateLimit.mockReturnValue(new Promise(() => {}));
    renderWithProvider();
    expect(screen.getByTestId("color").textContent).toBe("red-500");
  });
});

describe("getResetTime()", () => {
  it("returns 'N/A' when no rateLimit data has loaded", () => {
    mockFetchRateLimit.mockReturnValue(new Promise(() => {}));
    renderWithProvider();
    expect(screen.getByTestId("reset-time").textContent).toBe("N/A");
  });

  it("returns 'Resetting now...' when the reset time is in the past", async () => {
    const pastReset = Math.floor(Date.now() / 1000) - 10;
    mockFetchRateLimit.mockResolvedValue({limit: 60, remaining: 30, reset: pastReset, used: 30});
    renderWithProvider();
    await waitFor(() =>
      expect(screen.getByTestId("reset-time").textContent).toBe("Resetting now..."),
    );
  });

  it("returns a formatted minutes and seconds string for a future reset time", async () => {
    const futureReset = Math.floor(Date.now() / 1000) + 125; // 2m 5s from now
    mockFetchRateLimit.mockResolvedValue({limit: 60, remaining: 30, reset: futureReset, used: 30});
    renderWithProvider();
    await waitFor(() => {
      const resetText = screen.getByTestId("reset-time").textContent ?? "";
      expect(resetText).toMatch(/\d+m \d+s/);
    });
  });
});
