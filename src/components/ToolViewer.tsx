"use client";

import React, {useEffect, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {ExternalLink, ArrowLeft, ChevronRight} from "lucide-react";

interface ToolViewerProps {
  url: string;
  name: string; // "owner/repo"
}

const MESSAGES = [
  "Explore 100+ GitHub tools curated for developers.",
  "New tools added regularly — check back often.",
  "Found something useful? Share it with your team.",
  "Open source friendly. Free forever.",
];

const ToolViewer: React.FC<ToolViewerProps> = ({url, name}) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [owner, repo] = name.split("/");

  useEffect(() => {
    const id = setInterval(() => setMsgIndex((i) => (i + 1) % MESSAGES.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full h-screen flex flex-col bg-white dark:bg-gray-950">
      {/* ── Top bar — same glass style as main header ─────────── */}
      <header
        className="h-[52px] shrink-0 flex items-center
                         bg-white/90 dark:bg-[#0d1117]/90 backdrop-blur-md
                         border-b border-border relative"
      >
        {/* Bottom gradient rule */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px
                        bg-gradient-to-r from-github-blue via-gray-200 to-github-green
                        dark:via-gray-800 opacity-60"
        />

        <div className="flex items-center justify-between w-full px-4 sm:px-5 gap-4">
          {/* Left: back + breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/${owner}/${repo}`}
              className="flex items-center gap-1.5 text-xs text-muted-foreground
                         hover:text-foreground transition-colors shrink-0"
            >
              <ArrowLeft size={13} />
              <span className="hidden sm:inline">Back</span>
            </Link>

            <span className="w-px h-4 bg-border shrink-0" />

            {/* Brand */}
            <Link href="/" className="flex items-center gap-1.5 shrink-0 group">
              <Image
                src="/icons/favicon.png"
                alt="iLoveGithub"
                width={16}
                height={16}
                className="group-hover:rotate-12 transition-transform duration-300"
              />
              <span className="font-display text-[13px] font-bold text-foreground hidden sm:inline">
                iLove<span className="text-github-blue">Github</span>
              </span>
            </Link>

            <ChevronRight size={12} className="text-muted-foreground/50 shrink-0" />

            {/* Breadcrumb: owner/repo */}
            <span className="font-mono text-xs text-muted-foreground truncate">
              <span className="text-foreground font-medium">{owner}</span>
              <span className="text-border mx-0.5">/</span>
              <span className="text-foreground font-medium">{repo}</span>
            </span>
          </div>

          {/* Centre: rotating message */}
          <div className="hidden md:flex flex-1 items-center justify-center overflow-hidden px-4">
            <p
              key={msgIndex}
              className="text-[11px] text-muted-foreground text-center truncate animate-fade-in"
            >
              {MESSAGES[msgIndex]}
            </p>
          </div>

          {/* Right: open externally */}
          <a
            href={url}
            target="_top"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 shrink-0
                       text-xs font-medium text-github-blue
                       hover:underline transition-colors"
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">Open full</span>
          </a>
        </div>
      </header>

      {/* ── iframe ────────────────────────────────────────────── */}
      <div className="flex-1 w-full overflow-hidden">
        <iframe
          src={url}
          title={`${name} tool`}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  );
};

export default ToolViewer;
