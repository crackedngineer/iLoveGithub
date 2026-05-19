import React from "react";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {ViewCodeDropdown} from "@/components/ViewCodeDropdown";
import type {Tool} from "@/lib/types";

// Keep Radix DropdownMenu functional in jsdom by using a simple stub
jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
  DropdownMenuTrigger: ({children}: {children: React.ReactNode; asChild?: boolean}) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
  DropdownMenuItem: ({children, asChild}: {children: React.ReactNode; asChild?: boolean}) => (
    <div>{children}</div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {asChild?: boolean}) => (
    <button {...props}>{children}</button>
  ),
}));

const mockTool: Tool = {
  name: "github-stats",
  title: "GitHub Stats",
  description: "Repo statistics",
  homepage: "https://github-stats.example.com",
  url: "https://github-stats.example.com/{owner}/{repo}/{branch}",
  icon: "<svg><path/></svg>",
  category: "analytics",
  iframe: true,
  created_at: "2024-01-01",
};

function renderDropdown(tools: Tool[] = [mockTool]) {
  return render(
    <ViewCodeDropdown owner="octocat" repo="Hello-World" branch="main" tools={tools} />,
  );
}

describe("ViewCodeDropdown", () => {
  describe("trigger button", () => {
    it("renders a 'View Code' button", () => {
      renderDropdown();
      expect(screen.getByRole("button", {name: /view code/i})).toBeInTheDocument();
    });
  });

  describe("GitHub link", () => {
    it("renders a link to the correct GitHub repository tree URL", () => {
      renderDropdown();
      const link = screen.getByRole("link", {name: /view on github/i});
      expect(link).toHaveAttribute("href", "https://github.com/octocat/Hello-World/tree/main");
    });

    it("opens the GitHub link in a new tab", () => {
      renderDropdown();
      const link = screen.getByRole("link", {name: /view on github/i});
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  describe("tool links", () => {
    it("renders a link for each tool in the tools array", () => {
      const secondTool: Tool = {
        ...mockTool,
        name: "github-profile",
        title: "GitHub Profile",
        url: "https://profile.example.com/{owner}",
      };
      renderDropdown([mockTool, secondTool]);
      expect(screen.getByText("GitHub Stats")).toBeInTheDocument();
      expect(screen.getByText("GitHub Profile")).toBeInTheDocument();
    });

    it("replaces {owner}, {repo}, and {branch} in the tool URL", () => {
      renderDropdown([mockTool]);
      const toolLink = screen.getByText("GitHub Stats").closest("a");
      expect(toolLink).toHaveAttribute(
        "href",
        "https://github-stats.example.com/octocat/Hello-World/main",
      );
    });

    it("renders no tool links when the tools array is empty", () => {
      renderDropdown([]);
      // Only the GitHub link should be present
      expect(screen.getAllByRole("link")).toHaveLength(1);
    });

    it("renders the tool title inside the link", () => {
      renderDropdown([mockTool]);
      expect(screen.getByText("GitHub Stats")).toBeInTheDocument();
    });
  });

  describe("with different owner/repo/branch values", () => {
    it("uses the provided owner and repo in the GitHub URL", () => {
      render(<ViewCodeDropdown owner="torvalds" repo="linux" branch="master" tools={[]} />);
      const link = screen.getByRole("link", {name: /view on github/i});
      expect(link).toHaveAttribute("href", "https://github.com/torvalds/linux/tree/master");
    });

    it("substitutes all three variables in a tool URL", () => {
      const tool: Tool = {
        ...mockTool,
        url: "https://example.com/{owner}/{repo}?ref={branch}",
      };
      render(<ViewCodeDropdown owner="alice" repo="my-repo" branch="develop" tools={[tool]} />);
      const toolLink = screen.getByText(tool.title).closest("a");
      expect(toolLink).toHaveAttribute("href", "https://example.com/alice/my-repo?ref=develop");
    });
  });
});
