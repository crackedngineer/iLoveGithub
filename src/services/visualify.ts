export function generateVisualifyCard(
  repo: string,
  owner: string,
  theme: string,
  layout: string,
  width: number,
  height: number,
): string {
  const url = "/api/visualify/generate";
  const searchParams = new URLSearchParams();
  searchParams.append("repo", repo);
  searchParams.append("owner", owner);
  // searchParams.append("theme", theme);
  // searchParams.append("layout", layout);
  searchParams.append("width", width.toString());
  searchParams.append("height", height.toString());

  return `${url}?${searchParams.toString()}`;
}
