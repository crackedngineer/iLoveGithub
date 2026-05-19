import Link from "next/link";
import {Badge} from "@/components/ui/badge";
import {Star, ArrowRight} from "lucide-react";
import type {BlogPostDetail} from "@/lib/types";

interface FeaturedPostProps {
  post: BlogPostDetail;
  index: number;
}

const FeaturedPost = ({post, index}: FeaturedPostProps) => {
  const formattedDate = new Date(post.created).toISOString().split("T")[0];

  return (
    <article
      className="group relative p-6 rounded-lg border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300 animate-fade-in"
      style={{animationDelay: `${index * 100}ms`}}
    >
      <div className="flex items-center gap-2 mb-3">
        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        <span className="text-xs font-medium text-yellow-500 uppercase tracking-wide">
          Featured
        </span>
      </div>

      <time className="text-sm text-muted-foreground font-mono">{formattedDate}</time>

      <h3 className="mt-2 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
          {post.title}
        </Link>
      </h3>

      {post.excerpt && (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mt-3">
        {post.tags.slice(0, 3).map((tag: string) => (
          <Badge
            key={tag}
            variant="outline"
            className="text-xs bg-transparent border-border/50 text-muted-foreground"
          >
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        Read article <ArrowRight className="h-3 w-3" />
      </div>
    </article>
  );
};

export default FeaturedPost;
