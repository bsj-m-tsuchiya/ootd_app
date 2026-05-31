import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

type ItemInput = {
  type?: "purchased" | "want";
  imagePath?: string;
  url?: string;
  brand?: string;
  name?: string;
  size?: string;
  price?: number | string | null;
  seasonYear?: number;
  seasonCode?: "SS" | "AW";
  memo?: string;
  reminderAt?: string | null;
};

function normalizeItem(input: ItemInput) {
  const price =
    typeof input.price === "string"
      ? Number(input.price.replace(/[^\d]/g, "")) || null
      : input.price || null;

  return {
    type: input.type ?? "purchased",
    imagePath: input.imagePath || "/assets/item-white-dress.jpg",
    url: input.url || null,
    brand: input.brand || null,
    name: input.name || null,
    size: input.size || null,
    price,
    seasonYear: input.seasonYear || 2026,
    seasonCode: input.seasonCode ?? "SS",
    memo: input.memo || null,
    reminderAt: input.reminderAt ? new Date(input.reminderAt) : null,
  };
}

async function seedLocalItems() {
  const count = await prisma.item.count();
  if (count > 0) return;

  await prisma.item.createMany({
    data: [
      {
        type: "purchased",
        imagePath: "/assets/item-white-dress.jpg",
        brand: "SNIDEL",
        name: "white frill mini dress",
        size: "0",
        price: 18700,
        seasonYear: 2026,
        seasonCode: "SS",
        memo: "白ワンピ枠。写真映えするので今季まとめの主役にする。",
      },
      {
        type: "purchased",
        imagePath: "/assets/item-dot-dress.jpg",
        brand: "SNIDEL",
        name: "dot collar dress",
        size: "F",
        price: 16500,
        seasonYear: 2026,
        seasonCode: "SS",
        memo: "似た服を買いすぎないように記録。",
      },
      {
        type: "purchased",
        imagePath: "/assets/item-black-vest.jpg",
        brand: "Bibiy",
        name: "black tailored vest",
        size: "F",
        price: 19800,
        seasonYear: 2025,
        seasonCode: "AW",
        memo: "秋冬の購入品まとめ用。",
      },
      {
        type: "want",
        imagePath: "/assets/want-reference.jpg",
        brand: "Girl Lele Studio",
        name: "lace hood top",
        size: "F",
        seasonYear: 2026,
        seasonCode: "SS",
        reminderAt: new Date("2026-06-17T18:00:00+09:00"),
        memo: "発売時間に公式サイトを見る。",
      },
    ],
  });
}

export async function GET() {
  await seedLocalItems();

  const items = await prisma.item.findMany({
    orderBy: [{ createdAt: "desc" }],
  });

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = (await request.json()) as ItemInput;
  const item = await prisma.item.create({
    data: normalizeItem(body),
  });

  return NextResponse.json(item, { status: 201 });
}
