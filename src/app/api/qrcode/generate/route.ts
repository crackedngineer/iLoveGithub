import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, image } = body;

    if (!data || typeof data !== "string") {
      return NextResponse.json(
        { error: "Invalid data input" },
        { status: 400 }
      );
    }

    const qrResponse = await fetch("https://api.qrcode-monkey.com/qr/custom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    const base64 = Buffer.from(buffer).toString("base64");

    return NextResponse.json({
      image: `data:image/png;base64,${base64}`,
    });
  } catch (error) {
    console.error("QR Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
