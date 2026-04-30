import type {Metadata} from "next";

const SITE_URL = "https://ilovegithub.vercel.app";

export const metadata: Metadata = {
  title: "Engineering Blog | iLoveGithub",
  description:
    "Insights, tutorials, and best practices for modern development. Explore articles on GitHub tools, developer workflows, open-source, and software engineering.",
  keywords: [
    "developer blog",
    "engineering blog",
    "GitHub tutorials",
    "software development",
    "open source",
    "developer tools",
    "programming",
    "web development",
    "GitHub workflows",
  ],
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: "Engineering Blog | iLoveGithub",
    description:
      "Insights, tutorials, and best practices for modern development — GitHub tools, open-source, and software engineering.",
    url: `${SITE_URL}/blog`,
    siteName: "iLoveGithub",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "iLoveGithub Engineering Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Engineering Blog | iLoveGithub",
    description:
      "Insights, tutorials, and best practices for modern development — GitHub tools, open-source, and software engineering.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function BlogLayout({children}: {children: React.ReactNode}) {
  return <>{children}</>;
}
