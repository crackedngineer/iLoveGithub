import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GithubToolsList } from "@/constants";
import { Tool } from "@/lib/types";
import { replaceUrlVariables } from "@/app/helper";


const GitHubTools = ({ owner, repo }: { owner: string; repo: string }) => {
  // Group tools by category
  const toolsByCategory = Object.values(GithubToolsList).reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  return (
    <div className="w-full max-w-4xl mx-auto mt-10 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-github-gray dark:text-white">
        Popular GitHub Tools
      </h2>

      {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
        <div key={category} className="mb-8">
          <h3 className="text-lg font-medium mb-4 text-github-gray dark:text-gray-300">
            {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryTools.map((tool) => (
              <Card
                key={tool.name}
                className="overflow-hidden hover:shadow-md transition-shadow group"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Image
                      alt={""}
                      src={tool.icon}
                      width={24}
                      height={24}
                    />
                    {tool.name}
                  </CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <a
                    href={replaceUrlVariables(tool.url, { owner, repo })}
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
