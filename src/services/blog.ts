import type {BlogPostDetail, BlogPostFrontMatter} from "@/lib/types";
import {graphqlRequest} from "@/lib/graphqlClient";

type BlogPostsResponse = {
  posts: BlogPostFrontMatter[];
  total: number;
  page: number;
  count: number;
};

const BLOGS_QUERY = `
  query Blogs($page: Int!, $count: Int!, $query: String, $category: String) {
    blogs(page: $page, count: $count, query: $query, category: $category) {
      total
      page
      count
      posts {
        slug
        title
        created
        tags
        category
        readTimeMinutes
      }
    }
  }
`;

export async function getAllBlogPosts(
  page: number,
  postsPerPage: number,
  searchQuery = "",
  category: string | null = null,
) {
  const data = await graphqlRequest<{blogs: BlogPostsResponse}>(BLOGS_QUERY, {
    page,
    count: postsPerPage,
    query: searchQuery || null,
    category,
  });

  return data.blogs;
}

const BLOG_QUERY = `
  query Blog($slug: String!) {
    blog(slug: $slug) {
      slug
      title
      description
      created
      tags
      body
      related {
        slug
        title
        tags
        excerpt
        coverImage
      }
    }
  }
`;

export async function getBlogPostBySlug(slug: string) {
  const data = await graphqlRequest<{blog: BlogPostDetail}>(BLOG_QUERY, {slug});
  return data.blog;
}
