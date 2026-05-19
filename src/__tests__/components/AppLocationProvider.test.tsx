import React from "react";
import {render, screen, waitFor, act} from "@testing-library/react";
import {AppLocationProvider, useAppLocation} from "@/components/AppLocationProvider";

// Consumer component that exposes context values
function LocationConsumer() {
  const ctx = useAppLocation();
  return (
    <div>
      <span data-testid="is-in-india">{String(ctx.isInIndia)}</span>
      <span data-testid="timezone">{ctx.timeZone}</span>
      <span data-testid="error">{ctx.error ?? "none"}</span>
      <span data-testid="loading">{ctx.loading ? "loading" : "done"}</span>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AppLocationProvider>
      <LocationConsumer />
    </AppLocationProvider>,
  );
}

describe("AppLocationProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("when Geolocation API is not available", () => {
    beforeEach(() => {
      Object.defineProperty(global.navigator, "geolocation", {
        value: undefined,
        writable: true,
        configurable: true,
      });
    });

    it("sets an error message when geolocation is not supported", async () => {
      renderWithProvider();
      await waitFor(() =>
        expect(screen.getByTestId("error").textContent).toBe("Geolocation not supported"),
      );
    });

    it("stops loading after the geolocation error", async () => {
      renderWithProvider();
      await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("done"));
    });
  });

  describe("when user is inside India", () => {
    beforeEach(() => {
      Object.defineProperty(global.navigator, "geolocation", {
        value: {
          getCurrentPosition: jest.fn().mockImplementation((successCb) => {
            successCb({coords: {latitude: 20.5, longitude: 78.9}});
          }),
        },
        writable: true,
        configurable: true,
      });
    });

    it("sets isInIndia to true for coordinates within India's bounding box", async () => {
      renderWithProvider();
      await waitFor(() => expect(screen.getByTestId("is-in-india").textContent).toBe("true"));
    });

    it("stops loading after the position is obtained", async () => {
      renderWithProvider();
      await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("done"));
    });
  });

  describe("when user is outside India", () => {
    beforeEach(() => {
      Object.defineProperty(global.navigator, "geolocation", {
        value: {
          getCurrentPosition: jest.fn().mockImplementation((successCb) => {
            // New York City coordinates
            successCb({coords: {latitude: 40.7128, longitude: -74.006}});
          }),
        },
        writable: true,
        configurable: true,
      });
    });

    it("sets isInIndia to false for coordinates outside India", async () => {
      renderWithProvider();
      await waitFor(() => expect(screen.getByTestId("is-in-india").textContent).toBe("false"));
    });
  });

  describe("when geolocation returns an error", () => {
    beforeEach(() => {
      Object.defineProperty(global.navigator, "geolocation", {
        value: {
          getCurrentPosition: jest.fn().mockImplementation((_success, errorCb) => {
            errorCb({message: "User denied geolocation"});
          }),
        },
        writable: true,
        configurable: true,
      });
    });

    it("propagates the geolocation error message to context", async () => {
      renderWithProvider();
      await waitFor(() =>
        expect(screen.getByTestId("error").textContent).toBe("User denied geolocation"),
      );
    });

    it("stops loading after the geolocation error callback fires", async () => {
      renderWithProvider();
      await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("done"));
    });
  });

  it("exposes the current timezone", () => {
    Object.defineProperty(global.navigator, "geolocation", {
      value: {getCurrentPosition: jest.fn()},
      writable: true,
      configurable: true,
    });
    renderWithProvider();
    const timezone = screen.getByTestId("timezone").textContent;
    expect(typeof timezone).toBe("string");
    expect(timezone!.length).toBeGreaterThan(0);
  });
});

describe("useAppLocation hook", () => {
  it("throws when used outside an AppLocationProvider", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    expect(() => render(<LocationConsumer />)).toThrow(
      "useLocation must be used within a LocationProvider",
    );
    consoleError.mockRestore();
  });
});

describe("India bounding-box edge cases", () => {
  function setGeolocation(lat: number, lng: number) {
    Object.defineProperty(global.navigator, "geolocation", {
      value: {
        getCurrentPosition: jest.fn().mockImplementation((cb) => {
          cb({coords: {latitude: lat, longitude: lng}});
        }),
      },
      writable: true,
      configurable: true,
    });
  }

  it("classifies exactly the southern boundary (lat 6.5546) as inside India", async () => {
    setGeolocation(6.5546, 78.0);
    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("is-in-india").textContent).toBe("true"));
  });

  it("classifies latitude below the southern boundary as outside India", async () => {
    setGeolocation(6.0, 78.0);
    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("is-in-india").textContent).toBe("false"));
  });

  it("classifies exactly the western boundary (lng 68.1114) as inside India", async () => {
    setGeolocation(20.0, 68.1114);
    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("is-in-india").textContent).toBe("true"));
  });

  it("classifies longitude west of the western boundary as outside India", async () => {
    setGeolocation(20.0, 60.0);
    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("is-in-india").textContent).toBe("false"));
  });
});
