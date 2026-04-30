"use client";

import {useEffect, useState} from "react";

const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    };
    window.addEventListener("scroll", update, {passive: true});
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] bg-border/20 z-[60]">
      <div
        className="h-full bg-gradient-to-r from-github-blue to-github-green transition-[width] duration-150 ease-out"
        style={{width: `${progress}%`}}
      />
    </div>
  );
};

export default ReadingProgress;
