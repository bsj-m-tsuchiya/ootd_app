import { displayBrand, displayName, imageOf, seasonEyebrow, summaryLabelFor } from "@/src/lib/format";
import { ExportSize, ExportTextMode, Item, SummaryFrame } from "@/src/lib/types";

const inkColor = "#26221d";
const mutedColor = "#8b8178";
const faintColor = "#b6ac9f";
const paperColor = "#f4efe7";

function cssFontFamily(variable: string, fallback: string) {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return value || fallback;
}

function loadCanvasImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`画像を読み込めませんでした: ${src}`));
    image.src = src;
  });
}

function chooseGrid(count: number, width: number, height: number, gap: number) {
  let best = { columns: 1, rows: count, score: 0 };

  for (let columns = 1; columns <= count; columns += 1) {
    const rows = Math.ceil(count / columns);
    const cellWidth = (width - gap * (columns - 1)) / columns;
    const cellHeight = (height - gap * (rows - 1)) / rows;
    const balance = Math.min(cellWidth / cellHeight, cellHeight / cellWidth);
    const score = cellWidth * cellHeight * balance;

    if (score > best.score) {
      best = { columns, rows, score };
    }
  }

  return best;
}

function roundedRectPath(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + w, y, x + w, y + h, radius);
  context.arcTo(x + w, y + h, x, y + h, radius);
  context.arcTo(x, y + h, x, y, radius);
  context.arcTo(x, y, x + w, y, radius);
  context.closePath();
}

function drawContainedImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  const scale = Math.min(width / imageWidth, height / imageHeight);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;

  context.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function truncateToWidth(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (context.measureText(text).width <= maxWidth) return text;
  let current = text;
  while (current.length > 1 && context.measureText(`${current}…`).width > maxWidth) {
    current = current.slice(0, -1);
  }
  return `${current}…`;
}

function withLetterSpacing(context: CanvasRenderingContext2D, spacing: string, draw: () => void) {
  const styled = context as CanvasRenderingContext2D & { letterSpacing?: string };
  const previous = styled.letterSpacing;
  if (typeof styled.letterSpacing === "string") styled.letterSpacing = spacing;
  draw();
  if (typeof previous === "string") styled.letterSpacing = previous;
}

export type ExportOptions = {
  items: Item[];
  season: string;
  frame: SummaryFrame;
  statsLine: string;
  textMode: ExportTextMode;
  size: ExportSize;
  handle: string;
};

