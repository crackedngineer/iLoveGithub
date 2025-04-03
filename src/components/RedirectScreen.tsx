import React from 'react';
import { Loader } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface LoadingScreenProps {
  progress: number;
}

const RedirectScreen: React.FC<LoadingScreenProps> = ({ progress }) => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-950 flex flex-col items-center justify-center z-50">
      <div className="w-full max-w-md px-4 flex flex-col items-center">
        <Loader className="h-12 w-12 text-github-blue animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-github-gray dark:text-white mb-2">
          Loading GitHub Tool
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
          Please wait while we prepare your tool experience
        </p>
        <Progress value={progress} className="w-full h-2 mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">{progress}% complete</p>
      </div>
    </div>
  );
};

export default RedirectScreen;