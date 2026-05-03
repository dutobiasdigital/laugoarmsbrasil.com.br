import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BUCKET   = "laugo-media";
const STORAGE  = `https://${PROJECT}.supabase.co/storage/v1/object`;
const PUBLIC   = `https://${PROJECT}.supabase.co/storage/v1/object/public/${BUCKET}`;

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

    const storagePath = folder ? `${folder}/${safeName}` : safeName;

    const buffer = Buffer.from(await file.arrayBuffer());
    const res = await fetch(`${STORAGE}/${BUCKET}/${storagePath}`, {
      method: "POST",
      headers: {
        apikey:          SERVICE,
        Authorization:   `Bearer ${SERVICE}`,
        "Content-Type":  file.type || "application/octet-stream",
        "x-upsert":      "true",
      },
      body: buffer,
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }

    const url = `${PUBLIC}/${storagePath}`;
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
