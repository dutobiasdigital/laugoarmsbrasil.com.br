"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <span className="w-[36px] h-[36px] rounded-full bg-transparent" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-[18px] text-[#7a9ab5] hover:text-white hover:bg-[#141d2c] transition-all duration-200"
      title={isDark ? "Tema claro" : "Tema escuro"}
    >
      {isDark ? "☀" : "🌙"}
    </button>
  );
}
