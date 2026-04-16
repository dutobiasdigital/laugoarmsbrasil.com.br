import Link from "next/link";
import ProductForm from "../_ProductForm";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

export default async function NovoProdutoPage() {
  let categories: { id: string; title: string }[] = [];

  try {
    const res = await fetch(
      `${BASE}/shop_categories?select=id,title&isActive=eq.true&order=sortOrder.asc`,
      { headers: HEADERS, cache: "no-store" }
    );
    const data = await res.json();
    categories = Array.isArray(data) ? data : [];
  } catch {
    // DB unavailable
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/loja" className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors">
          Loja
        </Link>
        <span className="text-[#141d2c]">/</span>
        <Link href="/admin/loja/produtos" className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors">
          Produtos
        </Link>
        <span className="text-[#141d2c]">/</span>
        <span className="text-[#d4d4da] text-[14px]">Novo</span>
      </div>

      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
        Novo Produto
      </h1>
      <p className="text-[#7a9ab5] text-[14px] mb-6">Cadastre um novo produto na loja</p>
      <div className="bg-[#141d2c] h-px mb-6" />

      <ProductForm mode="create" categories={categories} />
    </>
  );
}
