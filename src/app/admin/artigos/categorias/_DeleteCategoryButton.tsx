"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  name: string;
}

export default function DeleteCategoryButton({ id, name }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Excluir a categoria "${name}"?\n\nEsta ação não pode ser desfeita.`)) return;
    setLoading(true);
    const res = await fetch("/api/admin/artigos/categorias", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Erro ao excluir categoria.");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-[#526888] hover:text-[#ff6b6b] text-[13px] transition-colors disabled:opacity-50"
    >
      {loading ? "..." : "Excluir"}
    </button>
  );
}
