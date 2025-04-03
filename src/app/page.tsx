"use client"
import "./style.css";
import { useState } from "react";
import RepoSearch from '@/components/RepoSearch';
import RepoInfo, { RepoData } from '@/components/RepoInfo';
import GitHubTools from '@/components/GitHubTools';
import { fetchRepoDetails } from '@/services/githubService';

export default function Home() {
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleRepoSubmit = async (owner: string, repo: string) => {
    setLoading(true);
    setHasSearched(true);

    try {
      const githubData = await fetchRepoDetails(owner, repo);

      // Transform GitHub API response to our RepoData format
      const transformedData: RepoData = {
        name: githubData.name,
        owner: owner,
        fullName: githubData.full_name,
        description: githubData.description || 'No description provided',
        url: githubData.html_url,
        stars: githubData.stargazers_count,
        forks: githubData.forks_count,
        watchers: githubData.watchers_count,
        language: githubData.language || 'Not specified',
        createdAt: githubData.created_at,
        updatedAt: githubData.updated_at,
        topics: githubData.topics || []
      };

      setRepoData(transformedData);

      // toast({
      //   title: "Repository loaded",
      //   description: `Successfully loaded ${owner}/${repo}`,
      // });
    } catch (error) {
      console.error(error);

      // Fallback to mock data for demo or when API limit is reached
      const mockRepoData: RepoData = {
        name: repo,
        owner: owner,
        fullName: `${owner}/${repo}`,
        description: repo === 'react'
          ? 'A declarative, efficient, and flexible JavaScript library for building user interfaces.'
          : repo === 'next.js'
            ? 'The React Framework for Production'
            : 'A utility-first CSS framework for rapid UI development',
        url: `https://github.com/${owner}/${repo}`,
        stars: repo === 'react' ? 198000 : repo === 'next.js' ? 96000 : 62000,
        forks: repo === 'react' ? 40500 : repo === 'next.js' ? 21200 : 3400,
        watchers: repo === 'react' ? 6800 : repo === 'next.js' ? 3100 : 1200,
        language: repo === 'react' ? 'JavaScript' : repo === 'next.js' ? 'TypeScript' : 'CSS',
        createdAt: '2013-05-24T16:15:54Z',
        updatedAt: '2023-07-12T23:22:15Z',
        topics: repo === 'react'
          ? ['react', 'javascript', 'library', 'frontend', 'ui']
          : repo === 'next.js'
            ? ['nextjs', 'react', 'framework', 'jamstack', 'vercel']
            : ['css', 'tailwind', 'framework', 'responsive', 'utility']
      };

      setRepoData(mockRepoData);

      // toast({
      //   variant: "destructive",
      //   title: "Error fetching repository",
      //   description: "Using mock data instead. GitHub API may have rate limits.",
      // });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-github-gray dark:text-white mb-4">
          Discover GitHub Tools
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Explore GitHub repositories and find the best tools to enhance your GitHub experience
        </p>
      </div>

      <RepoSearch onRepoSubmit={handleRepoSubmit} />

      {loading && (
        <div className="w-full max-w-4xl mx-auto mt-8 flex justify-center">
          <div className="animate-pulse-subtle flex flex-col items-center">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
            <div className="h-4 w-96 bg-gray-200 dark:bg-gray-800 rounded mb-3"></div>
            <div className="h-4 w-80 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>
        </div>
      )}

      {!loading && repoData && <RepoInfo repo={repoData} />}

      {hasSearched && repoData && <GitHubTools owner={repoData.owner} repo={repoData.name} />}
    </main>
  );
}
