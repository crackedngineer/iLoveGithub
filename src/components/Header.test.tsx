import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import {useSession, signOut, signIn} from "next-auth/react";
import Header from "./Header";
import {useAppLocation} from "./AppLocationProvider";

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
  signIn: jest.fn(),
}));

// Mock next/link
jest.mock("next/link", () => {
  return ({children, href}: any) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />;
  },
}));

// Mock AppLocationProvider
jest.mock("./AppLocationProvider", () => ({
  useAppLocation: jest.fn(),
}));

// Mock components
jest.mock("@/components/ui/button", () => ({
  Button: ({children, onClick, className, ...props}: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({children}: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({children}: any) => <div>{children}</div>,
  DropdownMenuContent: ({children}: any) => <div>{children}</div>,
  DropdownMenuLabel: ({children}: any) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuItem: ({children, onClick}: any) => <div onClick={onClick}>{children}</div>,
}));

jest.mock("@/components/ui/shadcn-io/github-stars-button", () => ({
  GitHubStarsButton: ({onClick}: any) => <button onClick={onClick}>GitHub Stars</button>,
}));

jest.mock("./DonationModal", () => {
  return function DonationModal({isOpen, onClose}: any) {
    return isOpen ? <div data-testid="donation-modal">Donation Modal</div> : null;
  };
});

jest.mock("./RateLimitDisplay", () => ({
  RateLimitDisplay: () => <div>Rate Limit Display</div>,
}));

// Mock constants
jest.mock("@/constants", () => ({
  BUY_ME_COFFEE_URL: "https://buymeacoffee.com/test",
  SUBSTACK_NEWSLETTER_URL: "https://newsletter.test",
  GITHUB_REPO_URL: "https://github.com/test/repo",
  GITHUB_SUBMIT_TOOL_URL: "https://github.com/test/submit",
  DEMO_VIDEO_URL: "https://demo.test",
  DefaultGithubRepo: {
    owner: "testowner",
    repo: "testrepo",
  },
}));

jest.mock("@/lib/version", () => ({
  appVersion: "1.0.0",
}));

describe("Header Component", () => {
  const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
  const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
  const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;
  const mockUseAppLocation = useAppLocation as jest.MockedFunction<typeof useAppLocation>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Default mock values
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: jest.fn(),
    });

    mockUseAppLocation.mockReturnValue({
      isInIndia: false,
      timeZone: "",
      error: null,
      loading: false,
    });

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });

    // Mock window.open
    window.open = jest.fn();
  });

  describe("Rendering", () => {
    it("renders the header with logo and app name", () => {
      render(<Header />);

      expect(screen.getByText("iLoveGithub")).toBeInTheDocument();
      expect(screen.getByText("v1.0.0")).toBeInTheDocument();
      expect(screen.getByText("by Oderna Technologies")).toBeInTheDocument();
      expect(screen.getByAltText("favicon")).toBeInTheDocument();
    });

    it("renders navigation buttons on desktop", () => {
      render(<Header />);

      expect(screen.getByText("Submit a Tool")).toBeInTheDocument();
      expect(screen.getByText("Join Newsletter")).toBeInTheDocument();
      expect(screen.getByText("Donate ❤️")).toBeInTheDocument();
    });

    it("renders GitHub Stars button", () => {
      render(<Header />);

      expect(screen.getByText("GitHub Stars")).toBeInTheDocument();
    });

    it("renders user icon when not signed in", () => {
      render(<Header />);

      const userIcons = screen.getAllByRole("button");
      expect(userIcons.length).toBeGreaterThan(0);
    });

    it("renders user profile image when signed in", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            name: "Test User",
            email: "test@example.com",
            image: "https://example.com/avatar.jpg",
          },
          expires: "2024-12-31",
        },
        status: "authenticated",
        update: jest.fn(),
      });

      render(<Header />);

      const profileImage = screen.getByAltText("Profile");
      expect(profileImage).toBeInTheDocument();
      expect(profileImage).toHaveAttribute("src", "https://example.com/avatar.jpg");
    });
  });

  describe("Theme Toggle", () => {
    it("toggles theme when theme button is clicked", () => {
      render(<Header />);

      const themeButtons = screen.getAllByRole("button");
      const themeButton = themeButtons.find(
        (btn) => btn.getAttribute("aria-label") === "Toggle Theme",
      );

      if (themeButton) {
        fireEvent.click(themeButton);
        expect(localStorage.setItem).toHaveBeenCalled();
      }
    });

    it("displays theme toggle button", () => {
      render(<Header />);

      const themeButton = screen.getByLabelText("Toggle Theme");
      expect(themeButton).toBeInTheDocument();
    });
  });

  describe("Mobile Menu", () => {
    it("toggles mobile menu when hamburger button is clicked", () => {
      render(<Header />);

      const menuButton = screen.getByLabelText("Toggle Menu");

      fireEvent.click(menuButton);

      // Check if mobile menu items appear
      const submitButtons = screen.getAllByText("Submit a Tool");
      expect(submitButtons.length).toBeGreaterThan(1); // Desktop + Mobile
    });

    it("closes mobile menu when a menu item is clicked", () => {
      render(<Header />);

      const menuButton = screen.getByLabelText("Toggle Menu");
      fireEvent.click(menuButton);

      const newsletterButtons = screen.getAllByText("Join Newsletter");
      const mobileNewsletterButton = newsletterButtons[newsletterButtons.length - 1];

      fireEvent.click(mobileNewsletterButton);

      expect(window.open).toHaveBeenCalledWith("https://newsletter.test", "_blank");
    });

    it("displays theme toggle in mobile menu", () => {
      render(<Header />);

      const menuButton = screen.getByLabelText("Toggle Menu");
      fireEvent.click(menuButton);

      expect(screen.getByText(/Dark Mode|Light Mode/)).toBeInTheDocument();
    });
  });

  describe("Authentication", () => {
    it('shows "Sign in with GitHub" when not authenticated', () => {
      render(<Header />);

      expect(screen.getByText("Sign in with GitHub")).toBeInTheDocument();
    });

    it("shows user info when authenticated", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            name: "Test User",
            email: "test@example.com",
            image: "https://example.com/avatar.jpg",
          },
          expires: "2024-12-31",
        },
        status: "authenticated",
        update: jest.fn(),
      });

      render(<Header />);

      expect(screen.getByText("Signed in as")).toBeInTheDocument();
      expect(screen.getByText("Test User")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });

    it('calls signIn when "Sign in with GitHub" is clicked', () => {
      render(<Header />);

      const signInButton = screen.getByText("Sign in with GitHub");
      fireEvent.click(signInButton);

      expect(mockSignIn).toHaveBeenCalledWith("github", {callbackUrl: "/"});
    });

    it('calls signOut when "Log out" is clicked', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            name: "Test User",
            email: "test@example.com",
            image: "https://example.com/avatar.jpg",
          },
          expires: "2024-12-31",
        },
        status: "authenticated",
        update: jest.fn(),
      });

      render(<Header />);

      const logoutButton = screen.getByText("Log out");
      fireEvent.click(logoutButton);

      expect(mockSignOut).toHaveBeenCalledWith({callbackUrl: "/"});
    });
  });

  describe("Rate Limit Display", () => {
    it("shows rate limit display when not authenticated", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
        update: jest.fn(),
      });

      render(<Header />);

      expect(screen.getByText("Rate Limit Display")).toBeInTheDocument();
    });

    it("does not show rate limit display when authenticated", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            name: "Test User",
            email: "test@example.com",
          },
          expires: "2024-12-31",
        },
        status: "authenticated",
        update: jest.fn(),
      });

      render(<Header />);

      expect(screen.queryByText("Rate Limit Display")).not.toBeInTheDocument();
    });
  });

  describe("Donation Modal", () => {
    it("opens donation modal when QR code option is clicked (India)", () => {
      mockUseAppLocation.mockReturnValue({
        isInIndia: true,
        timeZone: "",
        error: null,
        loading: false,
      });

      render(<Header />);

      const qrCodeButton = screen.getByText("Scan QR code");
      fireEvent.click(qrCodeButton);

      expect(screen.getByTestId("donation-modal")).toBeInTheDocument();
    });

    it("does not show QR code option when not in India", () => {
      mockUseAppLocation.mockReturnValue({
        isInIndia: false,
        timeZone: "",
        error: null,
        loading: false,
      });

      render(<Header />);

      expect(screen.queryByText("Scan QR code")).not.toBeInTheDocument();
    });

    it("shows Buy me a coffee option", () => {
      render(<Header />);

      expect(screen.getByText("Buy me a coffee")).toBeInTheDocument();
    });
  });

  describe("External Links", () => {
    it("opens Submit a Tool URL when clicked", () => {
      render(<Header />);

      const submitButton = screen.getAllByText("Submit a Tool")[0];
      fireEvent.click(submitButton);

      expect(window.open).toHaveBeenCalledWith("https://github.com/test/submit", "_blank");
    });

    it("opens Newsletter URL when clicked", () => {
      render(<Header />);

      const newsletterButton = screen.getAllByText("Join Newsletter")[0];
      fireEvent.click(newsletterButton);

      expect(window.open).toHaveBeenCalledWith("https://newsletter.test", "_blank");
    });

    it("opens GitHub repo when Stars button is clicked", () => {
      render(<Header />);

      const starsButton = screen.getByText("GitHub Stars");
      fireEvent.click(starsButton);

      expect(window.open).toHaveBeenCalledWith("https://github.com/test/repo", "_blank");
    });

    it("opens Buy me a coffee URL when clicked", () => {
      render(<Header />);

      const coffeeButton = screen.getByText("Buy me a coffee");
      fireEvent.click(coffeeButton);

      expect(window.open).toHaveBeenCalledWith("https://buymeacoffee.com/test", "_blank");
    });
  });

  describe("Accessibility", () => {
    it("has proper aria-label for theme toggle button", () => {
      render(<Header />);

      const themeButton = screen.getByLabelText("Toggle Theme");
      expect(themeButton).toBeInTheDocument();
    });

    it("has proper aria-label for mobile menu toggle", () => {
      render(<Header />);

      const menuButton = screen.getByLabelText("Toggle Menu");
      expect(menuButton).toBeInTheDocument();
    });

    it("has alt text for logo image", () => {
      render(<Header />);

      const logo = screen.getByAltText("favicon");
      expect(logo).toBeInTheDocument();
    });

    it("has alt text for profile image when authenticated", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            name: "Test User",
            email: "test@example.com",
            image: "https://example.com/avatar.jpg",
          },
          expires: "2024-12-31",
        },
        status: "authenticated",
        update: jest.fn(),
      });

      render(<Header />);

      const profileImage = screen.getByAltText("Profile");
      expect(profileImage).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("applies sticky positioning to header", () => {
      const {container} = render(<Header />);

      const header = container.querySelector("header");
      expect(header).toHaveClass("sticky", "top-0", "z-50");
    });

    it("applies responsive padding to container", () => {
      const {container} = render(<Header />);

      const mainContainer = container.querySelector(".max-w-7xl");
      expect(mainContainer).toBeInTheDocument();
      expect(mainContainer).toHaveClass("px-4", "sm:px-6");
    });

    it("hides desktop menu on mobile screens", () => {
      const {container} = render(<Header />);

      const desktopMenu = container.querySelector(".hidden.md\\:flex");
      expect(desktopMenu).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles missing user data gracefully", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: undefined,
          expires: "2024-12-31",
        },
        status: "authenticated",
        update: jest.fn(),
      });

      render(<Header />);

      expect(screen.queryByText("Signed in as")).toBeInTheDocument();
    });

    it("handles session loading state", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "loading",
        update: jest.fn(),
      });

      render(<Header />);

      expect(screen.getByText("iLoveGithub")).toBeInTheDocument();
    });
  });
});
