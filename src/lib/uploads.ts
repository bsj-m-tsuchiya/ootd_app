import { mkdir, writeFile } from "fs/promises";
import path from "path";

function extensionOf(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export async function saveImageBuffer(buffer: Buffer, mime: string) {
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensionOf(mime)}`;
  await writeFile(path.join(dir, name), buffer);
  return `/uploads/${name}`;
}
