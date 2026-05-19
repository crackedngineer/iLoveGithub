jest.mock("axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    isAxiosError: jest.fn(),
  },
}));

// graphqlClient uses fullRootDomain from @/lib/utils which is module-level —
// mock it so the endpoint URL is predictable.
jest.mock("@/lib/utils", () => ({
  ...jest.requireActual("@/lib/utils"),
  fullRootDomain: "http://localhost:3000",
}));

import axios from "axios";
import {graphqlRequest} from "@/lib/graphqlClient";

const mockPost = axios.post as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("graphqlRequest", () => {
  const QUERY = `query { hello }`;

  it("returns the data field from a successful response", async () => {
    mockPost.mockResolvedValueOnce({
      data: {data: {hello: "world"}},
    });
    const result = await graphqlRequest<{hello: string}>(QUERY);
    expect(result).toEqual({hello: "world"});
  });

  it("posts to the graphql endpoint with the query and variables", async () => {
    mockPost.mockResolvedValueOnce({data: {data: {}}});
    const variables = {id: "123"};
    await graphqlRequest(QUERY, variables);
    expect(mockPost).toHaveBeenCalledWith(
      expect.stringContaining("/api/blog/graphql"),
      expect.objectContaining({query: QUERY, variables}),
    );
  });

  it("throws an error when the response contains a GraphQL errors array", async () => {
    mockPost.mockResolvedValueOnce({
      data: {errors: [{message: "Field not found"}], data: null},
    });
    await expect(graphqlRequest(QUERY)).rejects.toThrow("Field not found");
  });

  it("propagates network errors from axios.post", async () => {
    mockPost.mockRejectedValueOnce(new Error("Network failure"));
    await expect(graphqlRequest(QUERY)).rejects.toThrow("Network failure");
  });

  it("sends undefined variables when none are provided", async () => {
    mockPost.mockResolvedValueOnce({data: {data: {result: true}}});
    await graphqlRequest(QUERY);
    expect(mockPost).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({query: QUERY}),
    );
  });
});
