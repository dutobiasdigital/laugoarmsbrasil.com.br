"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  planName?: string | null;
  isActive?: boolean;
};

const NAV_ITEMS = [
  { href: "/minha-conta", label: "Dashboard", icon: "⊞", exact: true },
  { href: "/minha-conta/assinatura", label: "Minha Assinatura", icon: "💳" },
  { href: "/minha-conta/pagamentos", label: "Histórico de Pagamentos", icon: "📄" },
  { href: "/minha-conta/edicoes", label: "Edições Favoritas", icon: "★" },
  { href: "/minha-conta/perfil", label: "Dados Pessoais", icon: "👤" },
  { href: "/minha-conta/seguranca", label: "Segurança", icon: "🔐" },
  { href: "/minha-conta/notificacoes", label: "Notificações", icon: "🔔" },
];

export default function SidebarNav({ user }: { user: User }) {
  const pathname = usePathname();

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between px-4 h-14">
        <Link href="/" className="flex items-center gap-1.5">
          <div className="w-[22px] h-[22px] bg-[#ff1f1f] rounded-[2px]" />
          <span className="font-['Barlow_Condensed'] font-extrabold text-[18px] text-[#ff1f1f] tracking-wide">MAGNUM</span>
        </Link>
        <div className="w-8 h-8 rounded-full bg-[#ff1f1f] flex items-center justify-center text-[11px] font-bold text-white">
          {initials}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-[240px] bg-[#18181b] border-r border-[#27272a] flex-col z-30">
        {/* User profile */}
        <div className="flex flex-col items-start px-5 pt-7 pb-5">
          {/* Avatar */}
          <div className="w-[64px] h-[64px] rounded-full bg-[#ff1f1f] flex items-center justify-center mb-3">
            <span className="font-bold text-[22px] text-white">{initials}</span>
          </div>
          <p className="text-white text-[14px] font-semibold leading-snug">{user.name}</p>
          <p className="text-[#a1a1aa] text-[13px] mt-0.5">{user.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="bg-[#22c55e] rounded-full px-2.5 py-[3px]">
              <span className="text-white text-[10px] font-bold">
                {user.isActive ? "ATIVO" : "INATIVO"}
              </span>
            </div>
            {user.planName && (
              <span className="text-[#52525b] text-[12px]">{user.planName}</span>
            )}
          </div>
        </div>

        <div className="bg-[#27272a] h-px mx-5 mb-3" />

        {/* Navigation */}
        <nav className="flex-1 px-2.5 flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-3 py-2.5 rounded-[8px] text-[14px] transition-colors ${
                  isActive
                    ? "bg-[#260a0a] border border-[#ff1f1f] text-white font-semibold"
                    : "text-[#a1a1aa] hover:text-white hover:bg-[#27272a]"
                }`}
              >
                <span className={`text-[16px] ${isActive ? "text-[#ff1f1f]" : ""}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}

          {user.role === "ADMIN" && (
            <>
              <div className="bg-[#27272a] h-px mx-1 my-2" />
              <Link
                href="/admin"
                className="flex items-center gap-3.5 px-3 py-2.5 rounded-[8px] text-[14px] text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors"
              >
                <span className="text-[16px]">⚙</span>
                Painel Admin
              </Link>
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="px-2.5 pb-5">
          <div className="bg-[#27272a] h-px mx-1 mb-3" />
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-3.5 px-3 py-2.5 w-full rounded-[8px] text-[14px] text-[#52525b] hover:text-white hover:bg-[#27272a] transition-colors"
            >
              <span className="text-[16px]">🚪</span>
              Sair da conta
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#18181b] border-t border-[#27272a] flex">
        {NAV_ITEMS.slice(0, 4).map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] transition-colors ${
                isActive ? "text-[#ff1f1f]" : "text-[#52525b]"
              }`}
            >
              <span className="text-[18px]">{item.icon}</span>
              {item.label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
