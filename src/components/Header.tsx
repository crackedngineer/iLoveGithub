"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Github, Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white dark:bg-github-darkBlue border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Logo and Title */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <Github className="h-6 w-6 text-github-gray dark:text-white" />
          <Heart className="h-5 w-5 text-red-500" />
          <span className="text-lg sm:text-xl font-bold text-github-gray dark:text-white">
            iLoveGithub
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-github-gray dark:text-gray-300 hover:text-github-blue dark:hover:text-white"
            onClick={() =>
              window.open(
                "https://github.com/subhomoy-roy-choudhury/iLoveGithub?tab=readme-ov-file#-curated-github-tools",
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            Curated Tools
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-github-gray dark:text-gray-300 hover:text-github-blue dark:hover:text-white"
            onClick={() =>
              window.open(
                "https://github.com/subhomoy-roy-choudhury/iLoveGithub",
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            GitHub
          </Button>
          <a
            href="https://buymeacoffee.com/subhomoyrca"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              className="bg-github-pink text-white hover:bg-github-darkPink transition"
            >
              Donate ❤️
            </Button>
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-github-gray dark:text-white focus:outline-none"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-2 animate-slide-down">
          <Button
            variant="ghost"
            className="w-full justify-start text-github-gray dark:text-gray-300 hover:text-github-blue dark:hover:text-white"
            onClick={() => {
              setIsMenuOpen(false);
              window.open(
                "https://github.com/subhomoy-roy-choudhury/iLoveGithub?tab=readme-ov-file#-curated-github-tools",
                "_blank"
              );
            }}
          >
            Curated Tools
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-github-gray dark:text-gray-300 hover:text-github-blue dark:hover:text-white"
            onClick={() => {
              setIsMenuOpen(false);
              window.open(
                "https://github.com/subhomoy-roy-choudhury/iLoveGithub",
                "_blank"
              );
            }}
          >
            GitHub
          </Button>
          <a
            href="https://buymeacoffee.com/subhomoyrca"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button
              variant="outline"
              className="w-full bg-github-pink text-white hover:bg-github-darkPink"
            >
              Donate ❤️
            </Button>
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;
