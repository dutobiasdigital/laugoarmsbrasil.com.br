import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    const folder = (formData.get("folder") as string | null)?.trim() || "";
    const filenameBase = (formData.get("filename") as string | null)?.trim() || "";
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";

    let storagePath: string;
    if (filenameBase) {
      storagePath = folder ? `${folder}/${filenameBase}.${ext}` : `${filenameBase}.${ext}`;
    } else {
      const random = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      storagePath = folder ? `${folder}/${random}.${ext}` : `${random}.${ext}`;
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // upsert: true para permitir substituição se mesmo nome
    const { error } = await supabase.storage
      .from("magnum-media")
      .upload(storagePath, buffer, { contentType: file.type, upsert: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from("magnum-media")
      .getPublicUrl(storagePath);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
