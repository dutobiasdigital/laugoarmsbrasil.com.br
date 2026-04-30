import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export const dynamic = "force-dynamic";

function sanitizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    const rawFolder   = (formData.get("folder")   as string | null)?.trim() || "";
    const rawFilename = (formData.get("filename") as string | null)?.trim() || "";
    const ext         = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const folder      = rawFolder   ? sanitizeName(rawFolder)   : "";
    const fileBase    = rawFilename ? sanitizeName(rawFilename) : "";

    const safeName = fileBase
      ? `${fileBase}.${ext}`
      : `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const uploadsDir = folder
      ? path.join(process.cwd(), "public", "uploads", folder)
      : path.join(process.cwd(), "public", "uploads");

    await fs.mkdir(uploadsDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadsDir, safeName), buffer);

    const url = folder ? `/uploads/${folder}/${safeName}` : `/uploads/${safeName}`;
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
