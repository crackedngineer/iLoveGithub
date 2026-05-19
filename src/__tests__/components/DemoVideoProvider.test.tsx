import React from "react";
import {render, screen, act} from "@testing-library/react";
import DemoVideoProvider, {useDemoVideo} from "@/components/DemoVideoProvider";

// Track what VideoModal receives
let lastVideoModalProps: {isOpen: boolean; onClose: () => void} = {
  isOpen: false,
  onClose: () => {},
};

jest.mock("@/components/VideoModal", () => ({
  __esModule: true,
  default: ({isOpen, onClose}: {isOpen: boolean; onClose: () => void}) => {
    lastVideoModalProps = {isOpen, onClose};
    return <div data-testid="video-modal" data-open={String(isOpen)} />;
  },
}));

// Consumer that calls openVideoModal on click
function ModalOpener() {
  const {openVideoModal} = useDemoVideo();
  return (
    <button data-testid="open-btn" onClick={openVideoModal}>
      Open
    </button>
  );
}

describe("DemoVideoProvider", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
    // Ensure desktop width so auto-show logic triggers
    Object.defineProperty(window, "innerWidth", {value: 1024, writable: true, configurable: true});
    lastVideoModalProps = {isOpen: false, onClose: () => {}};
  });

  afterEach(() => {
    jest.useRealTimers();
    localStorage.clear();
  });

  it("renders its children", () => {
    render(
      <DemoVideoProvider>
        <span data-testid="child">content</span>
      </DemoVideoProvider>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders the VideoModal in a closed state initially", () => {
    render(
      <DemoVideoProvider>
        <span />
      </DemoVideoProvider>,
    );
    expect(screen.getByTestId("video-modal")).toHaveAttribute("data-open", "false");
  });

  it("opens the VideoModal automatically after 6 seconds on desktop when not seen before", async () => {
    render(
      <DemoVideoProvider>
        <span />
      </DemoVideoProvider>,
    );

    expect(screen.getByTestId("video-modal")).toHaveAttribute("data-open", "false");

    await act(async () => {
      jest.advanceTimersByTime(6000);
    });

    expect(screen.getByTestId("video-modal")).toHaveAttribute("data-open", "true");
  });

  it("does not auto-open on mobile (width <= 768px)", async () => {
    Object.defineProperty(window, "innerWidth", {value: 375, writable: true, configurable: true});
    render(
      <DemoVideoProvider>
        <span />
      </DemoVideoProvider>,
    );

    await act(async () => {
      jest.advanceTimersByTime(6000);
    });

    expect(screen.getByTestId("video-modal")).toHaveAttribute("data-open", "false");
  });

  it("does not auto-open when demoVideoSeen is already set in localStorage", async () => {
    localStorage.setItem("demoVideoSeen", "true");
    render(
      <DemoVideoProvider>
        <span />
      </DemoVideoProvider>,
    );

    await act(async () => {
      jest.advanceTimersByTime(6000);
    });

    expect(screen.getByTestId("video-modal")).toHaveAttribute("data-open", "false");
  });

  it("marks the video as seen in localStorage when auto-opened", async () => {
    render(
      <DemoVideoProvider>
        <span />
      </DemoVideoProvider>,
    );

    await act(async () => {
      jest.advanceTimersByTime(6000);
    });

    expect(localStorage.getItem("demoVideoSeen")).toBe("true");
  });

  it("opens the VideoModal immediately when openVideoModal is called", async () => {
    render(
      <DemoVideoProvider>
        <ModalOpener />
      </DemoVideoProvider>,
    );

    await act(async () => {
      screen.getByTestId("open-btn").click();
    });

    expect(screen.getByTestId("video-modal")).toHaveAttribute("data-open", "true");
  });

  it("sets demoVideoSeen in localStorage when openVideoModal is called manually", async () => {
    render(
      <DemoVideoProvider>
        <ModalOpener />
      </DemoVideoProvider>,
    );

    await act(async () => {
      screen.getByTestId("open-btn").click();
    });

    expect(localStorage.getItem("demoVideoSeen")).toBe("true");
  });

  it("closes the VideoModal when onClose is called", async () => {
    render(
      <DemoVideoProvider>
        <ModalOpener />
      </DemoVideoProvider>,
    );

    await act(async () => {
      screen.getByTestId("open-btn").click();
    });
    expect(screen.getByTestId("video-modal")).toHaveAttribute("data-open", "true");

    await act(async () => {
      lastVideoModalProps.onClose();
    });
    expect(screen.getByTestId("video-modal")).toHaveAttribute("data-open", "false");
  });
});

describe("useDemoVideo hook", () => {
  it("throws when used outside a DemoVideoProvider", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    expect(() => render(<ModalOpener />)).toThrow(
      "useDemoVideo must be used within a DemoVideoProvider",
    );
    consoleError.mockRestore();
  });
});
