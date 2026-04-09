import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BlogArtigoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post: {
    id: string; title: string; slug: string; excerpt: string | null;
    content: string; featureImageUrl: string | null;
    publishedAt: Date | null; isExclusive: boolean;
    authorName: string; category: { name: string };
  } | null = null;

  let isSubscriber = false;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const profile = await prisma.user.findUnique({
        where: { authId: user.id },
        select: { role: true, subscription: { select: { status: true } } },
      });
      isSubscriber = profile?.role === "ADMIN" || profile?.subscription?.status === "ACTIVE";
    }

    post = await prisma.article.findUnique({
      where: { slug, status: "PUBLISHED" },
      select: {
        id: true, title: true, slug: true, excerpt: true, content: true,
        featureImageUrl: true, publishedAt: true, isExclusive: true,
        authorName: true, category: { select: { name: true } },
      },
    });
  } catch {
    // DB unavailable
  }

  if (!post) notFound();

  const canRead = isSubscriber || !post.isExclusive;

  const tocItems = [
    "Introdução",
    "Detalhes técnicos",
    "Análise de desempenho",
    "Conclusão",
  ];

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Breadcrumb */}
        <div className="px-5 lg:px-20 pt-7 pb-2">
          <Link href="/blog" className="text-[#a1a1aa] hover:text-white text-[14px] transition-colors">
            ← Blog
          </Link>
        </div>

        {/* Article Header */}
        <div className="px-5 lg:px-20 pt-4 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-[#27272a] border border-[#3f3f46] text-[#a1a1aa] text-[11px] px-2.5 py-[3px] rounded-full">
              {post.category.name}
            </span>
            {post.isExclusive && (
              <span className="bg-[#ff1f1f] text-white text-[10px] font-semibold px-2.5 py-[3px] rounded-full uppercase">
                Exclusivo
              </span>
            )}
          </div>

          <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[38px] lg:text-[52px] leading-[42px] lg:leading-[56px] max-w-[860px] mb-4">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-[#d4d4da] text-[16px] lg:text-[18px] leading-[28px] max-w-[860px] mb-4">
              {post.excerpt}
            </p>
          )}

          <div className="bg-[#27272a] h-px max-w-[860px] mb-4" />
          <p className="text-[#d4d4da] text-[14px] font-medium mb-1">{post.authorName}</p>
          <p className="text-[#52525b] text-[13px] mb-4">
            {post.publishedAt?.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <div className="bg-[#27272a] h-px max-w-[860px]" />
        </div>

        {/* Content + Sidebar */}
        <div className="px-5 lg:px-20 pb-16 flex gap-10 items-start">
          {/* Article Body */}
          <div className="flex-1 min-w-0 max-w-[860px]">
            {/* Featured Image */}
            <div className="bg-[#27272a] rounded-[8px] h-[260px] lg:h-[420px] flex items-center justify-center mb-8 overflow-hidden">
              {post.featureImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.featureImageUrl} alt={post.title} className="w-full h-full object-cover rounded-[8px]" />
              ) : (
                <p className="text-[#3f3f46] text-[13px] font-mono">Imagem do artigo</p>
              )}
            </div>

            {/* Content */}
            {canRead ? (
              <div
                className="text-[#d4d4da] text-[17px] leading-[28px] [&>h2]:font-['Barlow_Condensed'] [&>h2]:font-bold [&>h2]:text-white [&>h2]:text-[30px] [&>h2]:mt-8 [&>h2]:mb-3 [&>p]:mb-4"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : (
              <>
                <p className="text-[#d4d4da] text-[17px] leading-[28px] mb-4">
                  {post.excerpt ?? "Leia o artigo completo com uma assinatura Magnum."}
                </p>
                <div className="h-[160px] bg-gradient-to-b from-transparent to-[#09090b] -mt-20 relative z-10" />
                <div className="bg-[#18181b] border-2 border-[#ff1f1f] rounded-xl p-6 lg:p-8 flex flex-col gap-4 mt-4">
                  <div className="text-[32px]">🔒</div>
                  <h2 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] lg:text-[36px] leading-none">
                    Conteúdo exclusivo para assinantes
                  </h2>
                  <p className="text-[#d4d4da] text-[16px] leading-[24px]">
                    Este artigo é exclusivo para assinantes Magnum. Assine e acesse este e muitos outros artigos.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <Link href="/assine" className="bg-[#ff1f1f] hover:bg-[#cc0000] text-white text-[16px] font-semibold h-[52px] px-6 flex items-center justify-center rounded-[8px] transition-colors">
                      Assinar agora →
                    </Link>
                    <Link href="/auth/login" className="bg-[#09090b] border border-[#3f3f46] hover:border-zinc-500 text-[#d4d4da] text-[14px] font-medium h-[52px] px-6 flex items-center justify-center rounded-[8px] transition-colors">
                      Já sou assinante
                    </Link>
                  </div>
                  <p className="text-[#52525b] text-[13px]">R$ 29,90/trimestre · Cancele quando quiser</p>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col gap-5 w-[360px] shrink-0 sticky top-20">
            {/* TOC */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-[10px] p-5">
              <p className="text-[#52525b] text-[11px] font-semibold tracking-[1px] uppercase mb-3">Neste Artigo</p>
              <div className="bg-[#27272a] h-px mb-3" />
              <ul className="flex flex-col gap-2">
                {tocItems.map((item, i) => (
                  <li key={i} className={`text-[13px] ${i === 0 ? "text-[#ff1f1f] font-medium" : "text-[#a1a1aa]"}`}>
                    {i + 1}. {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Share */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-[10px] p-5">
              <p className="text-[#a1a1aa] text-[13px] font-semibold mb-3">Compartilhar</p>
              <div className="flex gap-2">
                {["Twitter/X", "WhatsApp", "Copiar link"].map((s) => (
                  <button key={s} className="flex-1 bg-[#27272a] border border-[#3f3f46] hover:border-zinc-500 text-[#a1a1aa] hover:text-white text-[11px] h-[36px] rounded-[6px] transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
