"use client";

import React, {useEffect, useState} from "react";
import {motion} from "framer-motion";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({content}) => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const extractHeadings = () => {
      const regex = /^(#{1,3})\s+(.+)$/gm;
      const matches = Array.from(content.matchAll(regex));

      const foundHeadings = matches.map((match) => {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "");
        return {id, text, level};
      });

      setHeadings(foundHeadings);
    };

    extractHeadings();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const text = entry.target.textContent?.trim() || "";
            const normalizedId = text
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^\w-]/g, "");
            console.log(normalizedId, "normalizedId");
            setActiveId(normalizedId);
          }
        });
      },
      {rootMargin: "-40px 0px -40px 0px"},
    );

    setTimeout(() => {
      document.querySelectorAll("h1, h2, h3").forEach((heading) => {
        observer.observe(heading);
      });
    }, 100);

    return () => {
      document.querySelectorAll("h1, h2, h3").forEach((heading) => {
        observer.unobserve(heading);
      });
    };
  }, [content]);

  if (headings.length === 0) {
    return null;
  }

  const handleClick = (id: string, text: string) => {
    const headings = Array.from(document.querySelectorAll("h1, h2, h3"));
    const element = headings.find((heading) => heading.textContent?.trim() === text) as HTMLElement;
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: "smooth",
      });
    }
  };

  return (
    <div>
      <h2 className="text-lg font-mono font-semibold mb-4">Table of Contents</h2>
      <nav>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li
              key={heading.id}
              style={{
                paddingLeft: `${(heading.level - 1) * 0.75}rem`,
              }}
            >
              <motion.button
                className={`text-left text-sm line-clamp-2 hover:text-white transition-colors w-full ${
                  activeId === heading.id ? "text-cyan-400" : "text-gray-400"
                }`}
                onClick={() => handleClick(heading.id, heading.text)}
                whileHover={{x: 4}}
                transition={{type: "spring", stiffness: 400, damping: 10}}
              >
                {heading.text}
              </motion.button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default TableOfContents;
