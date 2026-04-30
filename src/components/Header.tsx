"use client";

import React, {useState, useEffect, useRef} from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  Sun,
  Moon,
  User,
  Coffee,
  QrCode,
  BookOpen,
  FileClock,
  Github,
  Mail,
  Send,
} from "lucide-react";
import {appVersion} from "@/lib/version";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import DonationModal from "./DonationModal";
import {
  BUY_ME_COFFEE_URL,
  SUBSTACK_NEWSLETTER_URL,
  GITHUB_REPO_URL,
  GITHUB_SUBMIT_TOOL_URL,
} from "@/constants";
import {useAppLocation} from "./AppLocationProvider";
import {useAuth} from "./AuthProvider";
import type {Session} from "@supabase/supabase-js";
import {usePathname} from "next/navigation";
import {useTheme} from "next-themes";
import {cn} from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   NAV LINKS — defined once, reused in both desktop and sidebar
───────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  {label: "Blog", href: "/blog", icon: BookOpen, internal: true},
  {label: "Changelog", href: "/changelog", icon: FileClock, internal: true},
  {label: "Submit a Tool", href: GITHUB_SUBMIT_TOOL_URL, icon: Send, internal: false},
  {label: "Newsletter", href: SUBSTACK_NEWSLETTER_URL, icon: Mail, internal: false},
  {label: "Repository", href: GITHUB_REPO_URL, icon: Github, internal: false},
] as const;

