import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

async function checkAccess(userId: string, userEmail: string | null, slug: string) {
  const [userRes, editionRes] = await Promise.all([
    fetch(`${BASE}/users?authId=eq.${userId}&select=role,subscriptions(status)&limit=1`, {
      headers: HEADERS,
      cache: "no-store",
    }),
    fetch(`${BASE}/editions?slug=eq.${slug}&isPublished=eq.true&select=id&limit=1`, {
      headers: HEADERS,
      cache: "no-store",
    }),
  ]);

  const users    = await userRes.json();
  const editions = await editionRes.json();

  if (!Array.isArray(editions) || editions.length === 0) return "not_found";

  const dbUser   = Array.isArray(users) ? users[0] : null;
  const isAdmin  = dbUser?.role === "ADMIN";
  const activeSub =
    Array.isArray(dbUser?.subscriptions) &&
    dbUser.subscriptions.some((s: { status: string }) => s.status === "ACTIVE");

  if (isAdmin || activeSub) return "ok";

  // Verifica compra avulsa (30 dias)
  if (userEmail) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();
    const purchasedRes = await fetch(
      `${BASE}/payment_intents?payer_email=eq.${encodeURIComponent(userEmail)}&product_type=eq.edition_purchase&status=eq.APPROVED&createdAt=gte.${thirtyDaysAgo}&select=metadata`,
      { headers: HEADERS, cache: "no-store" }
    );
    const purchased = await purchasedRes.json();
    const hasSingle =
      Array.isArray(purchased) &&
      purchased.some(
        (p: { metadata?: { edition_slug?: string } }) =>
          p.metadata?.edition_slug === slug
      );
    if (hasSingle) return "ok";
  }

  return "denied";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // 1. Verifica autenticação
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  // 2. Verifica acesso (assinatura ou compra)
  let access: string;
  try {
    access = await checkAccess(user.id, user.email ?? null, slug);
  } catch {
    return NextResponse.json({ error: "Erro ao verificar acesso." }, { status: 500 });
  }

  if (access === "not_found") {
    return NextResponse.json({ error: "Edição não encontrada." }, { status: 404 });
  }
  if (access === "denied") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  // 3. Lista arquivos do bucket edition-pages/{slug}/
  const admin = createAdminClient();
  const { data: files, error: listErr } = await admin.storage
    .from("edition-pages")
    .list(slug, {
      limit: 500,
      sortBy: { column: "name", order: "asc" },
    });

  if (listErr) {
    return NextResponse.json({ error: listErr.message }, { status: 500 });
  }

  const pageFiles = (files ?? []).filter(
    (f) => f.name && !f.name.endsWith("/") && f.id // exclui "pastas"
  );

  if (pageFiles.length === 0) {
    return NextResponse.json({ urls: [], total: 0 });
  }

  // 4. Gera signed URLs (1 hora)
  const paths = pageFiles.map((f) => `${slug}/${f.name}`);
  const { data: signed, error: signErr } = await admin.storage
    .from("edition-pages")
    .createSignedUrls(paths, 3600);

  if (signErr) {
    return NextResponse.json({ error: signErr.message }, { status: 500 });
  }

  const urls = (signed ?? [])
    .filter((s) => s.signedUrl)
    .map((s) => s.signedUrl);

  return NextResponse.json({ urls, total: urls.length });
}
