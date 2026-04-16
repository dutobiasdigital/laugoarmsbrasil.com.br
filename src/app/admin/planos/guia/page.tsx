import Link from "next/link";
import PlanosGuiaClient from "./_PlanosGuiaClient";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

interface GuiaPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  listingType: string;
  priceInCents: number;
  intervalMonths: number;
  features: string | null;
  active: boolean;
  sortOrder: number;
  highlight: boolean;
  badge: string | null;
  buttonText: string | null;
}

export default async function AdminPlanosGuiaPage() {
  let plans: GuiaPlan[] = [];

  try {
    const res = await fetch(
      `${BASE}/guide_plans?order=sortOrder.asc&select=id,name,slug,description,listingType,priceInCents,intervalMonths,features,active,sortOrder,highlight,badge,buttonText`,
      { headers: HEADERS, cache: "no-store" }
    );
    const raw = await res.json();
    if (!Array.isArray(raw)) throw new Error("Dados inválidos");
    plans = raw as GuiaPlan[];
  } catch {
    // DB unavailable
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Link
          href="/admin/planos"
          className="text-[#526888] hover:text-[#7a9ab5] text-[13px] transition-colors"
        >
          ← Planos
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
            Planos — Guia Magnum
          </h1>
          <p className="text-[#7a9ab5] text-[14px]">
            Gerencie os planos de listagem do Guia Comercial
          </p>
        </div>
      </div>
      <div className="bg-[#141d2c] h-px mb-6" />

      <PlanosGuiaClient plans={plans} />
    </>
  );
}
