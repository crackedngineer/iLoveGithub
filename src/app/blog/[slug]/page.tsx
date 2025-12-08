import {getAllFilesFrontMatter, getFileBySlug, getFiles} from "@/lib/mdx";
import "highlight.js/styles/github-dark.css";
// import { Space_Mono } from 'next/font/google'
// import MarkdownRenderer from '@/components/MarkdownRenderer'
import {notFound} from "next/navigation";
import BackButton from "@/components/blog/BackButton";
import TableOfContents from "@/components/blog/TableOfContents";
import RecommendedPosts from "@/components/blog/RecommendedPosts";
// import GiscusComments from '@/components/Comments/GiscusComments'
import "@/components/Comments/comments.css";

export async function generateStaticParams() {
  const posts = await getFiles("blog");
  return posts.map((post: string) => ({
    slug: post.replace(/\.mdx/, ""),
  }));
}

export default async function BlogPost({params}: {params: {slug: string}}) {
  const post = await getFileBySlug("blog", params.slug);
  const allPosts = await getAllFilesFrontMatter("blog");

  const relatedPosts = allPosts
    .filter((p: {slug: string}) => p.slug !== params.slug)
    .filter((p) => {
      if (post?.frontMatter.tags && p.tags) {
        return post.frontMatter.tags.some((tag) => p.tags?.includes(tag));
      }
      return false;
    })
    .slice(0, 3);

  if (relatedPosts.length < 3) {
    const recentPosts = allPosts
      .filter((p: {slug: string}) => p.slug !== params.slug)
      .filter((p: {slug: any}) => !relatedPosts.some((rp: {slug: any}) => rp.slug === p.slug))
      .slice(0, 3 - relatedPosts.length);

    relatedPosts.push(...recentPosts);
  }
  if (!post) {
    notFound();
  }
  return (
    <div className="w-full flex justify-center">
      <div className=" max-w-8xl flex top-0  flex-col md:flex-row px-4 gap-6 md:gap-8 py-8 relative">
        <div className="md:order-1 hidden md:block">
          <aside className="sticky top-[20dvh]">
            <div className="border border-white/10 rounded-xl  p-4 shadow-xl bg-gray-900/40 backdrop-blur-sm">
              <TableOfContents content={post.contentHtml} />
            </div>
          </aside>
        </div>
        {/* Main Content */}
        <article className="w-[90dvw] md:w-3/5 order-1 md:order-2 px-0 md:px-4 py-0 md:py-8  ">
          <BackButton className="mb-6" />
          <header className="mb-8 md:mb-12">
            <h1 className="font-mono text-2xl md:text-4xl font-bold mb-4 leading-tight break-words">
              {post.frontMatter.title}
            </h1>
            <time className="text-sm text-gray-400 block">{post.frontMatter.created}</time>
          </header>

          <div className="flex flex-wrap gap-2 mb-4">
            {post.frontMatter.tags?.map((tag) => (
              <span
                key={tag}
                className="text-sm text-gray-400 border border-gray-400 bg-gray-900 rounded-full p-2"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className=" overflow-hidden">
            {/* <MarkdownRenderer
							className='border border-white/10 rounded-xl p-5 md:p-6 shadow-xl text-sm md:text-base'
							content={post.contentHtml}
						/> */}
          </div>

          {/* Comments Section */}
          {/* <GiscusComments slug={params.slug} title={post.frontMatter.title} /> */}
        </article>

        <div className="md:w-1/5 md:order-3 md:right-8 ">
          <aside className=" hidden md:block sticky top-[20dvh]">
            {" "}
            <div className="border  border-white/10 rounded-xl p-4 shadow-xl bg-gray-900/40 backdrop-blur-sm">
              <RecommendedPosts posts={relatedPosts} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
