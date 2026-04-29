import {NextRequest, NextResponse} from "next/server";
import {getRepoDetails} from "@/lib/utils";
import {getCardGeneratorFactory} from "./themes/factory";

export async function GET(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams;
    const repo = params.get("repo");
    const owner = params.get("owner");

    if (!owner || !repo) {
      return NextResponse.json({error: "Missing owner or repo query parameters"}, {status: 400});
    }
    const theme = params.get("theme") as string;

    const token = request.headers.get("authorization") || "";
    const repoData = await getRepoDetails(token, owner, repo);

    const cardGenerator = getCardGeneratorFactory(theme);
    cardGenerator.setConfig(params);
    const svg = await cardGenerator.generateCard(repoData);

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error generating SVG:", error);
    return NextResponse.json({error: "Failed to generate SVG"}, {status: 500});
  }
}
