import {Rss, Copy, Download, Check} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {useState} from "react";
import {generateRssFeed} from "@/lib/generateRssFeed";
import {toast} from "sonner";

const RssFeedButton = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    const feedUrl = `${window.location.origin}/blog`;
    await navigator.clipboard.writeText(feedUrl);
    setCopied(true);
    toast("RSS URL copied!", {
      description: "Add this URL to your RSS reader.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    const rssFeed = await generateRssFeed();
    const blob = new Blob([rssFeed], {type: "application/rss+xml"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "feed.xml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast("RSS feed downloaded!", {
      description: "Import the XML file into your RSS reader.",
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-github-orange/30 text-github-orange hover:bg-github-orange/10 hover:border-github-orange"
        >
          <Rss className="h-4 w-4" />
          Subscribe
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-2">
          <p className="text-sm font-medium text-github-gray dark:text-white">
            Subscribe to RSS Feed
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Stay updated with new blog posts
          </p>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={handleCopyUrl}>
              {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              Copy URL
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={handleDownload}>
              <Download className="h-3 w-3" />
              Download
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default RssFeedButton;
