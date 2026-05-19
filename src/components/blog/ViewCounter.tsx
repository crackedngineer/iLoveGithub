"use client";

import {useEffect, useRef, useState} from "react";
import {Eye} from "lucide-react";

function formatViews(views: number) {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1).replace(".0", "")}k`;
  return views.toLocaleString();
}

const ViewCounter = ({slug}: {slug: string}) => {
  const [views, setViews] = useState(0);
  const tracked = useRef(false);

  useEffect(() => {
    if (!slug || tracked.current) return;
    tracked.current = true;

    fetch("/api/blog/views", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({slug}),
    })
      .then((res) => res.json())
      .then((data) => setViews(Number(data.views) || 0))
      .catch(() => setViews(0));
  }, [slug]);

  return (
    <span className="flex items-center gap-1.5">
      <Eye size={12} />
      {formatViews(views)} views
    </span>
  );
};

export default ViewCounter;
