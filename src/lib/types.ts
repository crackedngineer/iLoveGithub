export interface Tool {
  name: string;
  title: string;
  description: string;
  homepage: string;
  url: string;
  link?: string;
  icon: string | null;
  category: string;
  iframe: boolean;
  created_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  language: string;
  created_at: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}
