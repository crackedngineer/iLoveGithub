import Link from "next/link";
import Image from "next/image";
import {ArrowUpRight} from "lucide-react";
import {BlogRelatedPost} from "@/lib/types";

const RelatedPosts = ({posts}: {posts: BlogRelatedPost[]}) => {
  if (!posts.length) return null;

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-5">
        Related Articles
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map(({slug, title, excerpt, coverImage, tags}) => (
          <Link
            key={slug}
            href={`/blog/${slug}`}
            className="group flex flex-col rounded-xl border border-border bg-card
                       hover:border-github-blue/40 hover:shadow-md transition-all duration-200
                       hover:-translate-y-0.5 overflow-hidden"
          >
            {coverImage && (
              <div className="h-28 overflow-hidden">
                <Image
                  src={coverImage}
                  alt={title}
                  width={100}
                  height={100}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-4 flex flex-col gap-2 flex-1">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full
                                     bg-secondary text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <h4
                className="text-sm font-semibold text-foreground leading-snug line-clamp-2
                             group-hover:text-github-blue transition-colors"
              >
                {title}
              </h4>
              {excerpt && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {excerpt}
                </p>
              )}
              <div className="mt-auto pt-2 flex items-center gap-1 text-xs text-github-blue font-medium">
                Read
                <ArrowUpRight
                  size={12}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;
