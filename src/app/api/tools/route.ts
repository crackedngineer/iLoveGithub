import {NextRequest, NextResponse} from "next/server";
import fs from "fs/promises";
import path from "path";
import {replaceUrlVariables} from "@/app/helper";
import {rootDomain} from "@/lib/utils";
import type {Tool} from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    // Fetch query parameters efficiently
    const params = req.nextUrl.searchParams;
    const owner = params.get("owner") || "";
    const repo = params.get("repo") || "";
    const branch = params.get("branch") || "";
    if (!owner || !repo) {
      return NextResponse.json({error: "Missing owner or repo parameter"}, {status: 400});
    }

    // Read and parse tools.json in one step
    const filePath = path.join(process.cwd(), "tools.json");
    const data = JSON.parse(await fs.readFile(filePath, "utf-8"));

    // Map and update URLs in a functional style
    const result = data.map((item: Tool) => ({
      ...item,
      url: replaceUrlVariables(`https://${rootDomain}/tools/${item.name}/{owner}/{repo}/{branch}`, {
        owner,
        repo,
        branch,
      }),
    }));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error reading tools.json:", error);
    return NextResponse.json({error: "Failed to read tools data"}, {status: 500});
  }
}
