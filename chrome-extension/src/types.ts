export interface AnalyticsData {
  toolName: string;
  repo: { owner: string; repo: string };
  timestamp: number;
}

export interface GitHubTool {
  name: string;
  description: string;
  icon: string;
  url: string;
  color: string;
}
