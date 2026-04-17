import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PerfilForm from "./_components/PerfilForm";
import SenhaForm from "./_components/SenhaForm";

export const metadata = {
  title: "Dados Pessoais — Minha Conta · Revista Magnum",
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

  const res = await fetch(
    `${BASE}/users?authId=eq.${user.id}&select=id,name,email,phone,cpf,avatarUrl,addressStreet,addressNumber,addressComplement,addressNeighborhood,addressCity,addressState,addressZip,socialInstagram,socialFacebook,socialYoutube,socialTiktok&limit=1`,
    { headers: HEADERS, cache: "no-store" }
  );
  const users = await res.json();
  const dbUser = Array.isArray(users) ? users[0] : null;

  const profile = dbUser ?? {
    id: user.id, name: (user.user_metadata?.full_name as string) ?? user.email?.split("@")[0] ?? "Usuário",
    email: user.email ?? "", phone: null, cpf: null, avatarUrl: null,
    addressStreet: null, addressNumber: null, addressComplement: null,
    addressNeighborhood: null, addressCity: null, addressState: null, addressZip: null,
    socialInstagram: null, socialFacebook: null, socialYoutube: null, socialTiktok: null,
  };

  const email = dbUser?.email ?? user.email ?? "";

  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero-metal px-5 lg:px-10 pt-10 pb-8 border-b border-[#141d2c]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-[6px] h-[6px] bg-[#ff1f1f] rounded-full" />
          <span className="text-[#ff1f1f] text-[11px] font-semibold tracking-[1.5px] uppercase">Conta</span>
        </div>
        <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[44px] lg:text-[52px] leading-[0.95] mb-2">
          Dados Pessoais
        </h1>
        <p className="text-[#7a9ab5] text-[15px]">Gerencie suas informações, endereço e redes sociais.</p>
      </section>

      <div className="px-5 lg:px-10 py-8 max-w-[900px] flex flex-col gap-6">
        <PerfilForm profile={profile} />
        <SenhaForm email={email} />
      </div>
    </div>
  );
}
