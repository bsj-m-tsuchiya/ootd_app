import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const item = await prisma.item.update({
    where: { id },
    data: body,
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
