import { NextResponse } from "next/server";
import { saveImageBuffer } from "@/src/lib/uploads";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; KirokuBot/1.0; +http://localhost)",
  Accept: "text/html,application/xhtml+xml",
};

function isBlockedHost(hostname: string) {
  const host = hostname.toLowerCase();
  return (
    host === "localhost" ||
    host.endsWith(".local") ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host === "::1" ||
    host === "[::1]"
  );
}

function parseTargetUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (isBlockedHost(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

function metaContent(html: string, property: string) {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1].trim();
  }

  return null;
}

function decodeEntities(value: string | null) {
  if (!value) return null;
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'");
}

async function fetchWithTimeout(url: string, ms: number, headers: Record<string, string>) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { headers, redirect: "follow", signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function downloadImage(imageUrl: string, base: URL) {
  const resolved = parseTargetUrl(new URL(imageUrl, base).toString());
  if (!resolved) return null;

  try {
    const response = await fetchWithTimeout(resolved.toString(), 8000, { "User-Agent": FETCH_HEADERS["User-Agent"] });
    const mime = response.headers.get("content-type")?.split(";")[0].trim() || "";
    if (!response.ok || !/^image\/(png|jpe?g|webp)$/.test(mime)) return null;

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_IMAGE_BYTES) return null;

    return await saveImageBuffer(buffer, mime === "image/jpg" ? "image/jpeg" : mime);
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const target = parseTargetUrl(new URL(request.url).searchParams.get("url"));
  if (!target) {
    return NextResponse.json({ error: "URLを確認してください。" }, { status: 400 });
  }

  try {
    const response = await fetchWithTimeout(target.toString(), 8000, FETCH_HEADERS);
    if (!response.ok) {
      return NextResponse.json({ error: "ページを取得できませんでした。" }, { status: 502 });
    }

    const html = (await response.text()).slice(0, 500_000);
    const title =
      metaContent(html, "og:title") || html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || null;
    const siteName = metaContent(html, "og:site_name") || metaContent(html, "twitter:site") || null;
    const image = metaContent(html, "og:image") || metaContent(html, "twitter:image") || null;
    const imagePath = image ? await downloadImage(decodeEntities(image) || image, target) : null;

    return NextResponse.json({
      title: decodeEntities(title),
      siteName: decodeEntities(siteName)?.replace(/^@/, "") || null,
      imagePath,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "ページを取得できませんでした。" }, { status: 502 });
  }
}
