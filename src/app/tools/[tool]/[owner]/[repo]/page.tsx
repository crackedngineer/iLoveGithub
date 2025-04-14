"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { GithubToolsList } from "@/constants";
import { replaceUrlVariables } from "@/app/helper";
import { useParams } from "next/navigation";
import ToolViewer from "@/components/ToolViewer";
import LoadingScreen from "@/components/LoadingScreen";

export default function ToolsPage() {
  const params = useParams() as { tool: string; owner: string; repo: string };
  const { tool, owner, repo } = params;

  const toolData = GithubToolsList.find((item) => item.name === tool);
  const toolLink = toolData?.url
    ? replaceUrlVariables(toolData.url, {
        owner,
        repo,
      })
    : null;

  const [showViewer, setShowViewer] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowViewer(true);
    }, 1500); // show loading for at least 1.5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen w-full overflow-hidden">
      {toolLink && showViewer ? (
        <ToolViewer url={toolLink} name={`${owner}/${repo}`} />
      ) : (
        <LoadingScreen tool={tool} owner={owner} repo={repo} />
      )}
    </div>
  );
}
