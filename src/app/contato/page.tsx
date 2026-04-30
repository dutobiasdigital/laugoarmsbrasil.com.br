import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "./ContactForm";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

async function getEmpresaSettings(): Promise<Record<string, string>> {
  if (!PROJECT) return {};
  try {
    const res = await fetch(
      `https://${PROJECT}.supabase.co/rest/v1/site_settings?select=key,value`,
      { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, cache: "no-store" }
    );
    const rows: { key: string; value: string | null }[] = await res.json();
    if (!Array.isArray(rows)) return {};
    const obj: Record<string, string> = {};
    for (const r of rows) if (r.value) obj[r.key] = r.value;
    return obj;
  } catch { return {}; }
}

export async function generateMetadata() {
  return {
    title: "Contato — Laúgo Arms Brasil",
    description: "Entre em contato com a equipe da Laúgo Arms Brasil.",
  };
}

export default async function ContatoPage() {
  const cfg = await getEmpresaSettings();

  const emailGeral     = cfg["empresa.email_geral"]     || "contato@laugoarmsbrasil.com.br";
  const emailComercial = cfg["empresa.email_comercial"]  || "";
  const emailSuporte   = cfg["empresa.email_suporte"]    || "";
  const telefone       = cfg["empresa.telefone"]         || "";
  const horario        = cfg["empresa.horario_atendimento"] || "Seg–Sex, 9h às 18h";
  const endereco       = cfg["empresa.endereco"]         || "";
  const cidade         = cfg["empresa.cidade"]           || "";
  const estado         = cfg["empresa.estado"]           || "";
  const cep            = cfg["empresa.cep"]              || "";

  const enderecoCompleto = [endereco, cidade && estado ? `${cidade} — ${estado}` : cidade || estado, cep]
    .filter(Boolean)
    .join(", ");

  const contacts = [
    emailGeral     && { icon: "✉",  label: "E-mail geral",  value: emailGeral,     href: `mailto:${emailGeral}` },
    emailComercial && { icon: "📢", label: "Comercial",     value: emailComercial, href: `mailto:${emailComercial}` },
    emailSuporte   && { icon: "🛠", label: "Suporte",       value: emailSuporte,   href: `mailto:${emailSuporte}` },
    telefone       && { icon: "📞", label: "Telefone",      value: telefone,       href: `tel:${telefone.replace(/\D/g, "")}` },
  ].filter(Boolean) as { icon: string; label: string; value: string; href: string }[];

  if (contacts.length === 0) {
    contacts.push({ icon: "✉", label: "E-mail geral", value: emailGeral, href: `mailto:${emailGeral}` });
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero strip */}
        <div className="hero-metal border-b border-[#26262C]">
          <div className="max-w-[1200px] mx-auto px-5 lg:px-20 py-14">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-[6px] h-[6px] bg-[#CB0A0E] rounded-full animate-pulse" />
              <span className="text-[#CB0A0E] text-[11px] font-semibold tracking-[1.5px] uppercase">
                Fale conosco
              </span>
            </div>
            <h1 className="font-['Archivo'] font-bold text-white text-[48px] lg:text-[64px] leading-[0.95] mb-3 uppercase">
              Contato
            </h1>
            <p className="text-[#8A8A95] text-[16px] max-w-[520px]">
              Estamos aqui para ajudar. Escolha o canal mais adequado para a sua mensagem.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[1200px] mx-auto px-5 lg:px-20 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left — form */}
            <div>
              <h2 className="font-['Archivo'] font-bold text-white text-[28px] leading-none mb-6 uppercase">
                Envie uma mensagem
              </h2>
              <ContactForm />
            </div>

            {/* Right — channels */}
            <div className="flex flex-col gap-4">
              <p className="font-['Archivo'] font-bold text-white text-[28px] leading-none mb-2 uppercase">
                Canais de atendimento
              </p>

              {contacts.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  className="bg-[#16161A] border border-[#26262C] hover:border-[#3A3A42] rounded-[10px] p-5 flex items-center gap-4 transition-colors group"
                >
                  <div className="w-[44px] h-[44px] bg-[#1C1C21] rounded-[8px] flex items-center justify-center text-[20px] shrink-0">
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-[#5C5C66] text-[11px] font-semibold tracking-[0.5px] uppercase mb-0.5">
                      {c.label}
                    </p>
                    <p className="text-[#B8B8C0] text-[14px] group-hover:text-white transition-colors">
                      {c.value}
                    </p>
                  </div>
                </a>
              ))}

              {/* Horário */}
              <div className="bg-[#16161A] border border-[#26262C] rounded-[10px] p-5 mt-1">
                <p className="text-[#5C5C66] text-[11px] font-semibold tracking-[0.5px] uppercase mb-3">
                  Horário de atendimento
                </p>
                <p className="text-[#B8B8C0] text-[14px]">{horario}</p>
              </div>

              {/* Endereço */}
              {enderecoCompleto && (
                <div className="bg-[#16161A] border border-[#26262C] rounded-[10px] p-5">
                  <p className="text-[#5C5C66] text-[11px] font-semibold tracking-[0.5px] uppercase mb-3">
                    Endereço
                  </p>
                  <p className="text-[#B8B8C0] text-[14px]">{enderecoCompleto}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
