import React from "react";
import {render, screen} from "@testing-library/react";
import VideoModal from "@/components/VideoModal";

jest.mock("@/constants", () => ({
  DEMO_VIDEO_URL: "https://youtube.com/embed/test?autoplay=1",
}));

// Minimal Dialog mock — renders content only when open=true
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (v: boolean) => void;
  }) => (
    <div>
      {open && <div role="dialog">{children}</div>}
      <button data-testid="dialog-dismiss" onClick={() => onOpenChange(false)} />
    </div>
  ),
  DialogContent: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
  DialogOverlay: () => <div data-testid="dialog-overlay" />,
}));

describe("VideoModal", () => {
  it("renders nothing visible when isOpen is false", () => {
    render(<VideoModal isOpen={false} onClose={jest.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the dialog when isOpen is true", () => {
    render(<VideoModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders an iframe with the demo video URL when open", () => {
    render(<VideoModal isOpen={true} onClose={jest.fn()} />);
    const iframe = screen.getByTitle("Video");
    expect(iframe).toHaveAttribute("src", "https://youtube.com/embed/test?autoplay=1");
  });

  it("renders the iframe with allowFullScreen attribute", () => {
    render(<VideoModal isOpen={true} onClose={jest.fn()} />);
    const iframe = screen.getByTitle("Video");
    expect(iframe).toHaveAttribute("allowFullScreen");
  });

  it("includes autoplay in the iframe allow attribute", () => {
    render(<VideoModal isOpen={true} onClose={jest.fn()} />);
    const iframe = screen.getByTitle("Video");
    expect(iframe).toHaveAttribute("allow", expect.stringContaining("autoplay"));
  });

  it("calls onClose when the dialog signals it should close", () => {
    const onClose = jest.fn();
    render(<VideoModal isOpen={true} onClose={onClose} />);
    screen.getByTestId("dialog-dismiss").click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
