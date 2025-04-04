import React from "react";
import { Loader } from "lucide-react";

interface LoadingScreenProps {
  tool: string;
  owner: string;
  repo: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ tool }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-950 z-50">
      <Loader className="h-10 w-10 text-github-blue animate-spin mb-2" />
      <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
        Loading <span className="font-semibold">{tool}</span>...
      </p>
    </div>
  );
};

export default LoadingScreen;
