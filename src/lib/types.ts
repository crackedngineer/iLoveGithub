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
  type?: string;
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

export type BlogPostFrontMatter = {
  title: string;
  created: string;
  description: string;
  slug: string;
  tags: string[];
  category: string;
  excerpt?: string;
  readTimeMinutes?: number;
  coverImage: string;
};

export interface BlogRelatedPost {
  slug: string;
  title: string;
  tags: string[];
  excerpt?: string;
  coverImage?: string;
}

export type BlogPostDetail = BlogPostFrontMatter & {
  author?: string;
  series?: string;
  body: string;
  related: BlogRelatedPost[];
};

export interface SeriesInfo {
  name: string;
  posts: BlogPostDetail[];
  currentIndex: number;
  total: number;
}
