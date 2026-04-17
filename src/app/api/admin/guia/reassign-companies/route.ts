import { NextRequest, NextResponse } from "next/server";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = {
  "Content-Type": "application/json",
  apikey:         SERVICE,
  Authorization:  `Bearer ${SERVICE}`,
  Prefer:         "return=representation",
};

/**
 * POST /api/admin/guia/reassign-companies
 * body: { assignments: [{ id: string; segment: string }] }
 *
 * Groups assignments by target segment and does one PATCH per group
 * using PostgREST's `id=in.(...)` filter.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const assignments: { id: string; segment: string }[] = body.assignments ?? [];

    if (!assignments.length) {
      return NextResponse.json({ error: "assignments não pode ser vazio." }, { status: 400 });
    }

    /* Group by target segment */
    const bySegment = new Map<string, string[]>();
    for (const a of assignments) {
      if (!a.id || !a.segment) continue;
      if (!bySegment.has(a.segment)) bySegment.set(a.segment, []);
      bySegment.get(a.segment)!.push(a.id);
    }

    /* PATCH each group */
    const errors: string[] = [];
    for (const [segment, ids] of bySegment) {
      const idList = ids.join(",");
      const res = await fetch(
        `${BASE}/companies?id=in.(${idList})`,
        {
          method:  "PATCH",
          headers: HEADERS,
          body:    JSON.stringify({ segment, updatedAt: new Date().toISOString() }),
        }
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        errors.push(`segment=${segment}: ${d?.message ?? res.statusText}`);
      }
    }

    if (errors.length) {
      return NextResponse.json({ error: errors.join("; ") }, { status: 500 });
    }

    return NextResponse.json({ ok: true, updated: assignments.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
