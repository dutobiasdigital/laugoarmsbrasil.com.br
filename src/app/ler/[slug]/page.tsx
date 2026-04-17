import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Reader from "./Reader";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

interface Edition {
  id: string;
  title: string;
  number: number | null;
  pageCount: number | null;
  type: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: `Lendo edição — Revista Magnum`,
    robots: "noindex, nofollow",
    other: { slug },
  };
}

export default async function LerEdicaoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const initialPage = sp.page ? parseInt(sp.page, 10) : undefined;

  // 1. Auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?redirect=/ler/${slug}`);
  }

  // 2. Busca edição + acesso em paralelo
  let edition: Edition | null = null;
  let canRead      = false;
  let dbUserId: string | null = null;
  let isFavorited  = false;

  try {
    const [editionRes, userRes] = await Promise.all([
      fetch(
        `${BASE}/editions?slug=eq.${slug}&isPublished=eq.true&select=id,title,number,pageCount,type&limit=1`,
        { headers: HEADERS, cache: "no-store" }
      ),
      fetch(
        `${BASE}/users?authId=eq.${user.id}&select=id,role,subscriptions(status)&limit=1`,
        { headers: HEADERS, cache: "no-store" }
      ),
    ]);

    const edData = await editionRes.json();
    edition = Array.isArray(edData) && edData.length > 0 ? edData[0] : null;

    const users  = await userRes.json();
    const dbUser = Array.isArray(users) ? users[0] : null;
    dbUserId     = dbUser?.id ?? null;

    const isAdmin  = dbUser?.role === "ADMIN";
    const activeSub =
      Array.isArray(dbUser?.subscriptions) &&
      dbUser.subscriptions.some((s: { status: string }) => s.status === "ACTIVE");

    canRead = isAdmin || activeSub;

    // Compra avulsa
    if (!canRead && edition && user.email) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();
      const purchasedRes  = await fetch(
        `${BASE}/payment_intents?payer_email=eq.${encodeURIComponent(user.email)}&product_type=eq.edition_purchase&status=eq.APPROVED&createdAt=gte.${thirtyDaysAgo}&select=metadata`,
        { headers: HEADERS, cache: "no-store" }
      );
      const purchased = await purchasedRes.json();
      canRead =
        Array.isArray(purchased) &&
        purchased.some(
          (p: { metadata?: { edition_slug?: string } }) =>
            p.metadata?.edition_slug === slug
        );
    }

    // Verifica favorito
    if (edition && dbUserId) {
      const favRes = await fetch(
        `${BASE}/user_favorites?userId=eq.${dbUserId}&contentType=eq.edition&contentId=eq.${edition.id}&select=id&limit=1`,
        { headers: HEADERS, cache: "no-store" }
      );
      const favData = await favRes.json();
      isFavorited = Array.isArray(favData) && favData.length > 0;
    }
  } catch {
    // DB indisponível
  }

  if (!edition) redirect("/edicoes");
  if (!canRead) redirect(`/edicoes/${slug}`);

  const title = edition.number
    ? `Edição ${edition.type === "SPECIAL" ? "Especial" : `Nº ${edition.number}`}`
    : edition.title;

  return (
    <Reader
      slug={slug}
      editionTitle={title}
      backUrl={`/edicoes/${slug}`}
      initialPage={initialPage}
      editionId={edition.id}
      isLoggedIn={true}
      initialIsFavorited={isFavorited}
    />
  );
}
