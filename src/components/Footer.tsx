import React from "react";
import Image from "next/image";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 px-6 bg-github-lightGray dark:bg-github-darkBlue border-t border-gray-200 dark:border-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
        {/* Copyright Section */}
        <p>&copy; {currentYear} iLoveGithub. All rights reserved.</p>

        {/* Creator Section */}
        <p className="flex items-center gap-2 mt-3 md:mt-0">
          Made in
          <Image
            src="/icons/indian-flag.svg"
            alt="Indian Flag"
            width={24}
            height={24}
          />
          by
          <a
            href="https://github.com/subhomoy-roy-choudhury/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-github-blue dark:hover:text-white transition-colors"
          >
            Subhomoy Roy Choudhury
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
