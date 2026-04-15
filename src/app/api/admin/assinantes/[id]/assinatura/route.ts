import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

// Create or update subscription for a user
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params;
  try {
    const body = await req.json();
    const { planId, status, currentPeriodStart, currentPeriodEnd, notes } = body;

    if (!planId || !status || !currentPeriodStart || !currentPeriodEnd) {
      return NextResponse.json({ error: "Campos obrigatórios: planId, status, currentPeriodStart, currentPeriodEnd" }, { status: 400 });
    }

    // Step 1: verify plan
    const planRes = await fetch(
      `${BASE}/subscription_plans?id=eq.${planId}&select=priceInCents,intervalMonths&limit=1`,
      { headers: HEADERS, cache: "no-store" }
    );
    if (!planRes.ok) throw new Error(await planRes.text());
    const planData = await planRes.json();
    if (!Array.isArray(planData) || planData.length === 0) {
      return NextResponse.json({ error: "Plano não encontrado." }, { status: 404 });
    }
    const plan = planData[0];

    // Step 2: verify user
    const userRes = await fetch(
      `${BASE}/users?id=eq.${userId}&select=id&limit=1`,
      { headers: HEADERS, cache: "no-store" }
    );
    if (!userRes.ok) throw new Error(await userRes.text());
    const userData = await userRes.json();
    if (!Array.isArray(userData) || userData.length === 0) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    // Step 3: check existing subscription
    const existingRes = await fetch(
      `${BASE}/subscriptions?userId=eq.${userId}&select=id&limit=1`,
      { headers: HEADERS, cache: "no-store" }
    );
    if (!existingRes.ok) throw new Error(await existingRes.text());
    const existingData = await existingRes.json();
    const existing = Array.isArray(existingData) && existingData.length > 0;

    const subData = {
      planId,
      status,
      planPriceInCents: plan.priceInCents,
      intervalMonths: plan.intervalMonths,
      currentPeriodStart,
      currentPeriodEnd,
      notes: notes || null,
      canceledAt: status === "CANCELED" ? new Date().toISOString() : null,
    };

    let subRes: Response;
    if (existing) {
      // Step 4a: update existing subscription
      subRes = await fetch(`${BASE}/subscriptions?userId=eq.${userId}`, {
        method: "PATCH",
        headers: { ...HEADERS, Prefer: "return=representation" },
        body: JSON.stringify(subData),
      });
    } else {
      // Step 4b: create new subscription
      subRes = await fetch(`${BASE}/subscriptions`, {
        method: "POST",
        headers: { ...HEADERS, Prefer: "return=representation" },
        body: JSON.stringify({ userId, mpSubscriptionId: null, ...subData }),
      });
    }

    if (!subRes.ok) throw new Error(await subRes.text());
    const result = await subRes.json();

    return NextResponse.json(Array.isArray(result) ? result[0] : result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
