"use client";

import React, {useState, useEffect} from "react";
import Link from "next/link";
import Image from "next/image";
import {Menu, X, Sun, Moon, User, Coffee, QrCode} from "lucide-react";
import {Button} from "@/components/ui/button";
import {appVersion} from "@/lib/version";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {GitHubStarsButton} from "@/components/ui/shadcn-io/github-stars-button";
import DonationModal from "./DonationModal";
import {
  BUY_ME_COFFEE_URL,
  SUBSTACK_NEWSLETTER_URL,
  GITHUB_REPO_URL,
  GITHUB_SUBMIT_TOOL_URL,
  DEMO_VIDEO_URL,
  DefaultGithubRepo,
} from "@/constants";
import {RateLimitDisplay} from "./RateLimitDisplay";
import {useAppLocation} from "./AppLocationProvider";
import {useAuth} from "./AuthProvider";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const {isInIndia} = useAppLocation();
  const {session, signOut, signInWithGitHub} = useAuth();

  const status = session ? "authenticated" : "unauthenticated";

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
        <Link href="/" className="flex items-center gap-3 sm:gap-4">
          <Image alt="favicon" src="/icons/favicon.png" width={24} height={24} />
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-bold text-github-gray dark:text-white">
                iLoveGithub
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">v{appVersion}</span>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 -mt-0.5">
              by Oderna Technologies
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(GITHUB_SUBMIT_TOOL_URL, "_blank")}
          >
            Submit a Tool
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(SUBSTACK_NEWSLETTER_URL, "_blank")}
          >
            Join Newsletter
          </Button>

          {/* GitHub API Rate Limit Display */}
          {status === "unauthenticated" && <RateLimitDisplay />}

          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle Theme">
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 bg-github-pink text-white hover:bg-github-darkPink border-none rounded-full px-4 py-5"
              >
                Donate ❤️
              </Button>
            </DropdownMenuTrigger>
            {!isDonationModalOpen && (
              <DropdownMenuContent className="w-48 bg-white dark:bg-gray-800 p-2">
                <DropdownMenuItem onClick={() => window.open(BUY_ME_COFFEE_URL, "_blank")}>
                  <Coffee className="h-4 w-4 mr-2" />
                  Buy me a coffee
                </DropdownMenuItem>
                {isInIndia && (
                  <DropdownMenuItem onClick={() => setIsDonationModalOpen(true)}>
                    <QrCode className="h-4 w-4 mr-2" />
                    Scan QR code
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            )}
          </DropdownMenu>

          {/* Github Stars Button */}
          <GitHubStarsButton
            username={DefaultGithubRepo.owner}
            repo={DefaultGithubRepo.repo}
            onClick={() => window.open(GITHUB_REPO_URL, "_blank")}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full">
                {session?.user?.user_metadata?.avatar_url ? (
                  <Image
                    src={session.user.user_metadata.avatar_url}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-300 dark:bg-gray-600 rounded-full">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2">
              {session ? (
                <>
                  <DropdownMenuLabel className="text-sm text-muted-foreground">
                    Signed in as
                  </DropdownMenuLabel>
                  <div className="px-2 py-1">
                    <p className="text-sm font-medium truncate">
                      {session.user?.user_metadata?.user_name ||
                        session.user?.user_metadata?.name ||
                        "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {session.user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => signOut()}
                  >
                    Log out
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem
                  className="cursor-pointer text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={signInWithGitHub}
                >
                  Sign in with GitHub
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <button
          className="md:hidden p-2 text-github-gray dark:text-white"
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
            onClick={() => window.open(GITHUB_SUBMIT_TOOL_URL, "_blank")}
          >
            Submit a Tool
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-github-gray dark:text-white/90 hover:text-github-blue dark:hover:text-white"
            onClick={() => {
              setIsMenuOpen(false);
              window.open(SUBSTACK_NEWSLETTER_URL, "_blank");
            }}
          >
            Join Newsletter
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-github-gray dark:text-white/90 hover:text-github-blue dark:hover:text-white"
            onClick={toggleTheme}
          >
            {isDarkMode ? "Light Mode ☀️" : "Dark Mode 🌙"}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-github-gray dark:text-white/90 hover:text-github-blue dark:hover:text-white"
            onClick={() => {
              window.open(DEMO_VIDEO_URL, "_blank");
            }}
          >
            Demo
          </Button>
          {session && (
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 mt-1"
              onClick={() => signOut()}
            >
              Log out
            </Button>
          )}
          <a href={BUY_ME_COFFEE_URL} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button
              variant="ghost"
              className="w-full justify-start text-github-gray dark:text-white/90 hover:text-github-blue dark:hover:text-white"
            >
              Donate ❤️
            </Button>
          </a>

          <GitHubStarsButton
            username={DefaultGithubRepo.owner}
            repo={DefaultGithubRepo.repo}
            onClick={() => {
              setIsMenuOpen(false);
              window.open(GITHUB_REPO_URL, "_blank");
            }}
          />
        </div>
      )}

      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        isIndiaLocation={isInIndia}
      />
    </header>
  );
};

export default Header;
