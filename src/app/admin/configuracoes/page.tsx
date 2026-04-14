import prisma from "@/lib/prisma";
import ConfiguracoesClient from "./_ConfiguracoesClient";

export const dynamic = "force-dynamic";

export default async function AdminConfiguracoesPage() {
  let admins: { id: string; name: string; email: string; createdAt: Date }[] = [];

  try {
    admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
  } catch {
    // DB unavailable
  }

  const serialized = admins.map((a) => ({
    ...a,
    createdAt: a.createdAt.toLocaleDateString("pt-BR"),
  }));

  return (
    <>
      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
        Configurações
      </h1>
      <p className="text-[#7a9ab5] text-[14px] mb-6">
        Gerenciamento de administradores e configurações do sistema.
      </p>
      <div className="bg-[#141d2c] h-px mb-6" />

      <ConfiguracoesClient admins={serialized} />
    </>
  );
}
