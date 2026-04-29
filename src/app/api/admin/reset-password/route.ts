import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// TEMPORARY endpoint — delete after use
export async function POST(request: Request) {
  const { email, password, secret } = await request.json();

  // Simple secret to prevent abuse
  if (secret !== "laugo2026reset") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not set" }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  );

  // Find user by email
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    return NextResponse.json({ error: `List error: ${listError.message}` }, { status: 500 });
  }

  const user = users.find((u) => u.email === email);
  if (!user) {
    return NextResponse.json({ error: `User ${email} not found` }, { status: 404 });
  }

  // Update password via Admin API (proper bcrypt)
  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    password,
    email_confirm: true,
  });

  if (updateError) {
    return NextResponse.json({ error: `Update error: ${updateError.message}` }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: `Password updated for ${email}` });
}
