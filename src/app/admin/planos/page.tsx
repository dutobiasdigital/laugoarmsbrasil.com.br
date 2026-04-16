import PlanosClient from "./_PlanosClient";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceInCents: number;
  intervalMonths: number;
  active: boolean;
  subscriberCount: number;
  highlight: boolean;
  badge: string | null;
  buttonText: string | null;
  features: string | null;
  sortOrder: number;
}

export default async function AdminPlanosPage() {
  let plans: Plan[] = [];

  try {
    // Busca planos ordenados por intervalo
    const plansRes = await fetch(
      `${BASE}/subscription_plans?order=sortOrder.asc,intervalMonths.asc&select=id,name,slug,description,priceInCents,intervalMonths,active,highlight,badge,buttonText,features,sortOrder`,
      { headers: HEADERS, cache: "no-store" }
    );
    const rawPlans = await plansRes.json();
    if (!Array.isArray(rawPlans)) throw new Error("Dados inválidos");

    // Busca contagem de assinantes por plano
    const subsRes = await fetch(
      `${BASE}/subscriptions?select=planId&status=eq.ACTIVE`,
      { headers: HEADERS, cache: "no-store" }
    );
    const subs = await subsRes.json();
    const countMap: Record<string, number> = {};
    if (Array.isArray(subs)) {
      for (const s of subs) {
        countMap[s.planId] = (countMap[s.planId] ?? 0) + 1;
      }
    }

    plans = rawPlans.map((p: Plan) => ({
      ...p,
      subscriberCount: countMap[p.id] ?? 0,
    }));
  } catch {
    // DB unavailable
  }

  return (
    <>
      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
        Planos
      </h1>
      <p className="text-[#7a9ab5] text-[14px] mb-6">
        Gerencie os planos de assinatura disponíveis.
      </p>
      <div className="bg-[#141d2c] h-px mb-6" />

      <PlanosClient plans={plans} />
    </>
  );
}
