export interface AnalyticsData {
  toolName: string;
  repo: {owner: string; repo: string};
  timestamp: number;
}

export interface GitHubTool {
  name: string;
  description: string;
  icon: string;
  url: string;
  color: string;
}

export interface RepoInfo {
  owner: string;
  repo: string;
  default_branch: string;
}

export interface Tool {
  name: string;
  url: string;
  description: string;
  icon: string;
}

export interface RepoAnalytics {
  stars: number;
  forks: number;
  issues: number;
  language: string;
}

export interface UIState {
  isPopupOpen: boolean;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filteredTools: Tool[];
}

export interface CreateElementOptions {
  id?: string;
  className?: string;
  innerHTML?: string;
  title?: string;
  "aria-label"?: string;
  [key: string]: string | undefined;
}

export interface ExtensionElements {
  floatingButton: HTMLElement | null;
  popup: HTMLElement | null;
  searchInput: HTMLInputElement | null;
  toolsList: HTMLElement | null;
}
