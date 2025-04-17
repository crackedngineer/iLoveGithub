"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { appVersion } from "@/lib/version";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    setIsDarkMode(isDark);
  };

  return (
    <header className="w-full bg-white dark:bg-github-dark-blue border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm dark:shadow-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <Image
            alt="favicon"
            src={"/icons/favicon.png"}
            width={24}
            height={24}
          />
          <span className="text-lg sm:text-xl font-bold text-github-gray dark:text-white">
            iLoveGithub
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            v{appVersion}
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-github-gray dark:text-white/90 hover:text-github-blue dark:hover:text-white"
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
            className="text-github-gray dark:text-white/90 hover:text-github-blue dark:hover:text-white"
            onClick={() =>
              window.open(
                "https://github.com/subhomoy-roy-choudhury/iLoveGithub",
                "_blank"
              )
            }
          >
            GitHub
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-github-gray dark:text-white/90 hover:text-github-blue dark:hover:text-white"
            aria-label="Toggle Theme"
          >
            <span className="transition-transform duration-300 ease-in-out transform hover:rotate-180">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
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
              className="bg-github-pink text-white hover:bg-github-darkPink border-none rounded-full px-4"
            >
              Donate ❤️
            </Button>
          </a>

          {session?.githubProfile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-github-blue">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 p-2">
                <DropdownMenuLabel className="text-sm text-muted-foreground">
                  Signed in as
                </DropdownMenuLabel>
                <div className="px-2 py-1">
                  <p className="text-sm font-medium text-github-gray dark:text-white truncate">
                    {session.user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {session.user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <button
          className="md:hidden p-2 text-github-gray dark:text-white focus:outline-none"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-2 animate-slide-down">
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
