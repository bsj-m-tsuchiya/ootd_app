import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

type ItemPatchInput = {
  type?: "purchased" | "want";
  isBest?: boolean;
  imagePath?: string | null;
  url?: string | null;
  brand?: string | null;
  name?: string | null;
  size?: string | null;
  price?: number | string | null;
  seasonYear?: number;
  seasonCode?: "SS" | "AW";
  purchaseMonth?: number | null;
  memo?: string | null;
  reminderAt?: string | null;
};

function normalizePatch(input: ItemPatchInput) {
  const data: Record<string, unknown> = {};

  if (input.type === "purchased" || input.type === "want") data.type = input.type;
  if ("isBest" in input) data.isBest = Boolean(input.isBest);
  if ("imagePath" in input) data.imagePath = input.imagePath || null;
  if ("url" in input) data.url = input.url || null;
  if ("brand" in input) data.brand = input.brand || null;
  if ("name" in input) data.name = input.name || null;
  if ("size" in input) data.size = input.size || null;
  if ("price" in input) {
    data.price =
      typeof input.price === "string"
        ? Number(input.price.replace(/[^\d]/g, "")) || null
        : input.price || null;
  }
  if ("seasonYear" in input) data.seasonYear = input.seasonYear;
  if ("seasonCode" in input) data.seasonCode = input.seasonCode;
  if ("purchaseMonth" in input) data.purchaseMonth = input.purchaseMonth || null;
  if ("memo" in input) data.memo = input.memo || null;
  if ("reminderAt" in input) data.reminderAt = input.reminderAt ? new Date(input.reminderAt) : null;

  return data;
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json()) as ItemPatchInput;
  const item = await prisma.item.update({
    where: { id },
    data: normalizePatch(body),
  });

  return NextResponse.json(item);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.item.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
