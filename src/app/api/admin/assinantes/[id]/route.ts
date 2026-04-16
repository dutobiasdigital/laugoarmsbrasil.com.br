import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Step 1: get user with subscriptions
    const userRes = await fetch(
      `${BASE}/users?id=eq.${id}&select=id,name,email,phone,role,createdAt,subscriptions(id,status,planId,planPriceInCents,intervalMonths,currentPeriodStart,currentPeriodEnd,subscribedAt,canceledAt,notes,subscription_plans(name))&limit=1`,
      { headers: HEADERS, cache: "no-store" }
    );
    if (!userRes.ok) throw new Error(await userRes.text());
    const userData = await userRes.json();
    if (!Array.isArray(userData) || userData.length === 0) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }
    const user = userData[0];

    // Step 2: get payments by email
    const paymentsRes = await fetch(
      `${BASE}/payment_intents?payer_email=eq.${encodeURIComponent(user.email)}&order=createdAt.desc&limit=10&select=id,amount_cents,status,gateway,createdAt`,
      { headers: HEADERS, cache: "no-store" }
    );
    const paymentsData = await paymentsRes.json();

    const subscription = user.subscriptions?.[0] ?? null;
    const payments = Array.isArray(paymentsData)
      ? paymentsData.map((p: { id: string; amount_cents: number; status: string; gateway: string; createdAt: string }) => ({
          id: p.id,
          amountInCents: p.amount_cents,
          status: p.status,
          paidAt: p.createdAt,
          paymentMethod: p.gateway,
          createdAt: p.createdAt,
        }))
      : [];

    return NextResponse.json({ ...user, subscription, payments });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const res = await fetch(`${BASE}/users?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...HEADERS, Prefer: "return=representation" },
      body: JSON.stringify({
        name: body.name || undefined,
        phone: body.phone || null,
        role: body.role || undefined,
        ...(body.avatarUrl !== undefined ? { avatarUrl: body.avatarUrl } : {}),
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return NextResponse.json(Array.isArray(data) ? data[0] : data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
