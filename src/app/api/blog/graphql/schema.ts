export const typeDefs = `
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
