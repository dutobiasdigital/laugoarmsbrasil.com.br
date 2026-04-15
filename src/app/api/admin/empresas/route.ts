import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

async function adminDb() {
  const { createClient: createAdmin } = await import("@supabase/supabase-js");
  return createAdmin(
    `https://${PROJECT}.supabase.co`,
    SERVICE,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET() {
  const db = await adminDb();
  const { data, error } = await db
    .from("advertisers")
    .select("*")
    .order("tradeName", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = await adminDb();
    const { data, error } = await db.from("advertisers").insert({
      tradeName:   body.tradeName,
      legalName:   body.legalName   || null,
      contact:     body.contact     || null,
      phone:       body.phone       || null,
      email:       body.email       || null,
      website:     body.website     || null,
      instagram:   body.instagram   || null,
      address:     body.address     || null,
      segment:     body.segment     || "OUTROS",
      logoUrl:     body.logoUrl     || null,
      description: body.description || null,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...rest } = body;
    const db = await adminDb();
    const { error } = await db.from("advertisers").update({
      tradeName:   rest.tradeName,
      legalName:   rest.legalName   || null,
      contact:     rest.contact     || null,
      phone:       rest.phone       || null,
      email:       rest.email       || null,
      website:     rest.website     || null,
      instagram:   rest.instagram   || null,
      address:     rest.address     || null,
      segment:     rest.segment     || "OUTROS",
      logoUrl:     rest.logoUrl     || null,
      description: rest.description || null,
      updatedAt:   new Date().toISOString(),
    }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const db = await adminDb();
    const { error } = await db.from("advertisers").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
