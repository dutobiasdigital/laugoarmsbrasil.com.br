import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SidebarNav from "./_components/SidebarNav";

export const metadata = {
  title: "Minha Conta — Revista Magnum",
};

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

export default async function MinhaContaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  let profile: {
    id: string; name: string; email: string; role: string;
    planName?: string | null; isActive?: boolean;
  } | null = null;

  try {
    // Busca perfil do usuário
    const userRes = await fetch(
      `${BASE}/users?authId=eq.${user.id}&select=id,name,email,role&limit=1`,
      { headers: HEADERS, cache: "no-store" }
    );
    const users = await userRes.json();
    const dbUser = Array.isArray(users) ? users[0] : null;

    if (dbUser) {
      // Busca assinatura ativa com plano
      const subRes = await fetch(
        `${BASE}/subscriptions?userId=eq.${dbUser.id}&select=status,subscription_plans(name)&limit=1`,
        { headers: HEADERS, cache: "no-store" }
      );
      const subs = await subRes.json();
      const sub  = Array.isArray(subs) ? subs[0] : null;

      profile = {
        id:       dbUser.id,
        name:     dbUser.name,
        email:    dbUser.email,
        role:     dbUser.role,
        planName: (sub?.subscription_plans as { name?: string } | null)?.name ?? null,
        isActive: sub?.status === "ACTIVE",
      };
    } else {
      // Usuário logado no Supabase Auth mas sem registro na tabela users
      // Usa dados do auth como fallback
      profile = {
        id:       user.id,
        name:     (user.user_metadata?.full_name as string | undefined)
                  ?? (user.user_metadata?.name as string | undefined)
                  ?? user.email?.split("@")[0] ?? "Usuário",
        email:    user.email ?? "",
        role:     "SUBSCRIBER",
        planName: null,
        isActive: false,
      };
    }
  } catch {
    // Fallback mínimo para não bloquear a UI
    profile = {
      id:       user.id,
      name:     (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "Usuário",
      email:    user.email ?? "",
      role:     "SUBSCRIBER",
      planName: null,
      isActive: false,
    };
  }

  return (
    <div className="min-h-screen bg-[#070a12] flex">
      <SidebarNav user={profile} />
      <main className="flex-1 lg:ml-[240px] pt-14 lg:pt-0 pb-20 lg:pb-0 px-5 lg:px-8 py-7">
        {children}
      </main>
    </div>
  );
}
