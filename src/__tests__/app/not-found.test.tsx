import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import NotFound from "@/app/not-found";

const mockBack = jest.fn();
const mockPathname = "/some/missing/page";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => mockPathname),
  useRouter: jest.fn(() => ({back: mockBack})),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({children, href}: {children: React.ReactNode; href: string}) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock("@/components/Header", () => ({
  __esModule: true,
  default: () => <header data-testid="header" />,
}));

jest.mock("@/components/Footer", () => ({
  __esModule: true,
  default: () => <footer data-testid="footer" />,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    asChild,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    size?: string;
    variant?: string;
  }) =>
    asChild ? (
      <div onClick={onClick} {...props}>
        {children}
      </div>
    ) : (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    ),
}));

describe("NotFound (404 page)", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation();
    mockBack.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the 404 heading", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", {level: 1})).toHaveTextContent("404");
  });

  it("renders the 'Page not found' sub-heading", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", {level: 2})).toHaveTextContent(/page not found/i);
  });

  it("renders a description about the missing page", () => {
    render(<NotFound />);
    expect(screen.getByText(/wandered off into the digital void/i)).toBeInTheDocument();
  });

  it("renders a 'Return to Home' link pointing to '/'", () => {
    render(<NotFound />);
    const homeLink = screen.getByRole("link", {name: /return to home/i});
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("renders a 'Go Back' button", () => {
    render(<NotFound />);
    expect(screen.getByRole("button", {name: /go back/i})).toBeInTheDocument();
  });

  it("calls router.back() when the 'Go Back' button is clicked", () => {
    render(<NotFound />);
    fireEvent.click(screen.getByRole("button", {name: /go back/i}));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("logs the current pathname as a 404 error on mount", () => {
    render(<NotFound />);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("404"),
      expect.stringContaining(mockPathname),
    );
  });

  it("renders the Header component", () => {
    render(<NotFound />);
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  it("renders the Footer component", () => {
    render(<NotFound />);
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});
