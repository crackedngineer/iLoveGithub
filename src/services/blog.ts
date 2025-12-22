import axios from "axios";
import type {BlogPostDetail, BlogPostFrontMatter, SeriesInfo} from "@/lib/types";
import {fullRootDomain} from "@/lib/utils";

type BlogPostsResponse = {
  posts: BlogPostFrontMatter[];
  total: number;
  page: number;
  count: number;
};

export async function getAllBlogPosts(
  page: number,
  postsPerPage: number,
  searchQuery: string = "",
  category: string | null = null,
) {
  const response = await axios.get(`${fullRootDomain}/api/blog`, {
    params: {
      page,
      count: postsPerPage,
      query: searchQuery,
      category: category,
    },
  });
  return response.data as BlogPostsResponse;
}

export async function getBlogPostBySlug(slug: string) {
  const response = await axios.get(`${fullRootDomain}/api/blog/${slug}`);
  return response.data as BlogPostDetail;
}
