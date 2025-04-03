"use client";
import React from "react";
import { Github, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();

  return (
    <header className="w-full py-4 px-6 flex items-center justify-between bg-white border-b border-gray-200 dark:bg-github-darkBlue dark:border-gray-800 sticky top-0 z-50">
      {/* Logo and Title */}
      <div
        className="flex items-center gap-3"
        onClick={() => {
          router.push("/");
        }}
      >
        <Github
          className="h-6 w-6 text-github-gray dark:text-white"
          aria-hidden="true"
        />
        <Heart className="h-5 w-5 text-red-500" aria-hidden="true" />
        <h1 className="text-xl font-bold text-github-gray dark:text-white">
          I Love GitHub
        </h1>
      </div>

      {/* Navigation & Actions */}
      <div className="flex items-center gap-4">
        {/* <Button
          variant="ghost"
          size="sm"
          className="text-github-gray dark:text-gray-300 hover:text-github-blue dark:hover:text-white"
        >
          Home
        </Button> */}
        <Button
          variant="ghost"
          size="sm"
          className="text-github-gray dark:text-gray-300 hover:text-github-blue dark:hover:text-white"
        >
          Curated Tools
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-github-gray dark:text-gray-300 hover:text-github-blue dark:hover:text-white"
          onClick={() => {
            window.open(
              "https://github.com/subhomoy-roy-choudhury/iLoveGithub",
              "_blank",
              "noopener,noreferrer"
            );
          }}
        >
          GitHub
        </Button>

        {/* GitHub Stars Widget */}
        {/* <iframe
          src="https://ghbtns.com/github-btn.html?user=subhomoy-roy-choudhury&repo=iLoveGithub&type=star&count=true&size=small"
          frameBorder="0"
          scrolling="0"
          width="100"
          height="20"
          title="GitHub Stars"
          className="hidden sm:block"
        ></iframe> */}

        {/* Donation Button */}
        <a
          href="https://buymeacoffee.com/subhomoyrca"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="outline"
            className="bg-github-pink text-white hover:bg-github-darkPink"
          >
            Donate ❤️
          </Button>
        </a>
      </div>
    </header>
  );
};

export default Header;
