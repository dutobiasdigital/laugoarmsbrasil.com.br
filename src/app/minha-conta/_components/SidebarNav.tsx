"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  planName?: string | null;
  isActive?: boolean;
};

const NAV_ITEMS = [
  {
    href: "/minha-conta",
    label: "Dashboard",
    exact: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor"/></svg>
    ),
  },
  {
    href: "/minha-conta/assinatura",
    label: "Minha Assinatura",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
    ),
  },
  {
    href: "/minha-conta/pagamentos",
    label: "Pagamentos",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
    ),
  },
  {
    href: "/minha-conta/favoritos",
    label: "Meus Favoritos",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
    ),
  },
  {
    href: "/minha-conta/perfil",
    label: "Dados Pessoais",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    ),
  },
];

export default function SidebarNav({ user }: { user: User }) {
  const pathname = usePathname();

  const initials = user.name
    .split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  return (
    <>
      {/* ── Desktop Sidebar ──────────────────────────────────────── */}
      <aside className="hidden lg:flex fixed top-16 left-0 h-[calc(100vh-64px)] w-[260px] bg-[#0a0e18] border-r border-[#141d2c] flex-col z-30 overflow-y-auto">

        {/* User card */}
        <div className="flex flex-col items-center px-5 pt-7 pb-6">
          <div className="relative mb-4">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-[72px] h-[72px] rounded-full object-cover border-2 border-[#1c2a3e]"
              />
            ) : (
              <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#ff1f1f] to-[#8b0000] flex items-center justify-center border-2 border-[#1c2a3e]">
                <span className="font-bold text-[24px] text-white">{initials}</span>
              </div>
            )}
            {user.isActive && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#22c55e] border-2 border-[#0a0e18] flex items-center justify-center">
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            )}
          </div>

          <p className="text-white text-[14px] font-semibold leading-snug text-center">{user.name}</p>
          <p className="text-[#526888] text-[12px] mt-0.5 text-center truncate w-full">{user.email}</p>

          {user.planName ? (
            <div className="mt-3 flex items-center gap-1.5 bg-[#ff1f1f]/10 border border-[#ff1f1f]/20 rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff1f1f]" />
              <span className="text-[#ff6b6b] text-[11px] font-semibold">{user.planName}</span>
            </div>
          ) : (
            <Link href="/assine"
              className="mt-3 text-[11px] font-semibold text-[#7a9ab5] hover:text-[#ff1f1f] transition-colors">
              Sem assinatura — Assinar →
            </Link>
          )}
        </div>

        <div className="bg-[#141d2c] h-px mx-5 mb-3" />

        {/* Navigation */}
        <nav className="flex-1 px-3 flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[8px] text-[13px] font-medium transition-all duration-150 ${
                  active
                    ? "bg-[#ff1f1f]/10 border border-[#ff1f1f]/20 text-white"
                    : "text-[#7a9ab5] hover:text-white hover:bg-[#141d2c]"
                }`}
              >
                <span className={active ? "text-[#ff1f1f]" : ""}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}

          {user.role === "ADMIN" && (
            <>
              <div className="bg-[#141d2c] h-px mx-1 my-2" />
              <Link href="/admin"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-[8px] text-[13px] font-medium text-[#7a9ab5] hover:text-white hover:bg-[#141d2c] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>
                Painel Admin
              </Link>
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5">
          <div className="bg-[#141d2c] h-px mx-1 mb-3" />
          <form action={logout}>
            <button type="submit"
              className="flex items-center gap-3 px-3.5 py-2.5 w-full rounded-[8px] text-[13px] font-medium text-[#526888] hover:text-white hover:bg-[#141d2c] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sair da conta
            </button>
          </form>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ─────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0e18] border-t border-[#141d2c] flex">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[9px] font-medium transition-colors ${
                active ? "text-[#ff1f1f]" : "text-[#526888]"
              }`}
            >
              <span className="scale-110">{item.icon}</span>
              {item.label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
