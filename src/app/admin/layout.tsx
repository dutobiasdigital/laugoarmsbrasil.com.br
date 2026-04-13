import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import AdminSidebarNav from "./_components/AdminSidebarNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  let initials = "AD";
  let firstName = "Admin";

  try {
    const profile = await prisma.user.findUnique({
      where: { authId: user.id },
      select: { name: true, role: true },
    });
    if (!profile || profile.role !== "ADMIN") redirect("/minha-conta");
    firstName = profile.name.split(" ")[0];
    initials = profile.name.slice(0, 2).toUpperCase();
  } catch {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#060608]">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#18181b] border-b border-[#27272a] h-[52px] flex items-center px-4 gap-3">
        <Link href="/admin" className="flex items-center gap-2.5 shrink-0">
          <div className="w-[26px] h-[26px] bg-[#ff1f1f] rounded-[2px]" />
          <span className="font-['Barlow_Condensed'] font-bold text-white text-[18px] tracking-[2px]">
            MAGNUM
          </span>
        </Link>
        <div className="bg-[#260d0d] px-2.5 py-[2px] rounded-[10px]">
          <span className="text-[#ff1f1f] text-[10px] font-bold tracking-[0.5px]">
            ADMIN
          </span>
        </div>
        <div className="flex-1" />
        <Link
          href="/"
          className="text-[#a1a1aa] hover:text-white text-[13px] transition-colors"
        >
          Ver site →
        </Link>
        <div className="bg-[#27272a] w-px h-[28px]" />
        <div className="flex items-center gap-2">
          <div className="w-[28px] h-[28px] rounded-full bg-[#ff1f1f] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
            {initials}
          </div>
          <span className="text-[#a1a1aa] text-[12px] hidden sm:block">
            {firstName} ▾
          </span>
        </div>
      </header>

      <div className="flex pt-[52px]">
        {/* Sidebar */}
        <aside className="fixed left-0 top-[52px] bottom-0 w-[220px] bg-[#18181b] border-r border-[#27272a] flex flex-col pt-4 px-2.5 overflow-y-auto">
          <AdminSidebarNav />
        </aside>

        {/* Page content */}
        <main className="flex-1 ml-[220px] px-6 py-6 min-h-[calc(100vh-52px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
