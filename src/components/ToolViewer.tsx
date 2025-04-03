import React, { useEffect, useState } from "react";
import { ExternalLink, Heart, Star, GitFork } from "lucide-react";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { RepoData } from "@/components/RepoInfo";

interface ToolViewerProps {
  url: string;
  repoData: RepoData;
  // onBack: () => void;
}

const ToolViewer: React.FC<ToolViewerProps> = ({
  url,
  repoData,
}: ToolViewerProps) => {
  const [bannerIndex, setBannerIndex] = useState(0);

  const bannerMessages = [
    // Repo Description
    <>
      <span className="font-medium">Description:</span> {repoData.description}
    </>,
    // GitHub Stats
    <>
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <Star className="h-4 w-4 mr-1 text-yellow-400" />
          <span>{repoData.stars.toLocaleString()} Stars</span>
        </div>
        <div className="flex items-center">
          <GitFork className="h-4 w-4 mr-1 text-blue-400" />
          <span>{repoData.forks.toLocaleString()} Forks</span>
        </div>
      </div>
    </>,
    // Sponsorship message
    <>
      <Heart className="h-4 w-4 mr-2 text-red-500" />
      <span>Support open source! Consider sponsoring this project</span>
    </>,
    // Donation message
    <>
      <span>❤️ Donate to keep this project alive and maintained</span>
    </>,
  ];

  // Cycle through banner messages
  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prevIndex) => (prevIndex + 1) % bannerMessages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [bannerMessages.length]);

  return (
    <div className="w-full h-screen flex flex-col bg-white dark:bg-gray-950">
      {/* Top banner */}
      <div className="w-full bg-github-blue text-white px-4 py-3 flex items-center justify-between">
        {/* <button
          onClick={onBack}
          className="text-sm bg-white/20 hover:bg-white/30 rounded px-3 py-1 transition-colors"
        >
          Back
        </button> */}

        <div className="flex-1 mx-4 overflow-hidden">
          <div className="animate-fade-in" key={bannerIndex}>
            <div className="flex items-center justify-center">
              {bannerMessages[bannerIndex]}
            </div>
          </div>
        </div>

        <a
          href={repoData.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-sm bg-white/20 hover:bg-white/30 rounded px-3 py-1 transition-colors"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          View on GitHub
        </a>
      </div>

      {/* Iframe container */}
      <div className="flex-1 w-full">
        <iframe
          src={url}
          title={`${repoData.name} tool`}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  );
};

export default ToolViewer;
