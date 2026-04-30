import Link from "next/link";
import {ArrowUpRight, Clock} from "lucide-react";
import type {BlogPostFrontMatter} from "@/lib/types";

const BlogListItem = ({post}: {post: BlogPostFrontMatter}) => {
  const date = new Date(post.created).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <article className="group py-7 last:pb-0">
      <Link href={`/blog/${post.slug}`} className="block">
        {/* Meta row */}
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-mono mb-2.5">
          <time dateTime={post.created}>{date}</time>
          {post.readTimeMinutes && (
            <>
              <span className="text-border">·</span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {post.readTimeMinutes} min read
              </span>
            </>
          )}
        </div>

        {/* Title row */}
        <div className="flex items-start justify-between gap-4">
          <h2
            className="text-lg sm:text-xl font-bold text-foreground leading-snug
                         group-hover:text-github-blue transition-colors duration-150 flex-1"
          >
            {post.title}
          </h2>
          <ArrowUpRight
            size={18}
            className="shrink-0 mt-0.5 text-muted-foreground/40
                       group-hover:text-github-blue group-hover:translate-x-0.5 group-hover:-translate-y-0.5
                       transition-all duration-150"
          />
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        )}
      </Link>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {post.tags.map((tag) => (
            <a
              key={tag}
              href={`/blog?category=${encodeURIComponent(tag)}`}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full
                         text-[11px] font-medium font-mono
                         bg-secondary text-muted-foreground
                         hover:bg-github-blue/10 hover:text-github-blue
                         transition-colors duration-150"
            >
              #{tag}
            </a>
          ))}
        </div>
      )}
    </article>
  );
};

export default BlogListItem;
