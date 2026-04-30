"use client";

import {useEffect, useState} from "react";
import {cn} from "@/lib/utils";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

const TableOfContents = ({content, className}: TableOfContentsProps) => {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const matches: TOCItem[] = [];
    let m;
    const re = /^(#{1,6})\s+(.+)$/gm;
    while ((m = re.exec(content)) !== null) {
      const text = m[2].trim();
      matches.push({
        level: m[1].length,
        text,
        id: text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      });
    }
    setHeadings(matches);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id);
        }),
      {rootMargin: "-80px 0% -80% 0%", threshold: 0.1},
    );
    headings.forEach(({id}) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 100,
        behavior: "smooth",
      });
    }
  };

  if (!headings.length) return null;

  return (
    <nav className={cn("sticky top-24", className)}>
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Contents
        </p>
        <ul className="space-y-0.5 max-h-[65vh] overflow-y-auto">
          {headings.map((h) => (
            <li key={h.id} style={{paddingLeft: `${(h.level - 1) * 10}px`}}>
              <button
                onClick={() => scrollTo(h.id)}
                className={cn(
                  "w-full text-left text-xs py-1 px-2 rounded-md transition-all duration-150",
                  activeId === h.id
                    ? "text-github-blue font-semibold bg-github-blue/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {h.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default TableOfContents;
