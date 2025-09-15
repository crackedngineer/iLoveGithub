import {GitHubTool, RepoInfo, Tool, CreateElementOptions, RepoAnalytics} from "./types";
import {BASE_URL, LOGO_URL, MESSAGE_TYPES} from "./constants";
import {debugLog, formatNumber} from "./helpers";

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
    icon: item.icon,
    url: item.url,
  })) as GitHubTool[];
}

/**
 * Load tools from extension storage or return defaults
 */
export async function loadTools(repoInfo: RepoInfo | null): Promise<Tool[]> {
  try {
    const response = await chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.FETCH_TOOLS,
      data: repoInfo,
    });

    const tools = response?.data || [];
    debugLog("Tools loaded:", tools.length);
    return tools;
  } catch (error) {
    debugLog("Error loading tools:", error);
    return [];
  }
}

/**
 * Create DOM element with specified attributes
 */
export function createElement(tagName: string, attributes: CreateElementOptions = {}): HTMLElement {
  const element = document.createElement(tagName);

  Object.entries(attributes).forEach(([key, value]) => {
    if (!value) return;

    if (key === "className") {
      element.className = value;
    } else if (key === "innerHTML") {
      element.innerHTML = value;
    } else {
      element.setAttribute(key, value);
    }
  });

  return element;
}

/**
 * Add event listener with cleanup function
 */
export function addEventListenerWithCleanup(
  element: HTMLElement | Document,
  event: string,
  handler: (e: Event) => void,
  options?: AddEventListenerOptions,
): () => void {
  element.addEventListener(event, handler, options);
  return () => element.removeEventListener(event, handler, options);
}

/**
 * Generate complete popup HTML
 */
export function generatePopupHTML(
  repoInfo: RepoInfo,
  analytics: RepoAnalytics | null,
  filteredTools: Tool[],
  allTools: Tool[],
  searchQuery: string,
): string {
  return `
    ${generateHeaderHTML(repoInfo)}
    ${generateAnalyticsHTML(analytics)}
    ${generateSearchHTML(searchQuery)}
    ${generateToolsHTML(filteredTools, allTools)}
    ${generateFooterHTML()}
  `;
}

export function generateFooterHTML(): string {
  return `
    <div class="popup-footer">
      <span style="color: #FFFFFF;">Powered by <a href="https://ilovegithub.oderna.in" target="_blank" style="color: #0366d6; text-decoration: none;">iLoveGitHub</a> ❤️</span>
    </div>
  `;
}

/**
 * Generate header section HTML
 */
export function generateHeaderHTML(repoInfo: RepoInfo): string {
  return `
    <div class="popup-header">
      <h3>${repoInfo.repo}</h3>
      <a href="https://ilovegithub.oderna.in/${repoInfo.owner}/${repoInfo.repo}" target="_blank">
        <div class="repo-info" 
            style="cursor: pointer; color: #FFFFFF;">
          ${repoInfo.owner}/${repoInfo.repo}
        </div>
      </a>
    </div>
  `;
}

/**
 * Generate analytics section HTML
 */
export function generateAnalyticsHTML(analytics: RepoAnalytics | null): string {
  if (!analytics) return "";

  return `
    <div class="analytics-section">
      <div class="analytics-compact">
        <span class="analytics-stat">⭐ ${formatNumber(analytics.stars)}</span>
        <span class="analytics-stat">🔀 ${formatNumber(analytics.forks)}</span>
        <span class="analytics-stat">🐛 ${formatNumber(analytics.issues)}</span>
        <span class="analytics-stat">${analytics.language}</span>
      </div>
    </div>
  `;
}

/**
 * Generate search section HTML
 */
export function generateSearchHTML(searchQuery: string): string {
  return `
    <div class="search-section">
      <div class="search-container">
        <input type="text" 
               id="tool-search" 
               placeholder="Search tools..." 
               class="tool-search-input"
               value="${searchQuery}" />
        <span class="search-icon">🔍</span>
      </div>
    </div>
  `;
}

/**
 * Generate tools list HTML
 */
export function generateToolsHTML(filteredTools: Tool[], allTools: Tool[]): string {
  if (filteredTools.length === 0) {
    return `
      <div class="tools-list">
        <div class="no-tools">
          <div class="no-tools-icon">🔍</div>
          <div class="no-tools-text">No tools found</div>
        </div>
      </div>
    `;
  }

  const toolsHTML = filteredTools
    .map((tool) => {
      const originalIndex = allTools.findIndex((t) => t === tool);
      return generateToolItemHTML(tool, originalIndex);
    })
    .join("");

  return `<div class="tools-list">${toolsHTML}</div>`;
}

/**
 * Generate individual tool item HTML
 */
export function generateToolItemHTML(tool: Tool, index: number): string {
  return `
    <div class="tool-item" data-tool-index="${index}">
      <img style="" src="${tool.icon}" class="inverted-icon-clr tool-icon" alt="${tool.name}" />
      <div class="tool-details">
        <div class="tool-name">${tool.name}</div>
        <div class="tool-description">${tool.description}</div>
      </div>
      <span class="tool-arrow">→</span>
    </div>
  `;
}

/**
 * Update tools list in existing DOM
 */
export function updateToolsListHTML(filteredTools: Tool[], allTools: Tool[]): string {
  if (filteredTools.length === 0) {
    return `
      <div class="no-tools">
        <div class="no-tools-icon">🔍</div>
        <div class="no-tools-text">No tools found</div>
      </div>
    `;
  }

  return filteredTools
    .map((tool) => {
      const originalIndex = allTools.findIndex((t) => t === tool);
      return generateToolItemHTML(tool, originalIndex);
    })
    .join("");
}
