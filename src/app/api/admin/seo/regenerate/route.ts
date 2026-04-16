import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;

const HEADERS = {
  "Content-Type": "application/json",
  "apikey": SERVICE,
  "Authorization": `Bearer ${SERVICE}`,
};

export async function POST() {
  try {
    const generatedAt = new Date().toISOString();

    // Persist timestamp to DB
    const res = await fetch(`${BASE}/site_settings`, {
      method: "POST",
      headers: { ...HEADERS, "Prefer": "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify([{ key: "seo.sitemap_last_generated", value: generatedAt, updatedAt: generatedAt }]),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }

    // Bust Next.js cache for sitemap and robots
    revalidatePath("/sitemap.xml");
    revalidatePath("/robots.txt");
    revalidateTag("sitemap");
    revalidateTag("robots");

    return NextResponse.json({ ok: true, generatedAt });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
