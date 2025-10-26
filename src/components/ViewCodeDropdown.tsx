"use client";

import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {Github, ExternalLink} from "lucide-react";
import type {Tool} from "@/lib/types";
import {replaceUrlVariables} from "@/app/helper";

interface RepoLinkDropdownProps {
  owner: string;
  repo: string;
  branch: string;
  tools: Tool[];
}

const IconRenderer = ({className, icon}: {className: string; icon: string}) => {
  return <div dangerouslySetInnerHTML={{__html: icon}} className={`w-6 h-6 ${className}`} />;
};

export function ViewCodeDropdown({owner, repo, branch, tools}: RepoLinkDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1 w-fit">
          <ExternalLink size={14} />
          View Code
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a
            href={`https://github.com/${owner}/${repo}/tree/${branch}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <Github size={14} /> View on GitHub
          </a>
        </DropdownMenuItem>

        {tools.map((item: Tool) => (
          <DropdownMenuItem asChild key={item.name}>
            <a
              key={item.name}
              href={replaceUrlVariables(item.url, {owner, repo, branch})}
              className="flex items-center gap-2"
            >
              <div className="flex flex-row items-center">
                <IconRenderer className="content-center" icon={item.icon!} />
                <p>{item.title}</p>
              </div>
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
