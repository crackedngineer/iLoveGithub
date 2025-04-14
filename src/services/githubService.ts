import axios from "axios";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export interface GithubRepoResponse {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string;
  created_at: string;
  updated_at: string;
  topics: string[];
  default_branch: string;
}

const githubClient = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github+json",
    ...(GITHUB_TOKEN && { Authorization: `Bearer ${GITHUB_TOKEN}` }),
  },
});

export const fetchRepoDetails = async (
  owner: string,
  repo: string
): Promise<GithubRepoResponse> => {
  try {
    const [repoRes, topicsRes] = await Promise.all([
      githubClient.get(`/repos/${owner}/${repo}`),
      githubClient.get(`/repos/${owner}/${repo}/topics`, {
        headers: {
          Accept: "application/vnd.github.mercy-preview+json",
        },
      }),
    ]);

    return {
      ...repoRes.data,
      topics: topicsRes.data.names || [],
    };
  } catch (error: any) {
    console.error("Error fetching repository details:", error);
    throw error;
  }
};
