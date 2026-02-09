import {createYoga, createSchema} from "graphql-yoga";
import {typeDefs} from "./schema";
import {resolvers} from "./resolvers";

export const runtime = "edge";

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  graphqlEndpoint: "/api/blog/graphql",
  fetchAPI: {Response},
});

export async function GET(request: Request) {
  return yoga.fetch(request);
}

export async function POST(request: Request) {
  return yoga.fetch(request);
}
