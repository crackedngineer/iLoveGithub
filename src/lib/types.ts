export interface Tool {
  name: string;
  title: string;
  description: string;
  homepage: string;
  url: string;
  icon: string;
  category: string;
  iframe: boolean;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  language: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}
