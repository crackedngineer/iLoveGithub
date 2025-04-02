
import React from 'react';
import { Github, Search, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="w-full py-4 px-6 flex items-center justify-between bg-white border-b border-gray-200 dark:bg-github-darkBlue dark:border-gray-800 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <Github className="h-6 w-6 text-github-gray dark:text-white" aria-hidden="true" />
        <Heart className="h-5 w-5 text-red-500" aria-hidden="true" />
        <h1 className="text-xl font-bold text-github-gray dark:text-white">I Love GitHub</h1>
      </div>
      <nav aria-label="Main Navigation">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-github-gray dark:text-gray-300 hover:text-github-blue dark:hover:text-white">
            Home
          </Button>
          <Button variant="ghost" size="sm" className="text-github-gray dark:text-gray-300 hover:text-github-blue dark:hover:text-white">
            Curated Tools
          </Button>
          <Button variant="ghost" size="sm" className="text-github-gray dark:text-gray-300 hover:text-github-blue dark:hover:text-white">
            About
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="ml-2"
            aria-label="Search"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;