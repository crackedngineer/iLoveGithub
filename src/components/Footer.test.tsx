import {render, screen} from "@testing-library/react";
import type {ComponentProps} from "react";
import Footer from "./Footer";

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: ComponentProps<"img">) => {
    return (
      // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
      <img {...props} />
    );
  },
}));

describe("Footer Component", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-01"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders without crashing", () => {
    render(<Footer />);
    expect(screen.getByText(/iLoveGithub/i)).toBeInTheDocument();
  });

  it("displays the current year dynamically", () => {
    render(<Footer />);
    expect(screen.getByText(/© 2024 iLoveGithub/i)).toBeInTheDocument();
  });

  it("displays 'Made in' and 'by' texts", () => {
    render(<Footer />);
    expect(screen.getByText(/Made in/i)).toBeInTheDocument();
    expect(screen.getByText(/by/i)).toBeInTheDocument();
  });

  it("displays creator name as link with correct attributes", () => {
    render(<Footer />);
    const link = screen.getByRole("link", {name: /subhomoy roy choudhury/i});
    expect(link).toHaveAttribute("href", "https://github.com/crackedngineer/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveClass(
      "hover:text-github-blue",
      "dark:hover:text-white",
      "transition-colors",
    );
  });

  it("renders Indian flag image with correct attributes", () => {
    render(<Footer />);
    const flag = screen.getByAltText("Indian Flag") as HTMLImageElement;
    expect(flag).toBeInTheDocument();
    expect(flag.src).toContain("/icons/indian-flag.svg");
    expect(flag.width).toBe(18);
    expect(flag.height).toBe(18);
  });

  it("renders footer with correct styling classes", () => {
    const {container} = render(<Footer />);
    const footer = container.querySelector("footer");
    expect(footer).toHaveClass(
      "w-full",
      "py-6",
      "px-4",
      "sm:px-6",
      "bg-github-light-gray",
      "dark:bg-github-dark-blue",
      "border-t",
      "border-gray-200",
      "dark:border-gray-800",
    );
  });

  it("renders separator correctly", () => {
    const {container} = render(<Footer />);
    const separator = container.querySelector(".hidden.sm\\:inline");
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveTextContent("•");
  });

  it("groups creator info correctly", () => {
    render(<Footer />);
    const para = screen.getByText("Made in").closest("p");
    expect(para?.textContent).toContain("Made in");
    expect(para?.textContent).toContain("by");
    expect(para?.textContent).toContain("Subhomoy Roy Choudhury");
  });

  it("matches snapshot", () => {
    const {container} = render(<Footer />);
    expect(container).toMatchSnapshot();
  });
});
