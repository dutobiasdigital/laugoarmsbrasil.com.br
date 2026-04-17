import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const H = {
  apikey: SERVICE,
  Authorization: `Bearer ${SERVICE}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};

/* ── GET — lista favoritos do usuário ─────────────────────────── */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const contentType = req.nextUrl.searchParams.get("contentType");

  const userRes = await fetch(
    `${BASE}/users?authId=eq.${user.id}&select=id&limit=1`,
    { headers: H, cache: "no-store" }
  );
  const users = await userRes.json();
  const dbUser = Array.isArray(users) ? users[0] : null;
  if (!dbUser) return NextResponse.json({ favorites: [] });

  const typeFilter = contentType ? `&contentType=eq.${contentType}` : "";
  const favRes = await fetch(
    `${BASE}/user_favorites?userId=eq.${dbUser.id}${typeFilter}&select=id,contentType,contentId,createdAt&order=createdAt.desc`,
    { headers: H, cache: "no-store" }
  );
  const favorites = await favRes.json();
  return NextResponse.json({ favorites: Array.isArray(favorites) ? favorites : [] });
}

/* ── POST — adiciona ou remove um favorito (toggle) ──────────── */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json() as { contentType: string; contentId: string };
  const { contentType, contentId } = body;

  if (!contentType || !contentId) {
    return NextResponse.json({ error: "contentType e contentId são obrigatórios" }, { status: 400 });
  }

  const userRes = await fetch(
    `${BASE}/users?authId=eq.${user.id}&select=id&limit=1`,
    { headers: H, cache: "no-store" }
  );
  const users = await userRes.json();
  const dbUser = Array.isArray(users) ? users[0] : null;
  if (!dbUser) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  // Verifica se já existe
  const existRes = await fetch(
    `${BASE}/user_favorites?userId=eq.${dbUser.id}&contentType=eq.${contentType}&contentId=eq.${encodeURIComponent(contentId)}&select=id&limit=1`,
    { headers: H, cache: "no-store" }
  );
  const existing = await existRes.json();
  const exists = Array.isArray(existing) && existing.length > 0;

  if (exists) {
    // Remove
    const delRes = await fetch(
      `${BASE}/user_favorites?userId=eq.${dbUser.id}&contentType=eq.${contentType}&contentId=eq.${encodeURIComponent(contentId)}`,
      { method: "DELETE", headers: H }
    );
    if (!delRes.ok) return NextResponse.json({ error: "Erro ao remover favorito" }, { status: 500 });
    return NextResponse.json({ favorited: false });
  } else {
    // Adiciona
    const addRes = await fetch(
      `${BASE}/user_favorites`,
      {
        method: "POST",
        headers: { ...H, Prefer: "return=minimal" },
        body: JSON.stringify({ userId: dbUser.id, contentType, contentId }),
      }
    );
    if (!addRes.ok) return NextResponse.json({ error: "Erro ao adicionar favorito" }, { status: 500 });
    return NextResponse.json({ favorited: true });
  }
}
