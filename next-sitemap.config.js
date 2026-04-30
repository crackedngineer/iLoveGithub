import fs from "fs";
import path from "path";

/** Read the blog index built by the prebuild script */
function getBlogPosts() {
  try {
    const indexPath = path.join(process.cwd(), "public/blog.index.json");
    const raw = JSON.parse(fs.readFileSync(indexPath, "utf8"));
    return Array.isArray(raw) ? raw.filter(Boolean) : [];
  } catch {
    return [];
  }
}

/** @type {import('next-sitemap').IConfig} */
export default {
  siteUrl: "https://ilovegithub.vercel.app",
  generateRobotsTxt: false, // managed manually in public/robots.txt
  generateIndexSitemap: false,
  sitemapSize: 5000,

  /* Routes to omit entirely */
  exclude: ["/auth", "/auth/*", "/api", "/api/*"],

  /* Dynamically add every blog post using the prebuild index */
  additionalPaths: async (config) => {
    const posts = getBlogPosts();
    return posts.map((post) => ({
      loc: `${config.siteUrl}/blog/${post.slug}`,
      lastmod: post.created ? new Date(post.created).toISOString() : new Date().toISOString(),
      changefreq: "never",
      priority: 0.7,
    }));
  },

  /* Per-URL priority and changefreq overrides */
  transform: async (config, loc) => {
    const overrides = {
      "/": {priority: 1.0, changefreq: "daily"},
      "/blog": {priority: 0.9, changefreq: "daily"},
      "/changelog": {priority: 0.6, changefreq: "weekly"},
    };
    const override = overrides[loc];
    return {
      loc,
      lastmod: new Date().toISOString(),
      changefreq: override?.changefreq ?? "weekly",
      priority: override?.priority ?? 0.7,
    };
  },
};
