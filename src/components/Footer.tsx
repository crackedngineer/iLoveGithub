import React from "react";
import Image from "next/image";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 px-4 sm:px-6 bg-github-lightGray dark:bg-github-darkBlue border-t border-gray-200 dark:border-gray-800">
      <div className="flex flex-col gap-y-4 md:flex-row md:justify-between md:items-center text-sm text-center md:text-left text-gray-500 dark:text-gray-400">
        {/* Copyright */}
        <p>&copy; {currentYear} iLoveGithub. All rights reserved.</p>

        {/* Creator Info */}
        <p className="flex justify-center md:justify-start items-center gap-2">
          Made in
          <Image
            src="/icons/indian-flag.svg"
            alt="Indian Flag"
            width={20}
            height={20}
            className="inline"
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

        {/* Sitemap */}
        <a
          href="/sitemap.xml"
          className="hover:text-github-blue dark:hover:text-white transition-colors"
        >
          Sitemap
        </a>
      </div>
    </footer>
  );
};

export default Footer;
