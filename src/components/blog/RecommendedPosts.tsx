"use client";

import React from "react";
import Link from "next/link";
import {motion} from "framer-motion";
import {FrontMatter} from "@/lib/mdx";

interface RecommendedPostsProps {
  posts: FrontMatter[];
}

const RecommendedPosts: React.FC<RecommendedPostsProps> = ({posts}) => {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg font-mono font-semibold mb-4">Recommended</h2>
      <div className="space-y-4">
        {posts.map((post) => (
          <motion.div key={post.slug} whileHover={{scale: 1.02}} className="group">
            <Link href={`/blog/${post.slug}`} className="block">
              <article className="border border-white/5 rounded-lg p-3 hover:bg-gray-800/20 transition-colors">
                <h3 className="font-medium text-sm mb-1 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                  {post.title}
                </h3>
                <time className="text-xs text-gray-400 block mb-1">{post.created}</time>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-gray-400 bg-gray-800/50 px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 2 && (
                      <span className="text-xs text-gray-400">+{post.tags.length - 2}</span>
                    )}
                  </div>
                )}
              </article>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedPosts;
