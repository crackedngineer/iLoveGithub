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
}

export const fetchRepoDetails = async (owner: string, repo: string): Promise<GithubRepoResponse> => {
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching repository details:', error);
        throw error;
    }
};

export const fetchRepoTopics = async (owner: string, repo: string): Promise<string[]> => {
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/topics`, {
            headers: {
                'Accept': 'application/vnd.github.mercy-preview+json'
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();
        return data.names || [];
    } catch (error) {
        console.error('Error fetching repository topics:', error);
        return [];
    }
};