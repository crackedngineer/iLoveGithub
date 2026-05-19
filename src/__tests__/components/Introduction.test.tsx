import {render, screen} from "@testing-library/react";
import {Introduction} from "../../components/Introduction";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({alt, src, width, height, className}: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt as string}
      src={src as string}
      width={width as number}
      height={height as number}
      className={className as string}
    />
  ),
}));

describe("Introduction Component", () => {
  it("renders the main heading containing 'Discover', 'GitHub', and 'Tools'", () => {
    render(<Introduction />);
    const heading = screen.getByRole("heading", {level: 1});
    expect(heading).toHaveTextContent(/discover/i);
    expect(heading).toHaveTextContent(/github/i);
    expect(heading).toHaveTextContent(/tools/i);
  });

  it("renders the description text", () => {
    render(<Introduction />);
    const description = screen.getByText(
      /Explore repositories and discover the best tools to transform your GitHub experience/i,
    );
    expect(description).toBeInTheDocument();
  });

  it("renders exactly two badge links", () => {
    render(<Introduction />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
  });

  it("renders the Product Hunt badge link with correct attributes", () => {
    render(<Introduction />);
    const link = screen.getByRole("link", {name: /ilovegithub product hunt badge/i});
    expect(link).toHaveAttribute(
      "href",
      "https://www.producthunt.com/posts/ilovegithub?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-ilovegithub",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders the Peerlist badge link with correct attributes", () => {
    render(<Introduction />);
    const link = screen.getByRole("link", {name: /ilovegithub peerlist badge/i});
    expect(link).toHaveAttribute("href", "https://peerlist.io/crackedngineer/project/ilovegithub");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders both badge images with correct alt text", () => {
    render(<Introduction />);
    expect(screen.getByAltText(/ilovegithub product hunt badge/i)).toBeInTheDocument();
    expect(screen.getByAltText(/ilovegithub peerlist badge/i)).toBeInTheDocument();
  });

  it("renders badge images with correct dimensions", () => {
    render(<Introduction />);
    const images = screen.getAllByRole("img");
    images.forEach((img) => {
      expect(img).toHaveAttribute("width", "200");
      expect(img).toHaveAttribute("height", "44");
    });
  });

  it("renders the eyebrow label 'GitHub Tools Directory'", () => {
    render(<Introduction />);
    expect(screen.getByText("GitHub Tools Directory")).toBeInTheDocument();
  });

  it("renders all four feature tags", () => {
    render(<Introduction />);
    expect(screen.getByText("100+ tools")).toBeInTheDocument();
    expect(screen.getByText("Open source")).toBeInTheDocument();
    expect(screen.getByText("Free forever")).toBeInTheDocument();
    expect(screen.getByText("GitHub-native")).toBeInTheDocument();
  });

  it("renders the badge wrapper with correct layout classes", () => {
    const {container} = render(<Introduction />);
    const badgeWrapper = container.querySelector(".flex.flex-wrap.justify-center.gap-3");
    expect(badgeWrapper).toBeInTheDocument();
  });

  it("matches snapshot", () => {
    const {container} = render(<Introduction />);
    expect(container).toMatchSnapshot();
  });
});
