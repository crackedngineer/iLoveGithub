import {promises as fs} from "fs";
import path from "path";
import matter from "gray-matter";
import type {FrontMatter} from "@/lib/types";

const root = process.cwd();

export async function getFiles(mdxpath: string) {
  const files = await fs.readdir(path.join(root, mdxpath));
  return files.filter((file) => file.endsWith(".mdx") || file.endsWith(".md"));
}

export async function getFileBySlug(mdxpath: string, slug: string) {
  try {
    // Determine file extension and read content
    const exts = [".mdx", ".md"];
    let resFilePath = "";
    for (const ext of exts) {
      const filePath = path.join(root, mdxpath, `${slug}${ext}`);
      try {
        await fs.access(filePath);
        resFilePath = filePath;
        break;
      } catch {}
    }
    if (!resFilePath) {
      throw new Error(`File ${slug}.mdx or ${slug}.md not found in ${mdxpath}`);
    }
    const source = await fs.readFile(resFilePath, "utf8");
    const {data, content} = matter(source);
    data.tags = data.tags?.toString().trim().split(",") || [];
    return {
      contentHtml: content,
      frontMatter: {
        slug: slug || null,
        ...data,
      } as FrontMatter,
    };
  } catch (error) {
    console.error(`Error processing ${slug}.mdx:`, error);
    return {
      contentHtml: "<p>Error loading content.</p>",
      frontMatter: {
        slug: slug || null,
        title: "Error",
        created: "",
        description: "There was an error loading this content.",
        project: "",
      } as FrontMatter,
    };
  }
}

export async function getAllFilesFrontMatter(mdxpath: string): Promise<FrontMatter[]> {
  try {
    const files = await getFiles(mdxpath);

    const posts = await Promise.all(
      files.map(async (file: string) => {
        const source = await fs.readFile(path.join(root, mdxpath, file), "utf8");
        const {data} = matter(source);
        if (data.created instanceof Date) {
          data.created = data.created.toISOString().split("T")[0];
        }
        data.tags = data.tags.toString().trim().split(",") || [];
        return {
          ...(data as FrontMatter),
          slug: file.replace(/\.(mdx|md)$/, ""),
        };
      }),
    );

    const filteredAndSortedPosts = posts
      .filter((post): post is FrontMatter => Boolean(post?.created ?? ""))
      .sort((a, b) => {
        const dateA = new Date(a.created).getTime();
        const dateB = new Date(b.created).getTime();
        return dateB - dateA;
      });

    return filteredAndSortedPosts;
  } catch (error) {
    console.error("Error getting all files front matter:", error);
    return [];
  }
}

export async function pullReadyMarkdownFiles(vaultPath: string): Promise<string[]> {
  const readyFiles: string[] = [];
  const files = await fs.readdir(vaultPath);

  for (const file of files) {
    if (file.endsWith(".md")) {
      const filePath = path.join(vaultPath, file);
      const content = await fs.readFile(filePath, "utf-8");
      if (content.includes("status: ready")) {
        readyFiles.push(filePath);
      }
    }
  }

  return readyFiles;
}
