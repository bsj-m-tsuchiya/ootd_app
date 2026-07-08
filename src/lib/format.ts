import { DetailDraft, Item, SummaryFrame, sampleImages } from "@/src/lib/types";

export function seasonOf(item: Pick<Item, "seasonYear" | "seasonCode">) {
  return `${item.seasonYear}${item.seasonCode}`;
}

export function parseSeason(value: string) {
  const match = value.match(/^(\d{4})(SS|AW)$/);
  return {
    code: (match?.[2] || "SS") as "SS" | "AW",
    year: match?.[1] || value.slice(0, 4),
  };
}

export function seasonEyebrow(season: string) {
  const parsed = parseSeason(season);
  const words = parsed.code === "SS" ? "SPRING / SUMMER" : "AUTUMN / WINTER";
  return `${words} ${parsed.year}`;
}

export function summaryLabelFor(season: string, frame: SummaryFrame) {
  const parsed = parseSeason(season);
  if (frame === "best") {
    const half = parsed.code === "SS" ? "上半期" : "下半期";
    return `#${parsed.year}${half}ベストバイ`;
  }

  return `#${season}購入品`;
}

export function resolveImagePath(path: string | null) {
  if (!path) return sampleImages[0];
  if (path === "/assets/want-reference.jpg") return "/assets/purchased-reference.jpg";
  return path;
}

export function imageOf(item: Pick<Item, "imagePath">) {
  return resolveImagePath(item.imagePath);
}

export function displayBrand(item: Pick<Item, "brand">) {
  return item.brand || "画像だけ保存";
}

export function displayName(item: Pick<Item, "name">) {
  return item.name || "商品名未入力";
}

export function formatPrice(price: number) {
  return `¥${price.toLocaleString("ja-JP")}`;
}

export function statsLineFor(items: Pick<Item, "price">[]) {
  const totalPrice = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const countLabel = `${items.length} item${items.length === 1 ? "" : "s"}`;
  return totalPrice > 0 ? `${countLabel} — ${formatPrice(totalPrice)}` : countLabel;
}

export function formatReminder(value: string | null) {
  if (!value) return "未設定";
  const date = new Date(value);
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

export function formatDropDate(value: string | null) {
  if (!value) return { day: "--", month: "未定", time: "" };
  const date = new Date(value);
  return {
    day: String(date.getDate()),
    month: `${date.getMonth() + 1}月`,
    time: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
  };
}

export type Countdown = {
  label: string;
  state: "today" | "soon" | "later" | "past" | "none";
};

export function countdownFor(value: string | null, now = new Date()): Countdown {
  if (!value) return { label: "日付未定", state: "none" };

  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return { label: "日付未定", state: "none" };

  const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfDay(target).getTime() - startOfDay(now).getTime()) / 86_400_000);

  if (diffDays < 0) return { label: "発売済み", state: "past" };
  if (diffDays === 0) return { label: "今日", state: "today" };
  if (diffDays === 1) return { label: "明日", state: "soon" };
  if (diffDays <= 7) return { label: `あと${diffDays}日`, state: "soon" };
  return { label: `あと${diffDays}日`, state: "later" };
}

export type WantSection = {
  key: string;
  title: string;
  note: string;
  items: Item[];
};

const sectionOrder: { key: Countdown["state"]; title: string; note: string }[] = [
  { key: "today", title: "TODAY", note: "今日" },
  { key: "soon", title: "THIS WEEK", note: "今週" },
  { key: "later", title: "UPCOMING", note: "この先" },
  { key: "none", title: "SOMEDAY", note: "日付未定" },
  { key: "past", title: "RELEASED", note: "発売済み" },
];

export function groupWantItems(items: Item[], now = new Date()): WantSection[] {
  const buckets = new Map<Countdown["state"], Item[]>();

  for (const item of items) {
    const state = countdownFor(item.reminderAt, now).state;
    buckets.set(state, [...(buckets.get(state) || []), item]);
  }

  return sectionOrder
    .filter((section) => buckets.get(section.key)?.length)
    .map((section) => ({
      key: section.key,
      title: section.title,
      note: section.note,
      items: buckets.get(section.key) || [],
    }));
}

export function toDatetimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function toGoogleCalendarDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function googleCalendarUrl(item: Item) {
  if (!item.reminderAt) return null;

  const start = new Date(item.reminderAt);
  if (Number.isNaN(start.getTime())) return null;

  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const details = [item.memo, item.url ? `購入リンク: ${item.url}` : ""].filter(Boolean).join("\n");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    dates: `${toGoogleCalendarDate(start)}/${toGoogleCalendarDate(end)}`,
    details,
    text: `${displayBrand(item)} ${displayName(item)} 購入予定`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function createDetailDraft(item: Item): DetailDraft {
  return {
    imagePath: resolveImagePath(item.imagePath),
    url: item.url || "",
    brand: item.brand || "",
    name: item.name || "",
    size: item.size || "",
    price: item.price ? String(item.price) : "",
    seasonYear: item.seasonYear,
    seasonCode: item.seasonCode,
    purchaseMonth: item.purchaseMonth || new Date().getMonth() + 1,
    memo: item.memo || "",
    reminderAt: toDatetimeLocal(item.reminderAt),
  };
}
