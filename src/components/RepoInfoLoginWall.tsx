"use client";

import React, {useState, useEffect, ReactNode} from "react";
import {Info} from "lucide-react";
import {useAuth} from "./AuthProvider";

interface RepoInfoLoginWallProps {
  children: ReactNode;
  isLoggedIn: boolean;
}

const RepoInfoLoginWall: React.FC<RepoInfoLoginWallProps> = ({children, isLoggedIn}) => {
  const {signInWithGitHub: signIn} = useAuth();
  const [showWall, setShowWall] = useState(!isLoggedIn);

  useEffect(() => {
    setShowWall(!isLoggedIn);
  }, [isLoggedIn]);

  const handleSignIn = () => {
    const currentPath = window.location.pathname;
    const parts = currentPath.split("/").filter(Boolean); // Split and remove empty strings

    const [owner, repo] = parts;
    const githubUrl = `https://github.com/${owner}/${repo}`;

    sessionStorage.setItem("pendingRepoUrl", githubUrl); // Save GitHub URL
    signIn();
  };

  if (!showWall) {
    return <>{children}</>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 relative">
      {/* Blurred background */}
      <div className="filter blur-sm opacity-40">{children}</div>

      {/* Login wall overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-6 max-w-sm w-full mx-4">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-4">
              <Info size={20} className="text-gray-500 dark:text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                Analysis Limit Reached
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              You've reached the maximum limit of {process.env.NEXT_PUBLIC_MAX_REPO_LIMIT}{" "}
              repository analyses. Please sign in to continue using this tool without limitations.
            </p>

            <button
              onClick={handleSignIn}
              className="text-sm text-github-blue hover:text-blue-700 underline"
            >
              Sign in to continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepoInfoLoginWall;
