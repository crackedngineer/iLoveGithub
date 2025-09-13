import React from "react";
import Image from "next/image";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 px-4 sm:px-6 bg-github-light-gray dark:bg-github-dark-blue border-t border-gray-200 dark:border-gray-800">
      <div className="flex flex-col gap-2 md:flex-row md:justify-center md:items-center text-sm text-center md:text-left text-gray-500 dark:text-gray-400">
        {/* Copyright */}
        <p>&copy; {currentYear} iLoveGithub</p>

        {/* Separator only for desktop */}
        <span className="hidden sm:inline">•</span>

        {/* Creator Info */}
        <p className="flex justify-center md:justify-start items-center gap-2">
          <span>Made in</span>
          <Image src="/icons/indian-flag.svg" alt="Indian Flag" width={18} height={18} />
          <span>by</span>
          <a
            href="https://github.com/crackedngineer/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-github-blue dark:hover:text-white transition-colors"
          >
            Subhomoy Roy Choudhury
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
