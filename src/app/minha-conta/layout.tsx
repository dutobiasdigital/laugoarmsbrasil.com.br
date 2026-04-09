import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import SidebarNav from "./_components/SidebarNav";

export const metadata = {
  title: "Minha Conta — Revista Magnum",
};

export default async function MinhaConta({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  let profile: { id: string; name: string; email: string; role: string; planName?: string | null; isActive?: boolean } | null = null;

  try {
    const raw = await prisma.user.findUnique({
      where: { authId: user.id },
      select: {
        id: true, name: true, email: true, role: true,
        subscription: { select: { status: true, plan: { select: { name: true } } } },
      },
    });
    if (raw) {
      profile = {
        id: raw.id,
        name: raw.name,
        email: raw.email,
        role: raw.role,
        planName: raw.subscription?.plan?.name ?? null,
        isActive: raw.subscription?.status === "ACTIVE",
      };
    }
  } catch {
    // DB unavailable
  }

  if (!profile) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      <SidebarNav user={profile} />
      <main className="flex-1 lg:ml-[240px] pt-14 lg:pt-0 pb-20 lg:pb-0 px-5 lg:px-8 py-7">
        {children}
      </main>
    </div>
  );
}
