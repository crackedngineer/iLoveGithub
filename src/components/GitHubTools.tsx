"use client";

import React, { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // If you have a styled input component

const GitHubTools = ({
  owner,
  repo,
  default_branch = "master",
}: {
  owner: string;
  repo: string;
  default_branch: string;
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTools = GithubToolsList.filter((tool) => {
    const search = searchTerm.toLowerCase();
    return (
      tool.name.toLowerCase().includes(search) ||
      tool.description.toLowerCase().includes(search)
    );
  });

  const toolsByCategory = filteredTools.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-0 max-w-4xl mx-auto mt-10 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 text-center text-gray-800 dark:text-white">
        🔧 Popular GitHub Tools
      </h2>

      <div className="mb-8 flex items-center gap-2">
        {/* <Search className="text-gray-500 w-5 h-5" /> */}
        <Input
          type="text"
          placeholder="Search by title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {Object.entries(toolsByCategory).length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">
          No tools found matching &quot;{searchTerm}&quot;
        </p>
      ) : (
        Object.entries(toolsByCategory).map(([category, categoryTools]) => (
          <section key={category} className="mb-10 sm:mb-12">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 border-b pb-1 border-gray-200 dark:border-gray-700">
              {category}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {categoryTools.map((tool) => {
                const toolUrl = tool.iframe
                  ? `/tools/${tool.name}/${owner}/${repo}`
                  : replaceUrlVariables(tool.url, {
                      owner,
                      repo,
                      default_branch,
                    });

                return (
                  <Card
                    key={tool.name}
                    className="group transition-all duration-200 hover:shadow-xl hover:border-blue-500 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                  >
                    <CardHeader className="pb-1">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                        <Image
                          alt={`${tool.name} icon`}
                          src={tool.icon}
                          width={24}
                          height={24}
                          className="rounded-sm"
                        />
                        {tool.name}
                      </CardTitle>
                      <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="mt-2">
                      <Button
                        asChild
                        variant="link"
                        className="text-sm px-0 py-1"
                      >
                        <a
                          href={toolUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-github-blue hover:text-blue-700 group-hover:underline"
                        >
                          Visit Tool{" "}
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
};

export default GitHubTools;
