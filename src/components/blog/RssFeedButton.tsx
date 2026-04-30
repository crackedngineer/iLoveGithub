"use client";

import {Rss, Copy, Download, Check} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {useState} from "react";
import {generateRssFeed} from "@/lib/generateRssFeed";
import {toast} from "sonner";

const RssFeedButton = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/blog`);
    setCopied(true);
    toast("RSS URL copied!", {description: "Add this URL to your RSS reader."});
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    const rssFeed = await generateRssFeed();
    const blob = new Blob([rssFeed], {type: "application/rss+xml"});
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {href: url, download: "feed.xml"});
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("RSS feed downloaded!", {description: "Import the XML file into your RSS reader."});
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-9 text-xs">
          <Rss size={14} className="text-amber-500" />
          Subscribe
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-4" align="center">
        <p className="text-sm font-semibold mb-0.5">Subscribe to RSS</p>
        <p className="text-xs text-muted-foreground mb-3">Stay updated with new posts</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 text-xs h-8"
            onClick={handleCopyUrl}
          >
            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
            Copy URL
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 text-xs h-8"
            onClick={handleDownload}
          >
            <Download size={12} />
            Download
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default RssFeedButton;
