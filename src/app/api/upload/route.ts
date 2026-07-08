import { NextResponse } from "next/server";
import { saveImageBuffer } from "@/src/lib/uploads";

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const { dataUrl } = (await request.json()) as { dataUrl?: string };
    const match = dataUrl?.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);

    if (!match) {
      return NextResponse.json({ error: "画像データを読み取れませんでした。" }, { status: 400 });
    }

    const buffer = Buffer.from(match[2], "base64");
    if (buffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: "画像が大きすぎます（10MBまで）。" }, { status: 413 });
    }

    const imagePath = await saveImageBuffer(buffer, match[1]);
    return NextResponse.json({ path: imagePath }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "アップロードに失敗しました。" }, { status: 500 });
  }
}
