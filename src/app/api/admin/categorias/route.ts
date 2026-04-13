import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function toSlug(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Nome obrigatório." }, { status: 400 });
    const cat = await prisma.articleCategory.create({ data: { name: name.trim(), slug: toSlug(name) } });
    return NextResponse.json(cat);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, name } = await req.json();
    if (!id || !name?.trim()) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    const cat = await prisma.articleCategory.update({ where: { id }, data: { name: name.trim(), slug: toSlug(name) } });
    return NextResponse.json(cat);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.articleCategory.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
