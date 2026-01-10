export const typeDefs = `
  type RelatedPosts {
    slug: String!
    title: String!
    tags: [String!]!
    coverImage: String
    excerpt: String
  }

  type Blog {
    slug: String!
    title: String!
    description: String
    created: String
    tags: [String!]
    body: String!
    readTimeMinutes: Int
    coverImage: String
    category: String
    author: String
    series: String
    related: [RelatedPosts!]!
  }

  type BlogListResponse {
    posts: [Blog!]!
    total: Int!
    page: Int!
    count: Int!
  }

  type Query {
    blogs(
      query: String
      category: String
      page: Int = 1
      count: Int = 10
    ): BlogListResponse!

    blog(slug: String!): Blog
  }
`;
