import React from 'react';
import { ExternalLink, Star, GitFork, Eye, Calendar, GitBranch, FileCode } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export interface RepoData {
  name: string;
  owner: string;
  fullName: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  watchers: number;
  language: string;
  createdAt: string;
  updatedAt: string;
  topics: string[];
}

const RepoInfo = ({ repo }: { repo: RepoData }) => {
  const formattedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8 animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              {repo.name}
              <Badge variant="outline" className="ml-2 bg-github-lightGray text-github-gray">
                Public
              </Badge>
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400 mt-1">
              {repo.fullName}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-1" asChild>
            <a href={repo.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={14} />
              View on GitHub
            </a>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          {repo.description}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2 bg-github-lightGray dark:bg-gray-800 p-3 rounded-md">
            <Star className="text-yellow-500" size={20} />
            <div>
              <p className="text-xl font-semibold">{repo.stars.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Stars</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-github-lightGray dark:bg-gray-800 p-3 rounded-md">
            <GitFork className="text-github-blue" size={20} />
            <div>
              <p className="text-xl font-semibold">{repo.forks.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Forks</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-github-lightGray dark:bg-gray-800 p-3 rounded-md">
            <Eye className="text-purple-500" size={20} />
            <div>
              <p className="text-xl font-semibold">{repo.watchers.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Watchers</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-2">
            <FileCode size={16} className="text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Main language: </span>
            <Badge variant="secondary" className="bg-blue-100 text-github-blue dark:bg-blue-900 dark:text-blue-300">
              {repo.language}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Created: </span>
            <span className="text-sm font-medium">{formattedDate(repo.createdAt)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <GitBranch size={16} className="text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Last updated: </span>
            <span className="text-sm font-medium">{formattedDate(repo.updatedAt)}</span>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Topics:</h3>
          <div className="flex flex-wrap gap-2">
            {repo.topics.map((topic) => (
              <Badge key={topic} variant="outline" className="bg-blue-50 text-github-blue border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Repository Health</span>
            <span className="text-sm font-medium text-github-green">Good</span>
          </div>
          <Progress value={85} className="h-2" />
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-gray-100 dark:border-gray-800 pt-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This repository is one of the most popular in its category, with active development and a strong community.
        </p>
      </CardFooter>
    </Card>
  );
};

export default RepoInfo;