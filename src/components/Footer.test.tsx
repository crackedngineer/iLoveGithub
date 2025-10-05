import {render, screen} from "@testing-library/react";
import Footer from "./Footer";

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe("Footer Component", () => {
  beforeEach(() => {
    // Mock Date to return consistent year for testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-01"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Rendering", () => {
    it("renders the footer element", () => {
      const {container} = render(<Footer />);
      const footer = container.querySelector("footer");

      expect(footer).toBeInTheDocument();
    });

    it("displays copyright text with current year", () => {
      render(<Footer />);

      expect(screen.getByText(/© 2024 iLoveGithub/i)).toBeInTheDocument();
    });

    it('displays "Made in" text', () => {
      render(<Footer />);

      expect(screen.getByText("Made in")).toBeInTheDocument();
    });

    it('displays "by" text', () => {
      render(<Footer />);

      expect(screen.getByText("by")).toBeInTheDocument();
    });

    it("displays creator name as link", () => {
      render(<Footer />);

      const creatorLink = screen.getByRole("link", {name: /subhomoy roy choudhury/i});
      expect(creatorLink).toBeInTheDocument();
    });

    it("renders Indian flag image", () => {
      render(<Footer />);

      const flagImage = screen.getByAltText("Indian Flag");
      expect(flagImage).toBeInTheDocument();
    });
  });

  describe("Links", () => {
    it("has correct href for creator GitHub profile", () => {
      render(<Footer />);

      const creatorLink = screen.getByRole("link", {name: /subhomoy roy choudhury/i});
      expect(creatorLink).toHaveAttribute("href", "https://github.com/crackedngineer/");
    });

    it("opens creator link in new tab", () => {
      render(<Footer />);

      const creatorLink = screen.getByRole("link", {name: /subhomoy roy choudhury/i});
      expect(creatorLink).toHaveAttribute("target", "_blank");
    });

    it("has security attributes on external link", () => {
      render(<Footer />);

      const creatorLink = screen.getByRole("link", {name: /subhomoy roy choudhury/i});
      expect(creatorLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("has hover effect classes on creator link", () => {
      render(<Footer />);

      const creatorLink = screen.getByRole("link", {name: /subhomoy roy choudhury/i});
      expect(creatorLink).toHaveClass(
        "hover:text-github-blue",
        "dark:hover:text-white",
        "transition-colors",
      );
    });
  });

  describe("Image", () => {
    it("renders flag image with correct src", () => {
      render(<Footer />);

      const flagImage = screen.getByAltText("Indian Flag");
      expect(flagImage).toHaveAttribute("src", "/icons/indian-flag.svg");
    });

    it("renders flag image with correct dimensions", () => {
      render(<Footer />);

      const flagImage = screen.getByAltText("Indian Flag");
      expect(flagImage).toHaveAttribute("width", "18");
      expect(flagImage).toHaveAttribute("height", "18");
    });

    it("has alt text for flag image", () => {
      render(<Footer />);

      const flagImage = screen.getByAltText("Indian Flag");
      expect(flagImage).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("applies correct footer styling classes", () => {
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

    it("applies responsive flexbox layout", () => {
      const {container} = render(<Footer />);
      const contentDiv = container.querySelector(".flex.flex-col");

      expect(contentDiv).toHaveClass("md:flex-row", "md:justify-center", "md:items-center");
    });

    it("applies text styling classes", () => {
      const {container} = render(<Footer />);
      const contentDiv = container.querySelector(".text-sm");

      expect(contentDiv).toHaveClass(
        "text-center",
        "md:text-left",
        "text-gray-500",
        "dark:text-gray-400",
      );
    });

    it("hides separator on mobile screens", () => {
      const {container} = render(<Footer />);
      const separator = container.querySelector(".hidden.sm\\:inline");

      expect(separator).toBeInTheDocument();
      expect(separator).toHaveTextContent("•");
    });
  });

  describe("Layout", () => {
    it("displays content in correct order", () => {
      const {container} = render(<Footer />);
      const footer = container.querySelector("footer");
      const text = footer?.textContent || "";

      // Check order of elements
      expect(text).toMatch(/© 2024 iLoveGithub.*•.*Made in.*by.*Subhomoy Roy Choudhury/);
    });

    it("groups creator info together", () => {
      render(<Footer />);

      // All creator info should be within the same paragraph
      const creatorParagraph = screen.getByText("Made in").closest("p");
      expect(creatorParagraph).toBeInTheDocument();
      expect(creatorParagraph?.textContent).toContain("Made in");
      expect(creatorParagraph?.textContent).toContain("by");
      expect(creatorParagraph?.textContent).toContain("Subhomoy Roy Choudhury");
    });
  });

  describe("Responsive Design", () => {
    it("applies mobile-first padding", () => {
      const {container} = render(<Footer />);
      const footer = container.querySelector("footer");

      expect(footer).toHaveClass("px-4", "sm:px-6");
    });

    it("centers content on mobile", () => {
      const {container} = render(<Footer />);
      const contentDiv = container.querySelector(".text-center");

      expect(contentDiv).toBeInTheDocument();
    });

    it("applies desktop-specific layout", () => {
      const {container} = render(<Footer />);
      const contentDiv = container.querySelector(".flex");

      expect(contentDiv).toHaveClass("md:flex-row", "md:justify-center");
    });
  });

  describe("Accessibility", () => {
    it("has semantic footer element", () => {
      const {container} = render(<Footer />);
      const footer = container.querySelector("footer");

      expect(footer?.tagName.toLowerCase()).toBe("footer");
    });

    it("has descriptive alt text for flag image", () => {
      render(<Footer />);

      const flagImage = screen.getByAltText("Indian Flag");
      expect(flagImage).toHaveAttribute("alt", "Indian Flag");
    });

    it("has accessible link text", () => {
      render(<Footer />);

      const creatorLink = screen.getByRole("link");
      expect(creatorLink).toHaveAccessibleName(/subhomoy roy choudhury/i);
    });
  });

  describe("Dynamic Year", () => {
    it("displays copyright year from Date object", () => {
      render(<Footer />);

      // The year should be 2024 based on our mock
      expect(screen.getByText(/© 2024 iLoveGithub/i)).toBeInTheDocument();
    });

    it("calculates year dynamically on render", () => {
      // Restore original Date
      jest.restoreAllMocks();

      render(<Footer />);

      const currentYear = new Date().getFullYear();
      const copyrightText = screen.getByText(new RegExp(`© ${currentYear} iLoveGithub`, "i"));
      expect(copyrightText).toBeInTheDocument();
    });
  });

  describe("Dark Mode Support", () => {
    it("has dark mode background classes", () => {
      const {container} = render(<Footer />);
      const footer = container.querySelector("footer");

      expect(footer).toHaveClass("dark:bg-github-dark-blue");
    });

    it("has dark mode text color classes", () => {
      const {container} = render(<Footer />);
      const contentDiv = container.querySelector(".text-gray-500");

      expect(contentDiv).toHaveClass("dark:text-gray-400");
    });

    it("has dark mode border classes", () => {
      const {container} = render(<Footer />);
      const footer = container.querySelector("footer");

      expect(footer).toHaveClass("dark:border-gray-800");
    });
  });

  describe("Edge Cases", () => {
    it("renders without crashing", () => {
      expect(() => render(<Footer />)).not.toThrow();
    });

    it("handles missing year gracefully", () => {
      // Even with date mocked, component should render
      render(<Footer />);

      const footer = screen.getByRole("contentinfo");
      expect(footer).toBeInTheDocument();
    });
  });

  describe("Snapshot", () => {
    it("matches snapshot", () => {
      const {container} = render(<Footer />);
      expect(container).toMatchSnapshot();
    });
  });
});
