import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SidebarNav from "./_components/SidebarNav";

export const metadata = {
  title: "Minha Conta — Revista Magnum",
};

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

export default async function MinhaContaLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  type Profile = {
    id: string; name: string; email: string; role: string;
    avatarUrl?: string | null; planName?: string | null; isActive?: boolean;
  };

  let profile: Profile | null = null;

  try {
    const userRes = await fetch(
      `${BASE}/users?authId=eq.${user.id}&select=id,name,email,role,avatarUrl&limit=1`,
      { headers: HEADERS, cache: "no-store" }
    );
    const users = await userRes.json();
    const dbUser = Array.isArray(users) ? users[0] : null;

    if (dbUser) {
      const subRes = await fetch(
        `${BASE}/subscriptions?userId=eq.${dbUser.id}&select=status,subscription_plans(name)&limit=1`,
        { headers: HEADERS, cache: "no-store" }
      );
      const subs = await subRes.json();
      const sub  = Array.isArray(subs) ? subs[0] : null;
      profile = {
        id:        dbUser.id,
        name:      dbUser.name,
        email:     dbUser.email,
        role:      dbUser.role,
        avatarUrl: dbUser.avatarUrl ?? null,
        planName:  (sub?.subscription_plans as { name?: string } | null)?.name ?? null,
        isActive:  sub?.status === "ACTIVE",
      };
    } else {
      profile = {
        id:       user.id,
        name:     (user.user_metadata?.full_name as string | undefined) ?? user.email?.split("@")[0] ?? "Usuário",
        email:    user.email ?? "",
        role:     "SUBSCRIBER",
        avatarUrl: null,
        planName: null,
        isActive: false,
      };
    }
  } catch {
    profile = {
      id:       user.id,
      name:     (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "Usuário",
      email:    user.email ?? "",
      role:     "SUBSCRIBER",
      avatarUrl: null,
      planName: null,
      isActive: false,
    };
  }

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col">
      <Header />

      <div className="flex flex-1 mt-16">
        <SidebarNav user={profile} />

        {/* Main content — offset by sidebar width on desktop */}
        <main className="flex-1 lg:ml-[260px] min-w-0 pb-24 lg:pb-10">
          {children}
        </main>
      </div>

      <div className="lg:ml-[260px]">
        <Footer />
      </div>
    </div>
  );
}
