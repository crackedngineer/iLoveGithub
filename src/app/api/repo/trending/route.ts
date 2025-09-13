import {NextRequest, NextResponse} from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), "data", "trending_repositories.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error reading trending.json:", error);
    return NextResponse.json({error: "Failed to read trending data"}, {status: 500});
  }
}
