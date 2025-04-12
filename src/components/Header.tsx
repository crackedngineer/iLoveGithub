"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { appVersion } from "@/lib/version";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    setIsDarkMode(isDark);
  };

  return (
    <header className="w-full bg-white dark:bg-github-dark-blue border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm dark:shadow-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Logo and Title */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <Image
            alt="favicon"
            src={"/icons/favicon.png"}
            width={24}
            height={24}
          />
          <span className="text-lg sm:text-xl font-bold text-github-gray dark:text-white transition-colors">
            iLoveGithub
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            v{appVersion}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-github-gray dark:text-white/90 hover:text-github-blue dark:hover:text-white transition-colors"
            onClick={() =>
              window.open(
                "https://github.com/subhomoy-roy-choudhury/iLoveGithub/issues/new?template=new-tool-request.yml",
                "_blank"
              )
            }
          >
            Submit a Tool
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-github-gray dark:text-white/90 hover:text-github-blue dark:hover:text-white transition-colors"
            onClick={() =>
              window.open(
                "https://github.com/subhomoy-roy-choudhury/iLoveGithub",
                "_blank"
              )
            }
          >
            GitHub
          </Button>

          {/* 🌙 Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-github-gray dark:text-white/90 hover:text-github-blue dark:hover:text-white transition-colors duration-300"
            aria-label="Toggle Theme"
          >
            <span className="transition-transform duration-300 ease-in-out transform hover:rotate-180">
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </span>
          </Button>

          <a
            href="https://buymeacoffee.com/subhomoyrca"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              size="sm"
              variant="outline"
              className="bg-github-pink text-white hover:bg-github-darkPink border-none rounded-full px-4 transition-colors"
            >
              Donate ❤️
            </Button>
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-github-gray dark:text-white focus:outline-none transition-colors"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-2 animate-slide-down transition-colors">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-github-gray dark:text-white/90 hover:text-github-blue dark:hover:text-white"
            onClick={() =>
              window.open(
                "https://github.com/subhomoy-roy-choudhury/iLoveGithub/issues/new?template=new-tool-request.yml",
                "_blank"
              )
            }
          >
            Submit a Tool
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-github-gray dark:text-white/90 hover:text-github-blue dark:hover:text-white"
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
          {/* 🌙 Theme Toggle for Mobile */}
          <Button
            variant="ghost"
            className="w-full justify-start text-github-gray dark:text-white/90 hover:text-github-blue dark:hover:text-white"
            onClick={toggleTheme}
          >
            {isDarkMode ? "Light Mode ☀️" : "Dark Mode 🌙"}
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
