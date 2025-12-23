import fs from "fs";
import path from "path";
import matter from "gray-matter";
import MiniSearch from "minisearch";


const POSTS_DIR = path.join(process.cwd(), "blog/posts");
const OUT_INDEX_FILE = path.join(process.cwd(), "public/blog.index.json");
const OUT_SEARCH_FILE = path.join(process.cwd(), "public/blog.search.json");

const files = fs.readdirSync(POSTS_DIR);

const posts = files.map((file) => {
  const slug = file.replace(/\.mdx?$/, "");
  const source = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
  const { data, content } = matter(source);

  if (data.draft === true) {
    return null; // Skip draft posts
  }

  return {
    slug,
    title: data.title,
    description: data.description || "",
    created: data.created,
    tags: data.tags.split(",").map((tag) => tag.trim()) || [],
    category: data.category,
    body: content,
    excerpt: data.excerpt || "",
    readTimeMinutes: data.readTimeMinutes || null,
    coverImage: data.coverImage || null,
    author: data.author || null,
    series: data.series || null,

  };
});

fs.writeFileSync(OUT_INDEX_FILE, JSON.stringify(posts, null, 2));
console.log("✅ blog.index.json generated");

const search = new MiniSearch({
  fields: ["title", "description", "tags", "category"],
  storeFields: ["slug", "title"],
  searchOptions: {
    boost: {
      title: 5,
      tags: 3,
      description: 2,
      body: 1,
    },
    fuzzy: 0.2,
    prefix: true,
  },
});


search.addAll(posts.map((p) => ({
  id: p.slug,
  title: p.title,
  description: p.description,
  tags: p.tags,
  body: p.body,
})));

fs.writeFileSync(
  OUT_SEARCH_FILE,
  JSON.stringify(search.toJSON())
);
console.log("✅ blog.search.json generated");