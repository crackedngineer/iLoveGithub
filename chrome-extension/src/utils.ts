import {GitHubTool} from "./types";
import {BASE_URL, BLOB_BASE_URL} from "./constants";
import {parseImageFileName} from "./helpers";

export async function fetchTools(owner: string, repo: string, default_branch: string) {
  const response = await fetch(
    BASE_URL + `/api/tools?owner=${owner}&repo=${repo}&default_branch=${default_branch}`,
  );

  if (response.status !== 200) {
    throw new Error("Failed to fetch tools");
  }

  const data = (await response.json()) as any[];
  return data.map((item) => ({
    name: item.name,
    description: item.description,
    icon: item.icon !== null && BLOB_BASE_URL + parseImageFileName(item.icon),
    url: item.url,
  })) as GitHubTool[];
}
