"use client";

import React, {useState, useEffect} from "react";
import Link from "next/link";
import Image from "next/image";
import {Menu, X, Sun, Moon, User, Coffee, QrCode} from "lucide-react";
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
  DefaultGithubRepo,
} from "@/constants";
import {RateLimitDisplay} from "./RateLimitDisplay";
import {useAppLocation} from "./AppLocationProvider";
import {useAuth} from "./AuthProvider";
import type {Session} from "@supabase/supabase-js";

/* ── Nav text link ─────────────────────────────────────────── */
function NavLink({onClick, children}: {onClick: () => void; children: React.ReactNode}) {
  return (
    <button
      onClick={onClick}
      className="relative text-sm text-gray-500 dark:text-gray-400 hover:text-foreground
                 transition-colors duration-150 py-1 group whitespace-nowrap"
    >
      {children}
      <span className="absolute bottom-0 left-0 h-px w-0 bg-github-blue group-hover:w-full transition-all duration-200" />
    </button>
  );
}

/* ── Sliding pill theme toggle ─────────────────────────────── */
function ThemeToggle({isDark, onToggle}: {isDark: boolean; onToggle: () => void}) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative w-[50px] h-[26px] rounded-full shrink-0
                 bg-gray-200 dark:bg-gray-700 transition-colors duration-300
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-github-blue/50"
    >
      <span
        className="absolute top-[3px] w-5 h-5 rounded-full shadow-sm
                   flex items-center justify-center bg-white dark:bg-gray-900
                   transition-[left] duration-300 left-[3px] dark:left-[27px]"
      >
        {isDark ? (
          <Moon size={10} className="text-gray-500" />
        ) : (
          <Sun size={10} className="text-yellow-500" />
        )}
      </span>
    </button>
  );
}

