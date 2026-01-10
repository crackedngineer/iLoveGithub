import fs from "fs";
import path from "path";
import matter from "gray-matter";
import MiniSearch from "minisearch";


const POSTS_DIR = path.join(process.cwd(), "blog/posts");
const OUT_INDEX_FILE = path.join(process.cwd(), "public/blog.index.json");
const OUT_SEARCH_FILE = path.join(process.cwd(), "public/blog.search.json");
const OUT_RELATED_FILE = path.join(process.cwd(), "public/blog.related.json");

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
    readTimeMinutes: data?.readTimeMinutes,
    coverImage: data?.coverImage,
    author: data?.author,
    series: data?.series,

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

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "this", "that", "from", "you",
  "your", "are", "was", "were", "has", "have"
]);

function vectorize(text) {
  const freq = {};

  text
    .toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
    .forEach(w => {
      freq[w] = (freq[w] || 0) + 1;
    });

  return freq;
}

function cosine(a, b) {
  let dot = 0, magA = 0, magB = 0;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);

  for (const k of keys) {
    const x = a[k] || 0;
    const y = b[k] || 0;
    dot += x * y;
    magA += x * x;
    magB += y * y;
  }

  return dot && magA && magB
    ? dot / (Math.sqrt(magA) * Math.sqrt(magB))
    : 0;
}

const vectors = posts.map(p => ({
  slug: p.slug,
  vector: vectorize(
    `${p.title} ${p.description ?? ""} ${p.tags?.join(" ") ?? ""}`
  ),
}));

const related = {};

for (const a of vectors) {
  related[a.slug] = vectors
    .filter(b => b.slug !== a.slug)
    .map(b => ({
      slug: b.slug,
      score: cosine(a.vector, b.vector),
    }))
    .filter(r => r.score > 0.15)
    .sort((x, y) => y.score - x.score)
    .slice(0, 5)
    .map(r => r.slug);
}

fs.writeFileSync(OUT_RELATED_FILE, JSON.stringify(related));
console.log("✅ Related posts built");