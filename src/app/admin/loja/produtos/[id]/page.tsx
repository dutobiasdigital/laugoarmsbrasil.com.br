export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import ProductForm from "../_ProductForm";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product: Record<string, unknown> | null = null;
  let variations: Record<string, unknown>[]   = [];
  let categories: { id: string; title: string }[] = [];

  try {
    const [prodRes, varRes, catRes] = await Promise.all([
      fetch(
        `${BASE}/shop_products?id=eq.${id}&select=id,name,slug,categoryId,isActive,isFeatured,basePrice,hasVariations,stock,sku,description,technicalSpecs,weight,dimensionWidth,dimensionHeight,dimensionLength,mainImageUrl,pdfFileUrl&limit=1`,
        { headers: HEADERS, cache: "no-store" }
      ),
      fetch(
        `${BASE}/shop_product_variations?productId=eq.${id}&select=id,name,attributes,price,stock,sku,isActive,sortOrder&order=sortOrder.asc`,
        { headers: HEADERS, cache: "no-store" }
      ),
      fetch(
        `${BASE}/shop_categories?select=id,title&isActive=eq.true&order=sortOrder.asc`,
        { headers: HEADERS, cache: "no-store" }
      ),
    ]);

    const prodData = await prodRes.json();
    product = Array.isArray(prodData) && prodData.length > 0 ? prodData[0] : null;

    const varData = await varRes.json();
    variations = Array.isArray(varData) ? varData : [];

    const catData = await catRes.json();
    categories = Array.isArray(catData) ? catData : [];
  } catch {
    // DB unavailable
  }

  if (!product) notFound();

  // Map variations into form shape
  const mappedVariations = variations.map((v, i) => ({
    _key: `${v.id ?? i}`,
    id: v.id as string | undefined,
    name: (v.name as string) ?? "",
    tamanho: ((v.attributes as Record<string, string>)?.tamanho) ?? "",
    cor: ((v.attributes as Record<string, string>)?.cor) ?? "",
    price: v.price != null ? String((v.price as number) / 100) : "",
    stock: (v.stock as number) ?? 0,
    sku: (v.sku as string) ?? "",
    isActive: (v.isActive as boolean) ?? true,
    sortOrder: (v.sortOrder as number) ?? i,
  }));

  const initial = {
    id: product.id as string,
    name: (product.name as string) ?? "",
    slug: (product.slug as string) ?? "",
    categoryId: (product.categoryId as string) ?? "",
    isActive: (product.isActive as boolean) ?? true,
    isFeatured: (product.isFeatured as boolean) ?? false,
    basePrice: product.basePrice != null ? String((product.basePrice as number) / 100) : "",
    hasVariations: (product.hasVariations as boolean) ?? false,
    stock: (product.stock as number) ?? 0,
    sku: (product.sku as string) ?? "",
    description: (product.description as string) ?? "",
    technicalSpecs: (product.technicalSpecs as string) ?? "",
    weight: (product.weight as number) ?? 0,
    dimensionWidth: product.dimensionWidth != null ? String(product.dimensionWidth) : "",
    dimensionHeight: product.dimensionHeight != null ? String(product.dimensionHeight) : "",
    dimensionLength: product.dimensionLength != null ? String(product.dimensionLength) : "",
    mainImageUrl: (product.mainImageUrl as string) ?? "",
    pdfFileUrl: (product.pdfFileUrl as string) ?? "",
    variations: mappedVariations,
  };

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
        <span className="text-[#d4d4da] text-[14px] truncate max-w-[240px]">{product.name as string}</span>
      </div>

      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
        Editar Produto
      </h1>
      <p className="text-[#7a9ab5] text-[14px] mb-6">{product.name as string}</p>
      <div className="bg-[#141d2c] h-px mb-6" />

      <ProductForm mode="edit" categories={categories} initial={initial} />
    </>
  );
}
