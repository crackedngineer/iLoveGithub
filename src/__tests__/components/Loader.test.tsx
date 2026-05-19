import {render, screen} from "@testing-library/react";
import Loader from "@/components/Loader";

jest.mock("@/lib/version", () => ({appVersion: "2.0.0"}));

describe("Loader", () => {
  it("renders the app name in the heading", () => {
    render(<Loader />);
    expect(screen.getByText(/iLoveGithub/i)).toBeInTheDocument();
  });

  it("displays the current app version number", () => {
    render(<Loader />);
    expect(screen.getByText(/v2\.0\.0/)).toBeInTheDocument();
  });

  it("renders the welcome text alongside the app name", () => {
    render(<Loader />);
    expect(screen.getByText(/Welcome to iLoveGithub/i)).toBeInTheDocument();
  });

  it("applies gradient text styling to the heading", () => {
    render(<Loader />);
    const heading = screen.getByRole("heading", {level: 1});
    expect(heading).toHaveClass("bg-gradient-to-r", "from-github-blue", "to-github-green");
  });

  it("applies a clip-text class so the gradient is visible", () => {
    render(<Loader />);
    const heading = screen.getByRole("heading", {level: 1});
    expect(heading).toHaveClass("bg-clip-text", "text-transparent");
  });

  it("renders a full-screen container", () => {
    const {container} = render(<Loader />);
    expect(container.firstChild).toHaveClass("h-screen");
  });

  it("centers content both horizontally and vertically", () => {
    const {container} = render(<Loader />);
    expect(container.firstChild).toHaveClass("flex", "items-center", "justify-center");
  });
});
