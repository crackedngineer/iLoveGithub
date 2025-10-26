import axios from "axios";
import type {Tool} from "@/lib/types";

export const fetchToolList = async (
  owner: string,
  repo: string,
  branch: string,
): Promise<Tool[]> => {
  try {
    const response = await axios.get(`/api/tools?owner=${owner}&repo=${repo}&branch=${branch}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tools:", error);
    throw error;
  }
};
