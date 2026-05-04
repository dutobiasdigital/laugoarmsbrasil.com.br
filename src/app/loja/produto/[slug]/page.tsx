import { redirect } from "next/navigation";

export default async function LojaProductRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/catalogo/produto/${slug}`);
}
