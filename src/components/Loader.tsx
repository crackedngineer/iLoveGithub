"use client";

import {appVersion} from "@/lib/version";

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 text-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-500">
      <div className="flex flex-col sm:flex-row items-center gap-3 animate-[pulse_1.2s_ease-in-out_infinite]">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-github-blue to-github-green bg-clip-text text-transparent">
          Welcome to iLoveGithub{" "}
          <span className="block sm:inline text-base sm:text-sm font-normal">v{appVersion}</span>
        </h1>
      </div>
    </div>
  );
}
