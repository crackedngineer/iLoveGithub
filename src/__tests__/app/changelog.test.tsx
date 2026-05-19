import React from "react";
import {render, screen} from "@testing-library/react";
import ChangelogPage from "@/app/changelog/page";

jest.mock("@/lib/version", () => ({appVersion: "0.28.0"}));

jest.mock("@/components/AppLayout", () => ({
  __esModule: true,
  default: ({children}: {children: React.ReactNode}) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

describe("ChangelogPage", () => {
  it("renders the main 'Changelog' heading", () => {
    render(<ChangelogPage />);
    expect(screen.getByRole("heading", {level: 1})).toHaveTextContent("Changelog");
  });

  it("renders the 'Product Updates' eyebrow label", () => {
    render(<ChangelogPage />);
    expect(screen.getByText(/product updates/i)).toBeInTheDocument();
  });

  it("renders change entries for each version", () => {
    render(<ChangelogPage />);
    expect(screen.getAllByText(/0\.28\.0/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/0\.26\.0/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/0\.25\.x/)[0]).toBeInTheDocument();
  });

  it("renders a title for each changelog entry", () => {
    render(<ChangelogPage />);
    expect(screen.getByText(/Responsive blog and navigation refresh/i)).toBeInTheDocument();
    expect(screen.getByText(/Blog foundation/i)).toBeInTheDocument();
    expect(screen.getByText(/Repository tools experience/i)).toBeInTheDocument();
  });

  it("renders individual changelog items within each version section", () => {
    render(<ChangelogPage />);
    expect(
      screen.getByText(/Expanded page layouts so content scales cleanly/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Introduced markdown-powered posts/i)).toBeInTheDocument();
  });

  it("renders date labels for each version entry", () => {
    render(<ChangelogPage />);
    expect(screen.getByText("April 29, 2026")).toBeInTheDocument();
    expect(screen.getByText("April 2026")).toBeInTheDocument();
    expect(screen.getByText("Early 2026")).toBeInTheDocument();
  });

  it("renders inside the AppLayout", () => {
    render(<ChangelogPage />);
    expect(screen.getByTestId("app-layout")).toBeInTheDocument();
  });
});
