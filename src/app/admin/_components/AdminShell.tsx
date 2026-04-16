"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import AdminSidebarNav from "./AdminSidebarNav";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("admin-sidebar-collapsed") === "true") setCollapsed(true);
  }, []);

  function toggle() {
    setCollapsed((c) => {
      localStorage.setItem("admin-sidebar-collapsed", String(!c));
      return !c;
    });
  }

  const W = collapsed ? 68 : 240;

  return (
    <div className="min-h-screen bg-[#060608]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0e1520] border-b border-[#141d2c] h-[52px] flex items-center px-4 gap-3">
        <Link href="/admin" className="flex items-center gap-2 shrink-0">
          <div className="w-[26px] h-[26px] bg-[#ff1f1f] rounded-[4px] shrink-0" />
          <span className={`font-['Barlow_Condensed'] font-bold text-white text-[18px] tracking-[2px] transition-opacity duration-200 ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
            MAGNUM
          </span>
        </Link>
        {!collapsed && (
          <div className="bg-[#260d0d] px-2.5 py-[2px] rounded-[10px]">
            <span className="text-[#ff1f1f] text-[10px] font-bold tracking-[0.5px]">ADMIN</span>
          </div>
        )}
        <div className="flex-1" />
        <Link href="/" className="text-[#7a9ab5] hover:text-white text-[13px] transition-colors hidden sm:block">
          Ver site →
        </Link>
        <div className="bg-[#141d2c] w-px h-[28px] hidden sm:block" />
        <div className="flex items-center gap-2">
          <div className="w-[28px] h-[28px] rounded-full bg-[#ff1f1f] flex items-center justify-center text-[11px] font-bold text-white shrink-0">AD</div>
          {!collapsed && <span className="text-[#7a9ab5] text-[12px] hidden md:block">Admin ▾</span>}
        </div>
      </header>

      <div className="flex pt-[52px]">
        <aside
          className="fixed left-0 top-[52px] bottom-0 bg-[#0e1520] border-r border-[#141d2c] z-40 flex flex-col transition-[width] duration-200 ease-in-out"
          style={{ width: W }}
        >
          <AdminSidebarNav collapsed={collapsed} onToggle={toggle} />
        </aside>
        <main
          className="flex-1 min-h-[calc(100vh-52px)] transition-[margin-left] duration-200 ease-in-out px-6 py-6"
          style={{ marginLeft: W }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