export async function renderSummaryImage({ items, season, frame, statsLine, textMode, size, handle }: ExportOptions) {
  const showText = textMode === "withText";
  const { width, height } = size;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas context を取得できませんでした");

  const displayFont = cssFontFamily("--font-display", '"Cormorant Garamond", "Times New Roman", serif');
  const minchoFont = cssFontFamily("--font-mincho", '"Shippori Mincho", "Hiragino Mincho ProN", serif');
  const bodyFont = cssFontFamily("--font-body", '"Zen Kaku Gothic New", "Hiragino Sans", sans-serif');

  canvas.width = width;
  canvas.height = height;
  context.fillStyle = paperColor;
  context.fillRect(0, 0, width, height);

  const minEdge = Math.min(width, height);
  const padding = Math.round(minEdge * 0.06);
  const gap = Math.round(minEdge * 0.028);
  const titleHeight = showText ? Math.round(height * 0.15) : 0;
  const footerHeight = showText ? Math.round(height * 0.05) : 0;
  const gridX = padding;
  const gridY = padding + titleHeight;
  const gridWidth = width - padding * 2;
  const gridHeight = height - gridY - padding - footerHeight;
  const { columns, rows } = chooseGrid(items.length, gridWidth, gridHeight, gap);
  const cellWidth = (gridWidth - gap * (columns - 1)) / columns;
  const cellHeight = (gridHeight - gap * (rows - 1)) / rows;
  const captionHeight = showText ? Math.min(Math.round(cellHeight * 0.2), Math.max(90, Math.round(height * 0.085))) : 0;
  const imageHeight = cellHeight - captionHeight;
  const images = await Promise.all(items.map((item) => loadCanvasImage(imageOf(item))));

  context.textAlign = "center";
  context.textBaseline = "middle";

  if (showText) {
    const eyebrowSize = Math.max(16, Math.round(minEdge * 0.018));
    context.fillStyle = mutedColor;
    context.font = `600 ${eyebrowSize}px ${displayFont}`;
    withLetterSpacing(context, `${Math.round(eyebrowSize * 0.42)}px`, () => {
      context.fillText(seasonEyebrow(season).toUpperCase(), width / 2, padding + titleHeight * 0.16);
    });

    const titleSize = Math.round(Math.min(width * 0.062, 76));
    context.fillStyle = inkColor;
    context.font = `500 ${titleSize}px ${minchoFont}`;
    context.fillText(summaryLabelFor(season, frame), width / 2, padding + titleHeight * 0.48);

    const statsSize = Math.max(19, Math.round(minEdge * 0.021));
    context.fillStyle = mutedColor;
    context.font = `italic 500 ${statsSize}px ${displayFont}`;
    withLetterSpacing(context, `${Math.round(statsSize * 0.14)}px`, () => {
      context.fillText(statsLine, width / 2, padding + titleHeight * 0.78);
    });
  }

  items.forEach((item, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const cellX = gridX + column * (cellWidth + gap);
    const cellY = gridY + row * (cellHeight + gap);

    context.save();
    context.shadowColor = "rgba(43, 36, 28, 0.1)";
    context.shadowBlur = Math.round(minEdge * 0.014);
    context.shadowOffsetY = Math.round(minEdge * 0.005);
    context.fillStyle = "#ffffff";
    roundedRectPath(context, cellX, cellY, cellWidth, cellHeight, Math.round(minEdge * 0.016));
    context.fill();
    context.restore();

    context.save();
    roundedRectPath(context, cellX, cellY, cellWidth, cellHeight, Math.round(minEdge * 0.016));
    context.clip();
    const inset = Math.round(minEdge * 0.012);
    drawContainedImage(
      context,
      images[index],
      cellX + inset,
      cellY + inset,
      cellWidth - inset * 2,
      imageHeight - inset * 2,
    );
    context.restore();

    if (!showText) return;

    const centerX = cellX + cellWidth / 2;
    const maxTextWidth = cellWidth * 0.86;
    const brandSize = Math.max(15, Math.round(minEdge * 0.016));
    const nameSize = Math.max(20, Math.round(minEdge * 0.021));

    context.fillStyle = faintColor;
    context.font = `700 ${brandSize}px ${bodyFont}`;
    withLetterSpacing(context, `${Math.round(brandSize * 0.24)}px`, () => {
      context.fillText(
        truncateToWidth(context, displayBrand(item).toUpperCase(), maxTextWidth),
        centerX,
        cellY + imageHeight + captionHeight * 0.3,
      );
    });

    context.fillStyle = inkColor;
    context.font = `italic 500 ${nameSize}px ${displayFont}`;
    context.fillText(
      truncateToWidth(context, displayName(item), maxTextWidth),
      centerX,
      cellY + imageHeight + captionHeight * 0.66,
    );
  });

  if (showText) {
    const footerSize = Math.max(15, Math.round(minEdge * 0.015));
    context.fillStyle = faintColor;
    context.font = `700 ${footerSize}px ${bodyFont}`;
    withLetterSpacing(context, `${Math.round(footerSize * 0.5)}px`, () => {
      const footerText = handle ? `@${handle}`.toUpperCase() : "KIROKU";
      context.fillText(footerText, width / 2, height - padding - footerHeight * 0.2);
    });
  }

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("画像の書き出しに失敗しました");
  return blob;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
