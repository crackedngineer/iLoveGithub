"use client";

import {useEffect, useRef} from "react";
import {useTheme} from "next-themes";
import {GITHUB_REPO_URL} from "@/constants";

const GiscusComments = ({slug}: {slug: string}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {resolvedTheme} = useTheme();

  const repo = GITHUB_REPO_URL.replace("https://github.com/", "");
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY || "Announcements";
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !repo || !repoId || !categoryId) return;

    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", repo);
    script.setAttribute("data-repo-id", repoId);
    script.setAttribute("data-category", category);
    script.setAttribute("data-category-id", categoryId);
    script.setAttribute("data-mapping", "specific");
    script.setAttribute("data-term", `blog-${slug}`);
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", resolvedTheme === "dark" ? "dark" : "light");
    script.setAttribute("data-lang", "en");

    container.appendChild(script);
  }, [category, categoryId, repo, repoId, resolvedTheme, slug]);

  if (!repo || !repoId || !categoryId) {
    return (
      <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
        Comments are ready for Giscus. Add `NEXT_PUBLIC_GISCUS_REPO`, `NEXT_PUBLIC_GISCUS_REPO_ID`,
        and `NEXT_PUBLIC_GISCUS_CATEGORY_ID` to enable them.
      </div>
    );
  }

  return <div ref={containerRef} className="giscus min-h-32" />;
};

export default GiscusComments;
