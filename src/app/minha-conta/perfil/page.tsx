import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import PerfilForm from "./_components/PerfilForm";
import SenhaForm from "./_components/SenhaForm";

export const metadata = {
  title: "Meu Perfil — Minha Conta · Revista Magnum",
};

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const profile = await prisma.user.findUnique({
    where: { authId: user.id },
    select: { id: true, name: true, email: true, phone: true },
  });

  if (!profile) redirect("/auth/login");

  return (
    <div className="pt-14 lg:pt-0 pb-20 lg:pb-0 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Meu Perfil</h1>
        <p className="text-zinc-400 text-sm mt-1">Atualize seus dados pessoais</p>
      </div>

      <div className="space-y-6">
        <PerfilForm profile={profile} />
        <SenhaForm />
      </div>
    </div>
  );
}
