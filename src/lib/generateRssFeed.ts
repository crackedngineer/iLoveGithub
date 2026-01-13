import {getAllFilesFrontMatter} from "./mdx";
import type {FrontMatter} from "@/lib/types";

export function generateRssFeed(): string {
  const posts = getAllFilesFrontMatter("blog");
  const siteUrl = window.location.origin;
  const feedUrl = `${siteUrl}/rss.xml`;

  const rssItems = posts
    .map((post: FrontMatter) => {
      const postUrl = `${siteUrl}/blog/${post.slug}`;
      const pubDate = new Date(post.date ?? "").toUTCString();
      const categories = (post.tags ?? [])
        .map((tag) => `<category>${escapeXml(tag)}</category>`)
        .join("\n        ");

      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeXml(post.excerpt ?? "")}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(post.author ?? "")}</author>
      ${categories}
    </item>`;
    })
    .join("\n");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Developer Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Insights, tutorials, and best practices for modern web development</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

  return rssFeed;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function downloadRssFeed(): void {
  const rssFeed = generateRssFeed();
  const blob = new Blob([rssFeed], {type: "application/rss+xml"});
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "rss.xml";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyRssFeedUrl(): void {
  const feedUrl = `${window.location.origin}/blog?format=rss`;
  navigator.clipboard.writeText(feedUrl);
}
