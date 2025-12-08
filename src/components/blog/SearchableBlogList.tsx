"use client";

import {useState, useEffect} from "react";
import {Search, ChevronLeft, ChevronRight} from "lucide-react";
import Link from "next/link";
import {motion, AnimatePresence} from "framer-motion";
import {FrontMatter} from "@/lib/mdx";
const POSTS_PER_PAGE = 7;

export default function SearchableBlogList({posts}: {posts: FrontMatter[]}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const uniquePosts = Array.from(new Map(posts.map((post) => [post.slug, post])).values());

  const filteredPosts = uniquePosts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      post.project.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE,
  );
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({top: 0, behavior: "smooth"});
  };

  return (
    <>
      <h1 className="sm:m-2 text-2xl font-semibold">Blog</h1>
      <p className="sm:m-2 text-gray-400">Thoughts on development, design, and more.</p>
      <div className="max-w-4xl mx-auto w-screen">
        <motion.div
          initial={{opacity: 0, y: -20}}
          animate={{opacity: 1, y: 0}}
          className="sticky top-0 z-10 py-4 w-full mb-8"
        >
          <div className="max-w-2xl mx-auto px-6">
            <div className="relative">
              <div className="relative p-[1px] rounded-lg overflow-hidden">
                <div className="absolute inset-0">
                  <div className="w-full h-full animate-gradient-xy bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500" />
                </div>

                <div className="relative bg-gray-900/40 backdrop-blur-xl rounded-lg">
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 
                    bg-gray-900/40
                    rounded-lg text-gray-200
                    focus:outline-none
                    placeholder-gray-400/60
                    shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]
                    transition-all duration-300"
                  />
                  <Search
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 
                    ${isFocused ? "text-cyan-400" : "text-gray-400"}
                    transition-colors duration-300`}
                    size={18}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="w-full px-6">
          <AnimatePresence mode="wait">
            {filteredPosts.length === 0 ? (
              <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -20}}
                className="flex flex-col items-center justify-center py-20 text-center w-full"
              >
                <Search className="text-gray-500 mb-4" size={48} />
                <p className="text-gray-400 text-lg mb-2">No posts found</p>
                <p className="text-gray-500 text-sm">Try adjusting your search query</p>
              </motion.div>
            ) : (
              <>
                <motion.div
                  className="divide-y divide-white/10 w-full"
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  exit={{opacity: 0}}
                >
                  {paginatedPosts.map((post, i) => (
                    <motion.article
                      key={post.slug}
                      initial={{opacity: 0, y: 20}}
                      animate={{opacity: 1, y: 0}}
                      exit={{opacity: 0, y: -20}}
                      transition={{duration: 0.2, delay: i * 0.1}}
                      className="py-8 group"
                    >
                      <Link href={`/blog/${post.slug}`} className="block space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <time>{post.created}</time>
                        </div>
                        <h2 className="text-2xl font-semibold group-hover:text-gray-300 transition">
                          {post.title}
                        </h2>
                        <p className="text-gray-400 line-clamp-2">{post.description}</p>
                      </Link>
                      <div className="mt-2">
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag, index) => (
                              <motion.div
                                key={index}
                                whileHover={{y: -2, scale: 1.05}}
                                className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg 
                                bg-gray-700/[10%] text-gray-400
                                border border-gray-600/[10%] transition-colors`}
                              >
                                {tag}
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.article>
                  ))}
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 py-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg transition-colors duration-200 
                      ${
                        currentPage === 1
                          ? "text-gray-500 cursor-not-allowed"
                          : "text-gray-400 hover:text-white hover:bg-gray-800"
                      }`}
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({length: totalPages}, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => handlePageChange(i + 1)}
                          className={`w-8 h-8 rounded-lg transition-colors duration-200
                          ${
                            currentPage === i + 1
                              ? "bg-gray-700 text-white"
                              : "text-gray-400 hover:text-white hover:bg-gray-800"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg transition-colors duration-200 
                      ${
                        currentPage === totalPages
                          ? "text-gray-500 cursor-not-allowed"
                          : "text-gray-400 hover:text-white hover:bg-gray-800"
                      }`}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
