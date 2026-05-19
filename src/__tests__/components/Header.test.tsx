import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import {UserDropdown} from "@/components/Header";
import type {Session} from "@supabase/supabase-js";

// Stub Radix DropdownMenu with simple pass-through components
jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
  DropdownMenuTrigger: ({children}: {children: React.ReactNode; asChild?: boolean}) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
  DropdownMenuLabel: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuItem: ({children, onClick}: {children: React.ReactNode; onClick?: () => void}) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({src, alt, ...rest}: {src: string; alt: string; [k: string]: unknown}) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img src={src} alt={alt} {...(rest as object)} />
  ),
}));

// Minimal Session fixture
function makeSession(overrides: Partial<Session["user"]["user_metadata"]> = {}): Session {
  return {
    access_token: "tok",
    refresh_token: "ref",
    expires_in: 3600,
    token_type: "bearer",
    user: {
      id: "user-1",
      aud: "authenticated",
      email: "user@example.com",
      created_at: "2024-01-01",
      user_metadata: {
        user_name: "octocat",
        name: "Octocat",
        avatar_url: "https://avatars.example.com/octocat.png",
        ...overrides,
      },
    } as Session["user"],
  } as Session;
}

describe("UserDropdown", () => {
  describe("when a session exists (user logged in)", () => {
    const session = makeSession();

    it("renders the user's avatar image", () => {
      render(<UserDropdown session={session} signOut={jest.fn()} signInWithGitHub={jest.fn()} />);
      const avatar = screen.getByAltText("Profile");
      expect(avatar).toHaveAttribute("src", "https://avatars.example.com/octocat.png");
    });

    it("renders the 'Signed in as' label", () => {
      render(<UserDropdown session={session} signOut={jest.fn()} signInWithGitHub={jest.fn()} />);
      expect(screen.getByText("Signed in as")).toBeInTheDocument();
    });

    it("displays the user's GitHub username", () => {
      render(<UserDropdown session={session} signOut={jest.fn()} signInWithGitHub={jest.fn()} />);
      expect(screen.getByText("octocat")).toBeInTheDocument();
    });

    it("displays the user's email address", () => {
      render(<UserDropdown session={session} signOut={jest.fn()} signInWithGitHub={jest.fn()} />);
      expect(screen.getByText("user@example.com")).toBeInTheDocument();
    });

    it("calls signOut when the Log out button is clicked", () => {
      const signOut = jest.fn();
      render(<UserDropdown session={session} signOut={signOut} signInWithGitHub={jest.fn()} />);
      fireEvent.click(screen.getByText(/log out/i));
      expect(signOut).toHaveBeenCalledTimes(1);
    });

    it("shows the user name from metadata.name when user_name is absent", () => {
      const sessionWithoutUsername = makeSession({user_name: undefined, name: "Linus T."});
      render(
        <UserDropdown
          session={sessionWithoutUsername}
          signOut={jest.fn()}
          signInWithGitHub={jest.fn()}
        />,
      );
      expect(screen.getByText("Linus T.")).toBeInTheDocument();
    });

    it("falls back to 'User' when neither user_name nor name is present", () => {
      const sessionNoName = makeSession({user_name: undefined, name: undefined});
      render(
        <UserDropdown session={sessionNoName} signOut={jest.fn()} signInWithGitHub={jest.fn()} />,
      );
      expect(screen.getByText("User")).toBeInTheDocument();
    });
  });

  describe("when no session exists (user logged out)", () => {
    it("renders a fallback user icon instead of an avatar image", () => {
      render(
        <UserDropdown
          session={null as unknown as Session}
          signOut={jest.fn()}
          signInWithGitHub={jest.fn()}
        />,
      );
      expect(screen.queryByAltText("Profile")).not.toBeInTheDocument();
    });

    it("does not render the 'Signed in as' label", () => {
      render(
        <UserDropdown
          session={null as unknown as Session}
          signOut={jest.fn()}
          signInWithGitHub={jest.fn()}
        />,
      );
      expect(screen.queryByText("Signed in as")).not.toBeInTheDocument();
    });

    it("has the correct aria-label for the sign-in button", () => {
      render(
        <UserDropdown
          session={null as unknown as Session}
          signOut={jest.fn()}
          signInWithGitHub={jest.fn()}
        />,
      );
      expect(screen.getByLabelText("Sign in with GitHub")).toBeInTheDocument();
    });
  });
});
