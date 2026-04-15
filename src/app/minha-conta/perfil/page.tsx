import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PerfilForm from "./_components/PerfilForm";
import SenhaForm from "./_components/SenhaForm";

export const metadata = {
  title: "Meu Perfil — Minha Conta · Revista Magnum",
};
export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Busca perfil via REST
  const res = await fetch(
    `${BASE}/users?authId=eq.${user.id}&select=id,name,email,phone&limit=1`,
    { headers: HEADERS, cache: "no-store" }
  );
  const users = await res.json();
  const dbUser = Array.isArray(users) ? users[0] : null;

  const profile = dbUser ?? {
    id:    user.id,
    name:  (user.user_metadata?.full_name as string) ?? user.email?.split("@")[0] ?? "Usuário",
    email: user.email ?? "",
    phone: null,
  };

  return (
    <div className="max-w-[680px] py-7">
      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[36px] leading-none mb-1">
        Meu Perfil
      </h1>
      <p className="text-[#7a9ab5] text-[16px] mb-8">Atualize seus dados pessoais</p>

      <div className="flex flex-col gap-5">
        <PerfilForm profile={profile} />
        <SenhaForm />
      </div>
    </div>
  );
}
