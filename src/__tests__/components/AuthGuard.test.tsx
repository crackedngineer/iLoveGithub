import React from "react";
import {render, screen} from "@testing-library/react";
import AuthGuard from "@/components/AuthGuard";
import {useAuth} from "@/components/AuthProvider";

jest.mock("@/components/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/components/Loader", () => ({
  __esModule: true,
  default: () => <div data-testid="loader">Loading...</div>,
}));

const mockUseAuth = useAuth as jest.Mock;

describe("AuthGuard", () => {
  describe("while auth is loading", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({loading: true});
    });

    it("shows the Loader component", () => {
      render(
        <AuthGuard>
          <span>Secret</span>
        </AuthGuard>,
      );
      expect(screen.getByTestId("loader")).toBeInTheDocument();
    });

    it("does not render the protected children", () => {
      render(
        <AuthGuard>
          <span>Secret</span>
        </AuthGuard>,
      );
      expect(screen.queryByText("Secret")).not.toBeInTheDocument();
    });
  });

  describe("after auth has finished loading", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({loading: false});
    });

    it("renders the children passed to it", () => {
      render(
        <AuthGuard>
          <span>Protected content</span>
        </AuthGuard>,
      );
      expect(screen.getByText("Protected content")).toBeInTheDocument();
    });

    it("does not render the Loader component", () => {
      render(
        <AuthGuard>
          <span>Content</span>
        </AuthGuard>,
      );
      expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
    });

    it("renders multiple children correctly", () => {
      render(
        <AuthGuard>
          <span>First</span>
          <span>Second</span>
        </AuthGuard>,
      );
      expect(screen.getByText("First")).toBeInTheDocument();
      expect(screen.getByText("Second")).toBeInTheDocument();
    });
  });
});
