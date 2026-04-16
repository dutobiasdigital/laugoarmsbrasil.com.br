import { NextRequest, NextResponse } from "next/server";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status  = searchParams.get("status") ?? "";
    const q       = searchParams.get("q") ?? "";
    const limit   = parseInt(searchParams.get("limit") ?? "20", 10);
    const offset  = parseInt(searchParams.get("offset") ?? "0", 10);

    let url = `${BASE}/shop_orders?select=id,orderNumber,customerName,customerEmail,total,paymentMethod,paymentGateway,status,createdAt&order=createdAt.desc&limit=${limit}&offset=${offset}`;

    if (status) url += `&status=eq.${status}`;
    if (q) {
      // Search across name, email and orderNumber (use or filter)
      const enc = encodeURIComponent(q);
      url += `&or=(customerName.ilike.*${enc}*,customerEmail.ilike.*${enc}*,orderNumber.ilike.*${enc}*)`;
    }

    const res = await fetch(url, {
      headers: { ...HEADERS, Prefer: "count=exact" },
      cache: "no-store",
    });
    const data  = await res.json();
    const total = parseInt(res.headers.get("content-range")?.split("/")[1] ?? "0", 10);

    return NextResponse.json({ orders: data, total });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const id   = body.id as string;
    if (!id) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });

    const patch: Record<string, unknown> = {};
    if (body.status !== undefined)               patch.status = body.status;
    if (body.shippingTrackingCode !== undefined) patch.shippingTrackingCode = body.shippingTrackingCode;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Nenhum campo para atualizar." }, { status: 400 });
    }

    const res = await fetch(`${BASE}/shop_orders?id=eq.${id}`, {
      method: "PATCH",
      headers: { ...HEADERS, Prefer: "return=representation" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(await res.text());

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error).message || "Erro ao atualizar pedido." },
      { status: 500 }
    );
  }
}
