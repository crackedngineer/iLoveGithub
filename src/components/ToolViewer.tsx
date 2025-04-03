import React, { useEffect, useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ExternalLink, Star, GitFork, Coffee } from "lucide-react";
import { RepoData } from "./RepoInfo";

interface ToolViewerProps {
  url: string;
  repoData: RepoData;
}

const ToolViewer: React.FC<ToolViewerProps> = ({ url, repoData }) => {
  const [bannerIndex, setBannerIndex] = useState(0);

  const bannerMessages = [
    // Repo Description
    <>
      <div className="flex gap-2">
        <span className="font-medium">What is I Love GitHub?</span> A curated
        collection of awesome GitHub tools and resources.
      </div>
    </>,
    // GitHub Stats
    // <>
    //   <div className="flex items-center space-x-4">
    //     <div className="flex items-center">
    //       <Star className="h-4 w-4 mr-1 text-yellow-400" />
    //       <span>{repoData.stars.toLocaleString()} Stars</span>
    //     </div>
    //     <div className="flex items-center">
    //       <GitFork className="h-4 w-4 mr-1 text-blue-400" />
    //       <span>{repoData.forks.toLocaleString()} Forks</span>
    //     </div>
    //   </div>
    // </>,
    // Donation Message (Buy Me a Coffee)
    <>
      <Coffee className="h-4 w-4 mr-2 text-yellow-500" />
      <span>
        Love this project?{" "}
        <a
          href="https://buymeacoffee.com/subhomoyrc"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white"
        >
          Buy Me a Coffee
        </a>{" "}
        and support open source!
      </span>
    </>,
    // Original iFrame Source
    <>
      <div className="flex gap-2">
        🔗 Looking for the original tool?{" "}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white"
        >
          Click here to visit.
        </a>
      </div>
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
      {/* Top Banner with Branding */}
      <div className="w-full bg-github-blue text-white px-6 py-3 flex items-center justify-between">
        {/* Branding */}
        <div className="text-lg font-semibold">❤️ I Love GitHub</div>

        {/* Rotating Banner Messages */}
        <div className="flex-1 mx-4 overflow-hidden">
          <div className="animate-fade-in" key={bannerIndex}>
            <div className="flex items-center justify-center">
              {bannerMessages[bannerIndex]}
            </div>
          </div>
        </div>

        {/* GitHub Repo Link */}
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

      {/* iFrame Container */}
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
