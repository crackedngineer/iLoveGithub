import {useEffect} from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "article" | "website";
  author?: string;
  publishedTime?: string;
  tags?: string[];
}

const SEOHead = ({
  title,
  description,
  image,
  url = window.location.href,
  type = "article",
  author,
  publishedTime,
  tags = [],
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    document.title = `${title} | I Love GitHub`;

    // Helper to set or create meta tag
    const setMeta = (property: string, content: string, isName = false) => {
      const attr = isName ? "name" : "property";
      let meta = document.querySelector(`meta[${attr}="${property}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, property);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Basic meta
    setMeta("description", description, true);

    // Open Graph
    setMeta("og:title", title);
    setMeta("og:description", description);
    setMeta("og:url", url);
    setMeta("og:type", type);
    if (image) setMeta("og:image", image);

    // Twitter Card
    setMeta("twitter:card", "summary_large_image", true);
    setMeta("twitter:title", title, true);
    setMeta("twitter:description", description, true);
    if (image) setMeta("twitter:image", image, true);

    // Article specific
    if (type === "article") {
      if (author) setMeta("article:author", author);
      if (publishedTime) setMeta("article:published_time", publishedTime);
      tags.forEach((tag, i) => setMeta(`article:tag:${i}`, tag));
    }

    // Cleanup on unmount
    return () => {
      document.title = "I Love GitHub";
    };
  }, [title, description, image, url, type, author, publishedTime, tags]);

  return null;
};

export default SEOHead;