/* ─────────────────────────────────────────────────────────────
   NavLink — clean text link, active state via colour only
───────────────────────────────────────────────────────────── */
function NavLink({
  href,
  onClick,
  active,
  children,
}: {
  href?: string;
  onClick?: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  const base = cn(
    "text-sm font-medium transition-colors duration-150 whitespace-nowrap px-1 py-0.5",
    active
      ? "text-github-blue dark:text-blue-400"
      : "text-gray-500 dark:text-gray-400 hover:text-foreground dark:hover:text-white",
  );

  if (href)
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    );
  return (
    <button onClick={onClick} className={base}>
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   ThemeToggle — sliding pill with icon
───────────────────────────────────────────────────────────── */
function ThemeToggle({isDark, onToggle}: {isDark: boolean; onToggle: () => void}) {
  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
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

/* ─────────────────────────────────────────────────────────────
   MenuButton — accessible hamburger / close toggle
───────────────────────────────────────────────────────────── */
function MenuButton({open, onClick}: {open: boolean; onClick: () => void}) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      aria-controls="mobile-sidebar"
      className="lg:hidden p-2 -mr-1 rounded-xl text-gray-600 dark:text-gray-300
                 bg-background/70 border border-border/70 shadow-sm
                 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
    >
      {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   DonateButton — donate dropdown (Buy Me a Coffee / QR)
───────────────────────────────────────────────────────────── */
function DonateButton({isInIndia, onQrOpen}: {isInIndia: boolean | null; onQrOpen: () => void}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Support the project"
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium
                     bg-github-pink hover:bg-github-dark-pink text-white
                     shadow-sm shadow-github-pink/20 hover:-translate-y-0.5
                     transition-all duration-200 shrink-0 focus:outline-none
                     focus-visible:ring-2 focus-visible:ring-github-pink/50"
        >
          <span className="animate-pulse-subtle text-[13px] leading-none" aria-hidden>
            ♥
          </span>
          Donate
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 p-1.5">
        <DropdownMenuItem
          className="cursor-pointer text-sm gap-2"
          onClick={() => window.open(BUY_ME_COFFEE_URL, "_blank")}
        >
          <Coffee className="h-3.5 w-3.5 shrink-0" />
          Buy me a coffee
        </DropdownMenuItem>
        {isInIndia && (
          <DropdownMenuItem className="cursor-pointer text-sm gap-2" onClick={onQrOpen}>
            <QrCode className="h-3.5 w-3.5 shrink-0" />
            Scan QR code
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ─────────────────────────────────────────────────────────────
   UserDropdown — avatar button + sign-in / sign-out menu
───────────────────────────────────────────────────────────── */
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
          aria-label={isLoggedIn ? "User menu" : "Sign in with GitHub"}
          className="rounded-full ring-2 ring-transparent hover:ring-github-blue/30
                     transition-all duration-200 focus:outline-none shrink-0"
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
              className="w-8 h-8 flex items-center justify-center rounded-full
                            bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
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

/* ─────────────────────────────────────────────────────────────
   Sidebar — slide-in drawer for mobile & tablet (< lg)
   Stays mounted so CSS transitions animate both open and close.
───────────────────────────────────────────────────────────── */
function Sidebar({
  open,
  onClose,
  pathname,
  isDarkMode,
  onToggleTheme,
  session,
  onSignIn,
  onSignOut,
  isInIndia,
  onDonate,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string | null;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  session: Session | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isInIndia: boolean | null;
  onDonate: () => void;
}) {
  const sidebarRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  /* Keep in DOM until exit transition completes */
  useEffect(() => {
    if (open) {
      setMounted(true);
    }
  }, [open]);

  const handleTransitionEnd = () => {
    if (!open) setMounted(false);
  };

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  /* Prevent body scroll when open */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted && !open) return null;

  const close = () => onClose();

  const linkClass =
    "flex items-center gap-3 h-11 px-3 rounded-xl text-sm font-medium " +
    "text-gray-700 dark:text-gray-300 " +
    "hover:bg-gray-50 dark:hover:bg-gray-800/70 " +
    "hover:text-github-blue dark:hover:text-white " +
    "transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-github-blue/40";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      id="mobile-sidebar"
      className={cn(
        "lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ease-in-out",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      )}
      onTransitionEnd={handleTransitionEnd}
    >
      {/* Scrim */}
      <button
        type="button"
        aria-label="Close menu"
        tabIndex={-1}
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px] cursor-default"
        onClick={close}
      />

      {/* Drawer */}
      <aside
        ref={sidebarRef}
        className={cn(
          "absolute right-0 top-0 h-dvh w-[min(88vw,340px)] flex flex-col",
          "bg-white dark:bg-[#0d1117]",
          "border-l border-gray-200 dark:border-gray-800 shadow-2xl overflow-y-auto",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* ── Drawer header ───────────────────────── */}
        <div
          className="flex items-center justify-between px-4 py-4
                        border-b border-gray-100 dark:border-gray-800 shrink-0"
        >
          <Link href="/" onClick={close} className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl
                             bg-github-blue/10 ring-1 ring-github-blue/20"
            >
              <Image alt="iLoveGithub" src="/icons/favicon.png" width={20} height={20} />
            </span>
            <span className="font-display text-sm font-bold text-foreground">
              iLove<span className="text-github-blue">Github</span>
            </span>
          </Link>
          <button
            onClick={close}
            aria-label="Close menu"
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Nav links ───────────────────────────── */}
        <nav aria-label="Mobile navigation" className="flex-1 px-3 py-3 space-y-0.5">
          {NAV_LINKS.map(({label, href, icon: Icon, internal}) => {
            const isActive = internal && (pathname?.startsWith(href) ?? false);
            const cls = cn(
              linkClass,
              isActive && "text-github-blue bg-github-blue/5 dark:bg-github-blue/10",
            );

            return internal ? (
              <Link key={label} href={href} onClick={close} className={cls}>
                <Icon size={16} />
                {label}
              </Link>
            ) : (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
                className={cls}
              >
                <Icon size={16} />
                {label}
              </a>
            );
          })}
        </nav>

        {/* ── Utilities ───────────────────────────── */}
        <div className="px-3 py-3 space-y-0.5 border-t border-gray-100 dark:border-gray-800 shrink-0">
          {/* Theme toggle */}
          <div className="flex items-center justify-between h-11 px-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isDarkMode ? "Dark mode" : "Light mode"}
            </span>
            <ThemeToggle isDark={isDarkMode} onToggle={onToggleTheme} />
          </div>

          {/* Donate */}
          <a
            href={BUY_ME_COFFEE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className={cn(linkClass, "text-github-pink hover:text-github-pink")}
          >
            <span className="animate-pulse-subtle" aria-hidden>
              ♥
            </span>
            Donate
          </a>

          {/* QR (India only) */}
          {isInIndia && (
            <button
              onClick={() => {
                onDonate();
                close();
              }}
              className={linkClass}
            >
              <QrCode size={16} />
              Scan QR Code
            </button>
          )}
        </div>

        {/* ── Auth ────────────────────────────────── */}
        <div className="px-3 pb-4 pt-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
          {session ? (
            <button
              onClick={() => {
                onSignOut();
                close();
              }}
              className="flex items-center w-full h-11 px-3 rounded-xl text-sm font-medium
                         text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Log out
            </button>
          ) : (
            <button
              onClick={() => {
                onSignIn();
                close();
              }}
              className={linkClass + " w-full"}
            >
              <Github size={16} />
              Login with GitHub
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Header — sticky top bar
   Desktop (≥ lg):  Logo | Nav links        | ThemeToggle Donate GitHub UserDropdown
   Mobile/Tablet:   Logo                    | MenuButton → Sidebar
───────────────────────────────────────────────────────────── */
const Header = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);
  const {isInIndia} = useAppLocation();
  const {session, signOut, signInWithGitHub} = useAuth();
  const {theme, setTheme} = useTheme();
  const pathname = usePathname();
  const isDarkMode = theme === "dark";

  const toggleTheme = () => setTheme(isDarkMode ? "light" : "dark");

  return (
    <>
      <header
        className="w-full sticky top-0 z-50
                   bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-xl
                   border-b border-gray-200/60 dark:border-white/5
                   shadow-sm shadow-black/[0.03] dark:shadow-black/20
                   transition-colors duration-300"
      >
        {/* Gradient accent rule */}
        <div
          aria-hidden
          className="absolute bottom-0 left-0 right-0 h-px
                     bg-gradient-to-r from-github-blue/60 via-github-pink/30 to-github-green/60
                     opacity-70"
        />

        <div
          className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12
                        h-[60px] flex items-center gap-6"
        >
          {/* ── Logo ──────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl
                             bg-github-blue/10 ring-1 ring-github-blue/20
                             transition-all duration-300
                             group-hover:bg-github-blue/15 group-hover:ring-github-blue/40"
            >
              <Image
                alt="iLoveGithub"
                src="/icons/favicon.png"
                width={22}
                height={22}
                className="group-hover:rotate-12 transition-transform duration-300"
              />
            </span>
            <span
              className="font-display text-[15px] font-bold tracking-tight
                             text-github-gray dark:text-white"
            >
              iLove<span className="text-github-blue">Github</span>
              <span
                className="ml-1.5 text-[10px] font-mono font-normal
                               text-gray-400 dark:text-gray-600 tracking-wider"
              >
                v{appVersion}
              </span>
            </span>
          </Link>

          {/* ── Desktop nav ───────────────────────── */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-5 ml-2">
            <span aria-hidden className="w-px h-5 bg-gray-200 dark:bg-gray-700 shrink-0" />
            {NAV_LINKS.map(({label, href, internal}) => {
              if (!internal) return null;
              return (
                <NavLink key={label} href={href} active={pathname?.startsWith(href)}>
                  {label}
                </NavLink>
              );
            })}
          </nav>

          {/* ── Spacer ────────────────────────────── */}
          <div className="flex-1" aria-hidden />

          {/* ── Desktop actions ───────────────────── */}
          <div className="hidden lg:flex items-center gap-3" role="toolbar" aria-label="Actions">
            <ThemeToggle isDark={isDarkMode} onToggle={toggleTheme} />

            <DonateButton isInIndia={isInIndia} onQrOpen={() => setDonationOpen(true)} />

            {/* GitHub repo — icon-only, replaces the GitHubStarsButton */}
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View on GitHub"
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400
                         hover:text-foreground dark:hover:text-white
                         hover:bg-gray-100 dark:hover:bg-gray-800
                         transition-all duration-150 shrink-0"
            >
              <Github className="w-[18px] h-[18px]" />
            </a>

            <UserDropdown
              session={session!}
              signOut={signOut}
              signInWithGitHub={signInWithGitHub}
            />
          </div>

          {/* ── Mobile/tablet menu button ──────────── */}
          <MenuButton open={sidebarOpen} onClick={() => setSidebarOpen((p) => !p)} />
        </div>
      </header>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pathname={pathname}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        session={session}
        onSignIn={signInWithGitHub}
        onSignOut={signOut}
        isInIndia={isInIndia}
        onDonate={() => setDonationOpen(true)}
      />

      <DonationModal
        isOpen={donationOpen}
        onClose={() => setDonationOpen(false)}
        isIndiaLocation={isInIndia}
      />
    </>
  );
};

export default Header;
