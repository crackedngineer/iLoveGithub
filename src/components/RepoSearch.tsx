import React, { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const RepoSearch = ({
  value = "",
  onError,
  onRepoSubmit,
}: {
  value: string;
  onError?: (error: string | null) => void;
  onRepoSubmit: (owner: string, repo: string) => void;
}) => {
  const [repoUrl, setRepoUrl] = useState(value);
  const [error, setError] = useState("");

  const extractRepoDetails = (
    url: string
  ): { owner: string; repo: string } | null => {
    // Clear previous error
    setError("");

    // Define patterns for GitHub URL and owner/repo format
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/]+)/, // Full GitHub URL
      /^([^\/]+)\/([^\/]+)$/, // Owner/repo format
    ];

    // Try matching the URL with each pattern
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const [, owner, repo] = match;
        return {
          owner,
          repo: repo.replace(".git", "").split("#")[0].split("?")[0],
        }; // Remove .git suffix, fragments, and query parameters
      }
    }

    // If no match is found, set error and return null
    setError(
      "Invalid repository URL format. Please enter a valid GitHub URL or owner/repo format."
    );
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      setError("Please enter a repository URL");
      return;
    }

    const repoDetails = extractRepoDetails(repoUrl);
    if (repoDetails) {
      onRepoSubmit(repoDetails.owner, repoDetails.repo);
    } else {
      onError?.(null);
    }
  };

  const handleExampleClick = (example: string) => {
    setRepoUrl(example);
    const repoDetails = extractRepoDetails(example);
    if (repoDetails) {
      onRepoSubmit(repoDetails.owner, repoDetails.repo);
    }
  };

  const examples = [
    "https://github.com/subhomoy-roy-choudhury/iLoveGithub",
    "https://github.com/facebook/react",
    "https://github.com/vercel/next.js",
    "https://github.com/tailwindlabs/tailwindcss",
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto animate-fade-in">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Enter GitHub repository URL (e.g., https://github.com/user/repo)"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="pr-10 h-12 bg-github-lightGray dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              />
              <Search
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>
            <Button
              type="submit"
              className="h-12 bg-github-blue hover:bg-blue-700 text-white"
            >
              Analyze Repository
            </Button>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Try these examples:
            </p>
            <div className="flex flex-wrap gap-2">
              {examples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => handleExampleClick(example)}
                  className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {example.replace("https://github.com/", "")}
                </button>
              ))}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RepoSearch;
