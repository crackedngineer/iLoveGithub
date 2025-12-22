import {useEffect, useState} from "react";
import Link from "next/link";
import {getAllBlogPosts} from "@/services/blog";
import {BlogPostFrontMatter} from "@/lib/types";
import {ArrowRight, Tag} from "lucide-react";
import {Badge} from "@/components/ui/badge";

interface RelatedPostsProps {
  currentSlug: string;
  currentTags: string[];
  maxPosts?: number;
}

const RelatedPosts = ({currentSlug, currentTags, maxPosts = 3}: RelatedPostsProps) => {
  const [relatedPosts, setRelatedPosts] = useState<
    Array<{post: BlogPostFrontMatter; score: number; matchingTags: string[]}>
  >([]);

  useEffect(() => {
    (async () => {
      const allPosts = await getAllBlogPosts(1, 1000);

      // Score posts by matching tags
      const scoredPosts = allPosts.posts
        .filter((post) => post.slug !== currentSlug)
        .map((post) => {
          const matchingTags = post.tags.filter((tag) =>
            currentTags.some((currentTag) => currentTag.toLowerCase() === tag.toLowerCase()),
          );
          return {post, score: matchingTags.length, matchingTags};
        })
        .filter(({score}) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxPosts);

      setRelatedPosts(scoredPosts);
    })();
  }, [currentSlug, currentTags, maxPosts]);

  if (relatedPosts.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-2xl font-bold text-github-gray dark:text-white mb-6 flex items-center gap-2">
        <Tag className="h-6 w-6 text-github-green" />
        Related Articles
      </h3>

      <div className="grid gap-4 md:grid-cols-3">
        {relatedPosts.map(({post, matchingTags}) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block bg-gray-50 dark:bg-gray-800 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-lg"
          >
            {post.coverImage && (
              <div className="relative h-32 rounded-lg overflow-hidden mb-3">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-1 mb-2">
              {matchingTags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs bg-github-green/10 text-github-green dark:bg-github-green/20"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <h4 className="font-semibold text-github-gray dark:text-white group-hover:text-github-blue transition-colors line-clamp-2 mb-2">
              {post.title}
            </h4>

            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
              {post.excerpt}
            </p>

            <span className="inline-flex items-center gap-1 text-sm text-github-blue font-medium">
              Read more
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;
