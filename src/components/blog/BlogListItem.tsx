import Link from "next/link";
import {Badge} from "@/components/ui/badge";
import {Clock} from "lucide-react";
import type {BlogPostFrontMatter} from "@/lib/types";

const BlogListItem = ({post}: {post: BlogPostFrontMatter}) => {
  const formattedDate = new Date(post.created).toISOString().split("T")[0];

  return (
    <article className="group py-8 border-b border-border/50 last:border-b-0 transition-colors hover:bg-muted/20 -mx-4 px-4 rounded-lg">
      <div className="flex items-center gap-3 text-sm text-muted-foreground font-mono">
        <time>{formattedDate}</time>
        <span className="text-border">•</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {post.readTimeMinutes ? `${post.readTimeMinutes} min read` : "Quick read"}
        </span>
      </div>

      <h2 className="mt-2 text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>

      {post.excerpt && <p className="mt-2 text-muted-foreground leading-relaxed">{post.excerpt}</p>}

      <div className="flex flex-wrap gap-2 mt-4">
        {post.tags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="bg-transparent border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors duration-200"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </article>
  );
};

export default BlogListItem;
