import axios from "axios";
import {fullRootDomain} from "@/lib/utils";

const GRAPHQL_ENDPOINT = `${fullRootDomain}/api/blog/graphql`;

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, any>,
): Promise<T> {
  const response = await axios.post(GRAPHQL_ENDPOINT, {
    query,
    variables,
  });

  if (response.data.errors) {
    throw new Error(response.data.errors[0].message);
  }

  return response.data.data;
}
