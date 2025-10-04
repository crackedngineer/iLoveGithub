import {render, screen} from "@testing-library/react";
import {Introduction} from "./Introduction";

describe("Introduction Component", () => {
  it("renders the main heading", () => {
    render(<Introduction />);
    const heading = screen.getByRole("heading", {name: /discover github tools/i});
    expect(heading).toBeInTheDocument();
  });

  it("renders the description text", () => {
    render(<Introduction />);
    const description = screen.getByText(/explore github repositories and find the best tools/i);
    expect(description).toBeInTheDocument();
  });

  it("renders all three badge links", () => {
    render(<Introduction />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
  });

  it("renders Product Hunt badge with correct attributes", () => {
    render(<Introduction />);
    const productHuntLink = screen.getByRole("link", {name: /ilovegithub product hunt badge/i});

    expect(productHuntLink).toHaveAttribute(
      "href",
      "https://www.producthunt.com/posts/ilovegithub?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-ilovegithub",
    );
    expect(productHuntLink).toHaveAttribute("target", "_blank");
    expect(productHuntLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders Peerlist badge with correct attributes", () => {
    render(<Introduction />);
    const peerlistLink = screen.getByRole("link", {name: /ilovegithub peerlist badge/i});

    expect(peerlistLink).toHaveAttribute(
      "href",
      "https://peerlist.io/crackedngineer/project/ilovegithub",
    );
    expect(peerlistLink).toHaveAttribute("target", "_blank");
    expect(peerlistLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders Scout Forge badge with correct attributes", () => {
    render(<Introduction />);
    const scoutForgeLink = screen.getByRole("link", {
      name: /trusted and reviewed by scout forge badge/i,
    });

    expect(scoutForgeLink).toHaveAttribute("href", "https://scoutforge.net/reviews/ilovegithub/");
    expect(scoutForgeLink).toHaveAttribute("target", "_blank");
    expect(scoutForgeLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders all badge images with correct alt text", () => {
    render(<Introduction />);

    const productHuntImg = screen.getByAltText(/ilovegithub product hunt badge/i);
    const peerlistImg = screen.getByAltText(/ilovegithub peerlist badge/i);
    const scoutForgeImg = screen.getByAltText(/trusted and reviewed by scout forge badge/i);

    expect(productHuntImg).toBeInTheDocument();
    expect(peerlistImg).toBeInTheDocument();
    expect(scoutForgeImg).toBeInTheDocument();
  });

  it("applies correct styling classes to badge images", () => {
    render(<Introduction />);
    const images = screen.getAllByRole("img");

    images.forEach((img) => {
      expect(img).toHaveAttribute("width", "250");
      expect(img).toHaveClass("rounded-md", "h-14");
    });
  });

  it("applies hover effect class to badge links", () => {
    render(<Introduction />);
    const links = screen.getAllByRole("link");

    links.forEach((link) => {
      expect(link).toHaveClass("transform", "hover:scale-105", "transition", "duration-300");
    });
  });

  it("applies gradient text styling to heading", () => {
    render(<Introduction />);
    const heading = screen.getByRole("heading", {name: /discover github tools/i});

    expect(heading).toHaveClass(
      "bg-gradient-to-r",
      "from-github-blue",
      "to-github-green",
      "bg-clip-text",
      "text-transparent",
    );
  });

  it("applies responsive text sizing to heading", () => {
    render(<Introduction />);
    const heading = screen.getByRole("heading", {name: /discover github tools/i});

    expect(heading).toHaveClass("text-4xl", "md:text-5xl");
  });

  it("applies responsive text sizing to description", () => {
    render(<Introduction />);
    const description = screen.getByText(/explore github repositories and find the best tools/i);

    expect(description).toHaveClass("text-lg", "md:text-xl");
  });

  it("renders badge container with flexbox layout", () => {
    const {container} = render(<Introduction />);
    const badgeContainer = container.querySelector(".flex.flex-wrap.justify-center");

    expect(badgeContainer).toBeInTheDocument();
    expect(badgeContainer).toHaveClass("gap-4", "p-2");
  });

  it("matches snapshot", () => {
    const {container} = render(<Introduction />);
    expect(container).toMatchSnapshot();
  });
});
