import {NextRequest, NextResponse} from "next/server";
import {redis} from "@/lib/redis";
import crypto from "crypto";
import {put} from "@vercel/blob";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {data, image} = body;

    if (!data || typeof data !== "string") {
      return NextResponse.json({error: "Invalid data input"}, {status: 400});
    }

    // Create a unique hash key
    const hash = crypto
      .createHash("sha256")
      .update(`${data}:${image || ""}`)
      .digest("hex");
    const cacheKey = `qr:url:${hash}`;

    // Check Redis cache
    const cachedUrl = await redis.get<string>(cacheKey);
    if (cachedUrl) {
      return NextResponse.json({image: cachedUrl});
    }

    // Generate QR code from QRCode Monkey
    const qrResponse = await fetch("https://api.qrcode-monkey.com/qr/custom", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        data,
        config: {
          body: "circle",
          logo: image,
        },
        size: 300,
        download: false,
        file: "png",
      }),
    });

    if (!qrResponse.ok) throw new Error("QRCode Monkey API failed");

    const buffer = await qrResponse.arrayBuffer();
    const blob = await put(`images/qrcode/qr-${hash}.png`, buffer, {
      access: "public",
      contentType: "image/png",
      allowOverwrite: true,
    });

    // Cache the URL in Redis
    await redis.set(cacheKey, blob.url, {ex: 86400}); // 1 day TTL

    return NextResponse.json({image: blob.url});
  } catch (error) {
    console.error("QR Generation Error:", error);
    return NextResponse.json({error: "Failed to generate QR code"}, {status: 500});
  }
}