/* ── User avatar dropdown ──────────────────────────────────── */
export function UserDropdown({
  session,
  signOut,
  signInWithGitHub,
}: {
  session: Session;
  signOut: () => void;
  signInWithGitHub: () => void;
}) {
  const user = session?.user?.user_metadata;
  const isLoggedIn = Boolean(session);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={() => !isLoggedIn && signInWithGitHub()}
          className="rounded-full ring-2 ring-transparent hover:ring-github-blue/30
                     transition-all duration-200 focus:outline-none shrink-0"
          aria-label={isLoggedIn ? "User menu" : "Sign in with GitHub"}
        >
          {user?.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt="Profile"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-8 h-8 flex items-center justify-center
                            bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700"
            >
              <User className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </button>
      </DropdownMenuTrigger>

      {isLoggedIn && (
        <DropdownMenuContent align="end" className="w-52 p-2">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal pb-0">
            Signed in as
          </DropdownMenuLabel>
          <div className="px-2 py-1.5">
            <p className="text-sm font-semibold truncate">
              {user?.user_name || user?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={signOut}
            className="cursor-pointer text-sm text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}

/* ── Header ────────────────────────────────────────────────── */
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const {isInIndia} = useAppLocation();
  const {session, signOut, signInWithGitHub} = useAuth();

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    setIsDarkMode(isDark);
  };

  return (
    <header
      className="w-full sticky top-0 z-50
                       bg-white/90 dark:bg-[#0d1117]/90 backdrop-blur-md
                       transition-colors duration-300"
    >
      {/* Bottom gradient rule */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px
                      bg-gradient-to-r from-github-blue via-gray-200 to-github-green
                      dark:via-gray-800 opacity-60"
      />

      {/* ── Main bar ──────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[60px] flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <Image
            alt="iLoveGithub"
            src="/icons/favicon.png"
            width={22}
            height={22}
            className="group-hover:rotate-12 transition-transform duration-300"
          />
          <span className="font-display text-[15px] font-bold tracking-tight text-github-gray dark:text-white">
            iLove<span className="text-github-blue">Github</span>
            <span className="ml-1.5 text-[10px] font-mono font-normal text-gray-400 dark:text-gray-600 tracking-wider">
              v{appVersion}
            </span>
          </span>
        </Link>

        {/* Hairline divider + nav (desktop) */}
        <div className="hidden md:flex items-center gap-5">
          <span className="w-px h-5 bg-gray-200 dark:bg-gray-700 shrink-0" />
          <NavLink onClick={() => window.open(GITHUB_SUBMIT_TOOL_URL, "_blank")}>
            Submit a Tool
          </NavLink>
          <NavLink onClick={() => window.open(SUBSTACK_NEWSLETTER_URL, "_blank")}>
            Newsletter
          </NavLink>
        </div>

        {/* Push right */}
        <div className="flex-1" />

        {/* ── Right actions (desktop) — all h-9 ─────────────── */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Rate limit — only when not logged in */}
          {!session && (
            <div className="mr-1">
              <RateLimitDisplay />
            </div>
          )}

          <ThemeToggle isDark={isDarkMode} onToggle={toggleTheme} />

          {/* Donate */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium
                           bg-github-pink hover:bg-github-dark-pink text-white
                           transition-colors duration-150 shrink-0 focus:outline-none"
              >
                <span className="animate-pulse-subtle text-[13px] leading-none">♥</span>
                Donate
              </button>
            </DropdownMenuTrigger>
            {!isDonationModalOpen && (
              <DropdownMenuContent align="end" className="w-44 p-1.5">
                <DropdownMenuItem
                  className="cursor-pointer text-sm gap-2"
                  onClick={() => window.open(BUY_ME_COFFEE_URL, "_blank")}
                >
                  <Coffee className="h-3.5 w-3.5 shrink-0" />
                  Buy me a coffee
                </DropdownMenuItem>
                {isInIndia && (
                  <DropdownMenuItem
                    className="cursor-pointer text-sm gap-2"
                    onClick={() => setIsDonationModalOpen(true)}
                  >
                    <QrCode className="h-3.5 w-3.5 shrink-0" />
                    Scan QR code
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            )}
          </DropdownMenu>

          {/* Stars — hidden at md, shown from lg to avoid crowding */}
          <div className="hidden lg:block">
            <GitHubStarsButton
              username={DefaultGithubRepo.owner}
              repo={DefaultGithubRepo.repo}
              className="h-9 text-sm px-3"
              onClick={() => window.open(GITHUB_REPO_URL, "_blank")}
            />
          </div>

          <UserDropdown session={session!} signOut={signOut} signInWithGitHub={signInWithGitHub} />
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-1.5 -mr-1 rounded-md text-gray-600 dark:text-gray-300
                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onClick={() => setIsMenuOpen((p) => !p)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────── */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 animate-slide-down">
          <div className="px-3 py-2 space-y-0.5">
            {/* Nav links */}
            {[
              {label: "Submit a Tool", href: GITHUB_SUBMIT_TOOL_URL},
              {label: "Newsletter", href: SUBSTACK_NEWSLETTER_URL},
              {label: "Repository", href: GITHUB_REPO_URL},
            ].map(({label, href}) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center h-11 px-3 rounded-lg text-sm
                           text-gray-700 dark:text-gray-300
                           hover:bg-gray-50 dark:hover:bg-gray-800/60
                           hover:text-github-blue dark:hover:text-white
                           transition-colors"
              >
                {label}
              </a>
            ))}

            <div className="py-1">
              <div className="h-px bg-gray-100 dark:bg-gray-800" />
            </div>

            {/* Theme + Donate row */}
            <div className="flex items-center justify-between h-11 px-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isDarkMode ? "Dark mode" : "Light mode"}
              </span>
              <ThemeToggle isDark={isDarkMode} onToggle={toggleTheme} />
            </div>

            <a
              href={BUY_ME_COFFEE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 h-11 px-3 rounded-lg text-sm
                         text-github-pink hover:bg-gray-50 dark:hover:bg-gray-800/60
                         transition-colors"
            >
              <span className="animate-pulse-subtle">♥</span>
              Donate
            </a>

            <div className="py-1">
              <div className="h-px bg-gray-100 dark:bg-gray-800" />
            </div>

            {/* Auth */}
            {session ? (
              <button
                className="flex items-center h-11 px-3 w-full rounded-lg text-sm
                           text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                onClick={() => {
                  signOut();
                  setIsMenuOpen(false);
                }}
              >
                Log out
              </button>
            ) : (
              <button
                className="flex items-center h-11 px-3 w-full rounded-lg text-sm
                           text-gray-700 dark:text-gray-300
                           hover:bg-gray-50 dark:hover:bg-gray-800/60
                           hover:text-github-blue dark:hover:text-white transition-colors"
                onClick={() => {
                  signInWithGitHub();
                  setIsMenuOpen(false);
                }}
              >
                Login with GitHub
              </button>
            )}
          </div>
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
