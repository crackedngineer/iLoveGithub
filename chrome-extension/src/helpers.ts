import {IS_DEVELOPMENT, EXCLUDED_GITHUB_PATHS} from "./constants";
import {RepoInfo, Tool} from "./types";

/**
 * Debug logging utility
 */
export function debugLog(...args: any[]): void {
  if (IS_DEVELOPMENT) {
    console.log("[GitHub Tools]", ...args);
  }
}

/**
 * Check if current page is a repository page
 */
export function isRepoPage(): boolean {
  const path = window.location.pathname;
  const pathParts = path.split("/").filter((part) => part.length > 0);

  if (pathParts.length >= 2) {
    return !EXCLUDED_GITHUB_PATHS.includes(pathParts[0] as (typeof EXCLUDED_GITHUB_PATHS)[number]);
  }
  return false;
}

/**
 * Extract repository information from URL
 */
export function getRepoInfo(): RepoInfo | null {
  const path = window.location.pathname;
  const pathParts = path.split("/").filter((part) => part.length > 0);

  if (pathParts.length >= 2) {
    return {
      owner: pathParts[0],
      repo: pathParts[1],
      default_branch: "main",
    };
  }
  return null;
}

/**
 * Format numbers with k/M suffixes
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
}

/**
 * Filter tools based on search query
 */
export function filterTools(tools: Tool[], query: string): Tool[] {
  if (!query) return [...tools];

  const lowercaseQuery = query.toLowerCase().trim();
  return tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(lowercaseQuery) ||
      tool.description.toLowerCase().includes(lowercaseQuery),
  );
}
