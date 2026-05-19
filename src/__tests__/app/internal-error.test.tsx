import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import InternalError from "@/app/internal-error";

const mockBack = jest.fn();
const mockPathname = "/api/broken-route";

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
      <>{children}</>
    ) : (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    ),
}));

describe("InternalError (500 page)", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation();
    mockBack.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the 500 heading", () => {
    render(<InternalError />);
    expect(screen.getByRole("heading", {level: 1})).toHaveTextContent("500");
  });

  it("renders the 'Something went wrong' sub-heading", () => {
    render(<InternalError />);
    expect(screen.getByRole("heading", {level: 2})).toHaveTextContent(/something went wrong/i);
  });

  it("renders a description asking the user to try again later", () => {
    render(<InternalError />);
    expect(screen.getByText(/try again later/i)).toBeInTheDocument();
  });

  it("renders a 'Return to Home' link pointing to '/'", () => {
    render(<InternalError />);
    const homeLink = screen.getByRole("link", {name: /return to home/i});
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("renders a 'Go Back' button", () => {
    render(<InternalError />);
    expect(screen.getByRole("button", {name: /go back/i})).toBeInTheDocument();
  });

  it("calls router.back() when the 'Go Back' button is clicked", () => {
    render(<InternalError />);
    fireEvent.click(screen.getByRole("button", {name: /go back/i}));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("logs the current pathname as a 500 error on mount", () => {
    render(<InternalError />);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("500"),
      expect.stringContaining(mockPathname),
    );
  });

  it("renders the Header component", () => {
    render(<InternalError />);
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  it("renders the Footer component", () => {
    render(<InternalError />);
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});
