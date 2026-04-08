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

  const profile = await prisma.user.findUnique({
    where: { authId: user.id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!profile) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <SidebarNav user={profile} />
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">{children}</main>
    </div>
  );
}
