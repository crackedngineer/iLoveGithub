import {NextRequest, NextResponse} from "next/server";
import {supabase} from "@/lib/supabase";

const TABLE = "blog_post_views";

type ViewRow = {
  slug: string;
  views: number;
};

async function readViews(slug: string) {
  const {data, error} = await supabase
    .from(TABLE)
    .select("slug, views")
    .eq("slug", slug)
    .maybeSingle<ViewRow>();

  if (error) throw error;
  return data?.views ?? 0;
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({error: "Missing slug"}, {status: 400});
  }

  try {
    const views = await readViews(slug);
    return NextResponse.json({slug, views});
  } catch (error) {
    return NextResponse.json(
      {slug, views: 0, error: error instanceof Error ? error.message : "Unable to load views"},
      {status: 200},
    );
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {slug?: string};
  const slug = body.slug;

  if (!slug) {
    return NextResponse.json({error: "Missing slug"}, {status: 400});
  }

  try {
    const {data: rpcViews, error: rpcError} = await supabase.rpc("increment_blog_post_views", {
      post_slug: slug,
    });

    if (!rpcError && typeof rpcViews === "number") {
      return NextResponse.json({slug, views: rpcViews});
    }

    const current = await readViews(slug);
    const next = current + 1;
    const {error} = await supabase.from(TABLE).upsert({slug, views: next}, {onConflict: "slug"});

    if (error) throw error;

    return NextResponse.json({slug, views: next});
  } catch (error) {
    return NextResponse.json(
      {slug, views: 0, error: error instanceof Error ? error.message : "Unable to update views"},
      {status: 200},
    );
  }
}
