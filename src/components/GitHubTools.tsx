import React from 'react';
import { ArrowRight, Code, GitBranch, GitPullRequest, GitMerge, Search, Download, Terminal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Tool {
    name: string;
    description: string;
    url: string;
    icon: React.ElementType;
    category: string;
}

const tools: Tool[] = [
    {
        name: 'GitHub CLI',
        description: 'Command line tool for interacting with GitHub from your terminal',
        url: 'https://cli.github.com/',
        icon: Terminal,
        category: 'Development'
    },
    {
        name: 'GitHub Desktop',
        description: 'Simplified GitHub workflow using a GUI',
        url: 'https://desktop.github.com/',
        icon: Download,
        category: 'Development'
    },
    {
        name: 'GitHub Codespaces',
        description: 'Cloud development environment integrated with GitHub',
        url: 'https://github.com/features/codespaces',
        icon: Code,
        category: 'Development'
    },
    {
        name: 'GitKraken',
        description: 'Powerful Git GUI for version control',
        url: 'https://www.gitkraken.com/',
        icon: GitBranch,
        category: 'Git Client'
    },
    {
        name: 'Sourcegraph',
        description: 'Code search and intelligence platform',
        url: 'https://about.sourcegraph.com/',
        icon: Search,
        category: 'Code Search'
    },
    {
        name: 'Dependabot',
        description: 'Automated dependency updates',
        url: 'https://github.com/dependabot',
        icon: GitMerge,
        category: 'Security'
    },
    {
        name: 'Pull Panda',
        description: 'Pull request management and code review tools',
        url: 'https://pullpanda.com/',
        icon: GitPullRequest,
        category: 'Productivity'
    },
    {
        name: 'GitHub Actions',
        description: 'Automate your workflow from idea to production',
        url: 'https://github.com/features/actions',
        icon: Code,
        category: 'CI/CD'
    },
];

const GitHubTools = () => {
    // Group tools by category
    const toolsByCategory = tools.reduce((acc, tool) => {
        if (!acc[tool.category]) {
            acc[tool.category] = [];
        }
        acc[tool.category].push(tool);
        return acc;
    }, {} as Record<string, Tool[]>);

    return (
        <div className="w-full max-w-4xl mx-auto mt-10 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-github-gray dark:text-white">Popular GitHub Tools</h2>

            {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
                <div key={category} className="mb-8">
                    <h3 className="text-lg font-medium mb-4 text-github-gray dark:text-gray-300">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categoryTools.map((tool) => (
                            <Card key={tool.name} className="overflow-hidden hover:shadow-md transition-shadow group">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <tool.icon className="h-5 w-5 text-github-blue" />
                                        {tool.name}
                                    </CardTitle>
                                    <CardDescription>{tool.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <a
                                        href={tool.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-github-blue hover:text-blue-700 text-sm font-medium group"
                                    >
                                        Visit Website
                                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </a>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default GitHubTools;