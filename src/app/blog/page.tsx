import {getAllFilesFrontMatter} from "@/lib/mdx";
import SearchableBlogList from "@/components/blog/SearchableBlogList";

type FrontMatter = {
  title: string;
  created: string;
  description: string;
  slug: string;
  tags?: string[];
};

export default async function Blog() {
  const posts = await getAllFilesFrontMatter("blog");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
      <SearchableBlogList posts={posts} />
    </div>
  );
}
