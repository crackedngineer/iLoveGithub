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
