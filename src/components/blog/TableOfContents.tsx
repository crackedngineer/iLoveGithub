import {useEffect, useState} from "react";
import {cn} from "@/lib/utils";
import {List} from "lucide-react";

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
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Parse headings from markdown content
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const matches: TOCItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      matches.push({id, text, level});
    }

    setHeadings(matches);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {rootMargin: "-80px 0% -80% 0%", threshold: 0.1},
    );

    headings.forEach(({id}) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({top: y, behavior: "smooth"});
    }
  };

  if (headings.length === 0) return null;

  return (
    <nav className={cn("sticky top-24", className)}>
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          <List className="h-5 w-5 text-github-blue" />
          <h3 className="font-semibold text-github-gray dark:text-white">Table of Contents</h3>
        </div>
        <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
          {headings.map((heading) => (
            <li key={heading.id} style={{paddingLeft: `${(heading.level - 1) * 12}px`}}>
              <button
                onClick={() => handleClick(heading.id)}
                className={cn(
                  "text-left text-sm w-full py-1.5 px-2 rounded-md transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800",
                  activeId === heading.id
                    ? "text-github-blue font-medium bg-github-blue/10 dark:bg-github-blue/20"
                    : "text-gray-600 dark:text-gray-400",
                )}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default TableOfContents;
