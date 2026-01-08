import {NextRequest, NextResponse} from "next/server";
import axios from "axios";
import crypto from "crypto";
import {put} from "@vercel/blob";
import {JSDOM} from "jsdom";
import nodeCanvas from "canvas";
import QRCodeStyling, {Options} from "qr-code-styling";
import {redis} from "@/lib/redis";
import QrCodeStylingOption from "./qr-code-styling.option.json";

async function getImageBuffer(imageUrl: string): Promise<string> {
  const response = await axios.get(imageUrl, {
    responseType: "arraybuffer",
  });
  return (
    `data:${response.headers["content-type"]};base64,` +
    Buffer.from(response.data).toString("base64")
  );
}

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
    const qrCodeImage = new QRCodeStyling({
      ...(QrCodeStylingOption as Options),
      type: "svg",
      jsdom: JSDOM,
      nodeCanvas,
      image: await getImageBuffer(image),
    });

    const qrBuffer = await qrCodeImage.getRawData("svg");
    if (!qrBuffer) {
      return NextResponse.json({error: "Failed to generate QR code buffer"}, {status: 500});
    }
    const blob = await put(`images/qrcode/qr-${hash}.svg`, qrBuffer, {
      access: "public",
      contentType: "image/svg+xml",
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
