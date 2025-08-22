import type {Metadata} from "next";
import Script from "next/script";
import {Analytics} from "@vercel/analytics/react";
import {SpeedInsights} from "@vercel/speed-insights/next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import AdBanner from "@/components/AdBanner";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import {ApiLimitProvider} from "@/components/ApiLimitContext";
import AuthGuard from "@/components/AuthGuard";
import DemoVideoProvider from "@/components/DemoVideoProvider";
import AppVersionSync from "@/components/AppVersionSync";
import {AppLocationProvider} from "@/components/AppLocationProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "iLoveGithub - GitHub Tools & Repo Transformers",
  description:
    "Discover magical GitHub tools to explore, transform, and remix repositories. Open repos in VS Code, generate AI summaries, replace GitHub URLs, and more — all in one place!",
  keywords: [
    "GitHub tools",
    "GitHub utilities",
    "GitHub extensions",
    "replace GitHub URL",
    "transform GitHub repo",
    "iLoveGitHub",
    "I love GitHub",
    "GitHub explorer",
    "GitHub repo visualizer",
    "open GitHub repo in VS Code",
    "GitHub repo to podcast",
    "summarize GitHub repository",
  ],
  icons: {
    icon: "/icons/favicon.png",
  },
  openGraph: {
    title: "iLoveGithub - GitHub Tools & Repo Transformers",
    description:
      "A curated collection of magical tools built around GitHub — open a repo in VS Code, visualize it, generate AI-powered summaries, convert it to a podcast, and so much more.",
    url: "https://ilovegithub.oderna.in",
    siteName: "iLoveGithub",
    images: [
      {
        url: "https://ilovegithub.oderna.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "iLoveGithub - GitHub Tools Screenshot",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "iLoveGithub - GitHub Tools & Repo Transformers",
    description:
      "Explore magical GitHub tools to open repos in VS Code, summarize repositories with AI, and transform GitHub URLs easily!",
    images: ["https://ilovegithub.oderna.in/og-image.jpg"],
  },
  metadataBase: new URL("https://ilovegithub.oderna.in"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://ilovegithub.oderna.in" />
        {/* Theme script for preventing flicker */}
        <Script
          dangerouslySetInnerHTML={{
            __html: `(function() {
          try {
            const savedTheme = localStorage.getItem("theme");
            const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

            let theme = "light";
            if (savedTheme === "dark" || savedTheme === "light") {
              theme = savedTheme;
            } else if (systemPrefersDark) {
              theme = "dark";
            }

            if (theme === "dark") {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          } catch (_) {}
        })();`,
          }}
        />
        {/* Google AdSense script */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9989179882825871`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        <Analytics />
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        <SpeedInsights />
        <AppVersionSync />

        <DemoVideoProvider>
          <AppLocationProvider>
            <AuthProvider>
              <ApiLimitProvider>
                <AuthGuard>{children}</AuthGuard>
              </ApiLimitProvider>
            </AuthProvider>
          </AppLocationProvider>
        </DemoVideoProvider>

        {/* Add the AdBanner component at the end of body to ensure it's at the bottom */}
        {/* <AdBanner adSlot="8130644563" /> */}
      </body>
    </html>
  );
}
