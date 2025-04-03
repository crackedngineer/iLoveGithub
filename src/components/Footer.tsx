import React from "react";
import { Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 px-6 bg-github-lightGray dark:bg-github-darkBlue border-t border-gray-200 dark:border-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
        {/* Copyright Section */}
        <p>&copy; {currentYear} I Love GitHub. All rights reserved.</p>

        {/* Creator Section */}
        <p className="flex items-center gap-1 mt-3 md:mt-0">
          Made with <Heart className="h-4 w-4 text-red-500" /> by{" "}
          <a
            href="https://github.com/subhomoy-roy-choudhury/iLoveGithub"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-github-blue dark:hover:text-white transition-colors"
          >
            I Love GitHub Team
          </a>
        </p>

        {/* Sitemap Link */}
        <a
          href="/sitemap.xml"
          className="mt-3 md:mt-0 hover:text-github-blue dark:hover:text-white transition-colors"
        >
          Sitemap
        </a>
      </div>
    </footer>
  );
};

export default Footer;
