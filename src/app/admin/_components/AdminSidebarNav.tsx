"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "⊞", exact: true },
  { href: "/admin/assinantes", label: "Assinantes", icon: "👥" },
  { href: "/admin/edicoes", label: "Edições", icon: "📰" },
  { href: "/admin/artigos", label: "Artigos", icon: "📝" },
  { href: "/admin/categorias", label: "Categorias", icon: "🏷" },
  { href: "/admin/anuncios", label: "Anúncios", icon: "📢" },
  { href: "/admin/pagamentos", label: "Pagamentos", icon: "💳" },
  { href: "/admin/planos", label: "Planos", icon: "⭐" },
  { href: "/admin/configuracoes", label: "Configurações", icon: "⚙" },
];

export default function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <>
      {ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-[14px] mb-0.5 transition-colors ${
              isActive
                ? "bg-[#260a0a] border border-[#ff1f1f] text-white font-semibold"
                : "text-[#7a9ab5] hover:text-white hover:bg-[#141d2c]"
            }`}
          >
            <span className={`text-[15px] ${isActive ? "text-[#ff1f1f]" : ""}`}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
