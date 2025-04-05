import React, { useEffect, useState } from "react";
import { ExternalLink, Coffee } from "lucide-react";
import { RepoData } from "./RepoInfo";

interface ToolViewerProps {
  url: string;
  repoData: RepoData;
}

const ToolViewer: React.FC<ToolViewerProps> = ({ url, repoData }) => {
  const [bannerIndex, setBannerIndex] = useState(0);

  const bannerMessages = [
    <>
      <div className="flex gap-2 items-center flex-wrap text-sm sm:text-base text-center sm:text-left">
        <span className="font-medium">❤️ iLoveGithub</span> is your curated
        hub for exploring the coolest GitHub tools and open source gems.
      </div>
    </>,
    <>
      <div className="flex items-center gap-2 flex-wrap text-sm sm:text-base text-center sm:text-left">
        <Coffee className="h-4 w-4 text-yellow-500" />
        <span>
          Fuel this project with ☕!{" "}
          <a
            href="https://buymeacoffee.com/subhomoyrca"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            Buy Me a Coffee
          </a>{" "}
          if you find it helpful.
        </span>
      </div>
    </>,
    <>
      <div className="flex items-center gap-2 flex-wrap text-sm sm:text-base text-center sm:text-left">
        🔗 Want the real deal?{" "}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white"
        >
          Click here to open the original tool.
        </a>
      </div>
    </>,
    <>
      <div className="flex items-center gap-2 flex-wrap text-sm sm:text-base text-center sm:text-left">
        <Coffee className="h-4 w-4 text-yellow-500" />
        <span>
          Like the work? Help keep it going.{" "}
          <a
            href="https://buymeacoffee.com/subhomoyrca"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            Support with a coffee
          </a>{" "}
          ☕️
        </span>
      </div>
    </>,
    <>
      <div className="flex items-center gap-2 flex-wrap text-sm sm:text-base text-center sm:text-left">
        🚀 New tools added weekly! Stay curious, stay building 💡
      </div>
    </>,
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prevIndex) => (prevIndex + 1) % bannerMessages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [bannerMessages.length]);

  return (
    <div className="w-full h-screen flex flex-col bg-white dark:bg-gray-950">
      {/* Top Banner with Branding */}
      <div className="w-full bg-github-blue text-white px-4 sm:px-6 py-3 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        {/* Branding */}
        <div className="text-base sm:text-lg font-semibold whitespace-nowrap">
          ❤️ iLoveGithub
        </div>

        {/* Rotating Banner Messages (hidden on mobile) */}
        <div className="hidden sm:flex flex-1 mx-4 overflow-hidden">
          <div className="animate-fade-in truncate w-full" key={bannerIndex}>
            <div className="flex items-center justify-center truncate">
              {bannerMessages[bannerIndex]}
            </div>
          </div>
        </div>

        {/* Open Fullscreen Button */}
        <a
          href={url}
          target="_top"
          rel="noopener noreferrer"
          className="flex-shrink-0 text-xs sm:text-sm bg-white/20 hover:bg-white/30 rounded px-2 sm:px-3 py-1 transition-colors flex items-center gap-1"
        >
          <span className="hidden sm:inline">Open in Full Window</span>
          <span className="sm:hidden">Open</span>
          <ExternalLink className="h-4 w-4" />
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
