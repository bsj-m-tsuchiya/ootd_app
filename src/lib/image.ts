const MAX_EDGE = 1400;

function readAsDataUrl(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("画像を読み込めませんでした。"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("画像を読み込めませんでした。"));
    image.src = src;
  });
}

async function resizeToDataUrl(file: Blob) {
  const original = await readAsDataUrl(file);
  const image = await loadImage(original);
  const scale = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
  const context = canvas.getContext("2d");
  if (!context) return original;

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.88);
}

export async function uploadImageFile(file: Blob): Promise<string> {
  const dataUrl = await resizeToDataUrl(file);
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataUrl }),
  });

  if (!response.ok) throw new Error("アップロードに失敗しました。");
  const { path } = (await response.json()) as { path: string };
  return path;
}

export function imageFileFromClipboard(event: ClipboardEvent) {
  const items = event.clipboardData?.items;
  if (!items) return null;

  for (const item of items) {
    if (item.kind === "file" && item.type.startsWith("image/")) {
      return item.getAsFile();
    }
  }

  return null;
}
