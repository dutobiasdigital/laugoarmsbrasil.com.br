import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase com service role — use apenas em server-side (API routes, Server Components).
 * Bypassa todas as RLS policies.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
