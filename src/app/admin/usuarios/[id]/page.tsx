import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = {
  apikey:        SERVICE,
  Authorization: `Bearer ${SERVICE}`,
  "Content-Type": "application/json",
};

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day:   "2-digit",
    month: "2-digit",
    year:  "numeric",
  });
}
function fmtCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface SubPlan { name: string; intervalMonths: number; priceInCents: number; }
interface Subscription {
  id: string;
  status: string;
  planPriceInCents: number;
  subscribedAt: string;
  currentPeriodEnd: string | null;
  subscription_plans: SubPlan | null;
}
interface Company {
  id: string;
  tradeName: string;
  listingType: string;
  pipelineStatus: string;
  createdAt: string;
}
interface ShopOrder {
  id: string;
  orderNumber: string | null;
  status: string;
  total: number | null;
  createdAt: string;
}
interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string | null;
  roles: string[] | null;
  cpf: string | null;
  createdAt: string;
  addressStreet: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  addressNeighborhood: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressZip: string | null;
  socialInstagram: string | null;
  socialFacebook: string | null;
  socialYoutube: string | null;
  socialTiktok: string | null;
}

const SUB_STATUS: Record<string, { bg: string; text: string; label: string }> = {
  ACTIVE:   { bg: "bg-[#0f381f]", text: "text-[#22c55e]", label: "ATIVO"      },
  PAST_DUE: { bg: "bg-[#382405]", text: "text-[#ef9f1b]", label: "ATRASADO"   },
  CANCELED: { bg: "bg-[#141d2c]", text: "text-white",     label: "CANCELADO"  },
  PENDING:  { bg: "bg-[#382405]", text: "text-[#ef9f1b]", label: "PENDENTE"   },
  EXPIRED:  { bg: "bg-[#141d2c]", text: "text-white",     label: "EXPIRADO"   },
};

const PIPELINE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  REGISTERED:     { bg: "bg-[#141d2c]", text: "text-[#7a9ab5]", label: "Cadastrado"       },
  EMAIL_VERIFIED: { bg: "bg-[#0f2438]", text: "text-[#60a5fa]", label: "E-mail Validado"  },
  COMPLETE:       { bg: "bg-[#1a1f0f]", text: "text-[#a3e635]", label: "Completo"          },
  ACTIVE:         { bg: "bg-[#0f381f]", text: "text-[#22c55e]", label: "Ativo"             },
  SUSPENDED:      { bg: "bg-[#380f0f]", text: "text-[#f87171]", label: "Suspenso"          },
};

const LISTING_STYLE: Record<string, { bg: string; text: string }> = {
  NONE:      { bg: "bg-[#141d2c]", text: "text-[#526888]" },
  FREE:      { bg: "bg-[#141d2c]", text: "text-[#7a9ab5]" },
  PREMIUM:   { bg: "bg-[#1a1438]", text: "text-[#c084fc]" },
  DESTAQUE:  { bg: "bg-[#38280f]", text: "text-[#fbbf24]" },
};

export default async function AdminUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Busca paralela de todas as entidades
  const [userRes, subsRes, companiesRes] = await Promise.all([
    fetch(`${BASE}/users?id=eq.${id}&select=*`, { headers: HEADERS, cache: "no-store" }),
    fetch(`${BASE}/subscriptions?userId=eq.${id}&select=*,subscription_plans(name,intervalMonths,priceInCents)&order=subscribedAt.desc`, { headers: HEADERS, cache: "no-store" }),
    fetch(`${BASE}/companies?userId=eq.${id}&select=id,tradeName,listingType,pipelineStatus,createdAt&order=createdAt.desc`, { headers: HEADERS, cache: "no-store" }),
  ]);

  const userData: UserData[] = await userRes.json().catch(() => []);
  const user = userData[0];
  if (!user) notFound();

  const subscriptions: Subscription[] = await subsRes.json().catch(() => []);
  const companies: Company[]          = await companiesRes.json().catch(() => []);

  let shopOrders: ShopOrder[] = [];
  try {
    const ordRes = await fetch(
      `${BASE}/shop_orders?userId=eq.${id}&select=id,orderNumber,status,total,createdAt&order=createdAt.desc&limit=5`,
      { headers: HEADERS, cache: "no-store" }
    );
    const ordData = await ordRes.json();
    shopOrders = Array.isArray(ordData) ? ordData : [];
  } catch {
    // shop_orders may not have userId column yet
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/usuarios"
          className="text-[#7a9ab5] hover:text-white text-[13px] transition-colors"
        >
          ← Usuários
        </Link>
        <div className="bg-[#141d2c] w-px h-4" />
        <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none">
          {user.name}
        </h1>
      </div>

      <div className="bg-[#141d2c] h-px mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5">
        {/* Coluna esquerda */}
        <div className="flex flex-col gap-5">
          {/* Dados pessoais */}
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
            <p className="text-[#ff1f1f] text-[10px] font-bold tracking-[1.5px] uppercase mb-4">
              Dados Pessoais
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <Field label="Nome"     value={user.name} />
              <Field label="E-mail"   value={user.email} />
              <Field label="Telefone" value={user.phone} />
              <Field label="CPF"      value={user.cpf} />
              <Field label="Role"     value={user.role} />
              {user.roles && user.roles.length > 0 && (
                <div>
                  <p className="text-[#526888] text-[10px] font-semibold uppercase tracking-[0.8px] mb-1">Roles</p>
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((r) => (
                      <span key={r} className="inline-flex items-center h-[18px] px-2 rounded-full text-[10px] font-bold bg-[#141d2c] text-[#7a9ab5]">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <Field label="Cadastro" value={fmtDate(user.createdAt)} />
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
            <p className="text-[#ff1f1f] text-[10px] font-bold tracking-[1.5px] uppercase mb-4">
              Endereço
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <Field label="Logradouro"   value={user.addressStreet} />
              <Field label="Número"       value={user.addressNumber} />
              <Field label="Complemento" value={user.addressComplement} />
              <Field label="Bairro"       value={user.addressNeighborhood} />
              <Field label="Cidade"       value={user.addressCity} />
              <Field label="Estado"       value={user.addressState} />
              <Field label="CEP"          value={user.addressZip} />
            </div>
          </div>

          {/* Redes sociais */}
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
            <p className="text-[#ff1f1f] text-[10px] font-bold tracking-[1.5px] uppercase mb-4">
              Redes Sociais
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <Field label="Instagram" value={user.socialInstagram} />
              <Field label="Facebook"  value={user.socialFacebook} />
              <Field label="YouTube"   value={user.socialYoutube} />
              <Field label="TikTok"    value={user.socialTiktok} />
            </div>
          </div>
        </div>

        {/* Coluna direita */}
        <div className="flex flex-col gap-5">
          {/* Assinaturas */}
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
            <p className="text-[#ff1f1f] text-[10px] font-bold tracking-[1.5px] uppercase mb-4">
              Assinaturas
            </p>
            {subscriptions.length === 0 ? (
              <p className="text-[#526888] text-[13px]">Nenhuma assinatura.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {subscriptions.map((s) => {
                  const st = SUB_STATUS[s.status] ?? SUB_STATUS.EXPIRED;
                  return (
                    <div key={s.id} className="flex items-center justify-between py-2.5 border-b border-[#141d2c] last:border-0">
                      <div>
                        <p className="text-[#d4d4da] text-[13px] font-medium">
                          {(s.subscription_plans as SubPlan | null)?.name ?? "Plano desconhecido"}
                        </p>
                        <p className="text-[#526888] text-[11px]">
                          Desde {fmtDate(s.subscribedAt)}
                          {s.currentPeriodEnd ? ` · até ${fmtDate(s.currentPeriodEnd)}` : ""}
                        </p>
                      </div>
                      <span className={`inline-flex items-center h-[20px] px-2.5 rounded-full text-[10px] font-bold ${st.bg} ${st.text}`}>
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Empresas */}
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
            <p className="text-[#ff1f1f] text-[10px] font-bold tracking-[1.5px] uppercase mb-4">
              Empresas
            </p>
            {companies.length === 0 ? (
              <p className="text-[#526888] text-[13px]">Nenhuma empresa.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {companies.map((c) => {
                  const ps = PIPELINE_STYLE[c.pipelineStatus] ?? PIPELINE_STYLE.REGISTERED;
                  const ls = LISTING_STYLE[c.listingType]     ?? LISTING_STYLE.NONE;
                  return (
                    <div key={c.id} className="flex items-center justify-between py-2.5 border-b border-[#141d2c] last:border-0">
                      <div>
                        <Link
                          href={`/admin/anunciantes/${c.id}`}
                          className="text-[#d4d4da] text-[13px] font-medium hover:text-white transition-colors"
                        >
                          {c.tradeName}
                        </Link>
                        <p className="text-[#526888] text-[11px]">Desde {fmtDate(c.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center h-[18px] px-2 rounded-full text-[10px] font-bold ${ls.bg} ${ls.text}`}>
                          {c.listingType}
                        </span>
                        <span className={`inline-flex items-center h-[18px] px-2 rounded-full text-[10px] font-bold ${ps.bg} ${ps.text}`}>
                          {ps.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pedidos Loja */}
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5">
            <p className="text-[#ff1f1f] text-[10px] font-bold tracking-[1.5px] uppercase mb-4">
              Pedidos Loja
            </p>
            {shopOrders.length === 0 ? (
              <p className="text-[#526888] text-[13px]">Nenhum pedido.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {shopOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between py-2.5 border-b border-[#141d2c] last:border-0">
                    <div>
                      <p className="text-[#d4d4da] text-[13px] font-medium">
                        {o.orderNumber ? `#${o.orderNumber}` : o.id.slice(0, 8)}
                      </p>
                      <p className="text-[#526888] text-[11px]">{fmtDate(o.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center h-[18px] px-2 rounded-full text-[10px] font-bold bg-[#141d2c] text-[#7a9ab5]">
                        {o.status}
                      </span>
                      {o.total != null && (
                        <p className="text-[#d4d4da] text-[13px]">{fmtCurrency(o.total)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[#526888] text-[10px] font-semibold uppercase tracking-[0.8px] mb-0.5">{label}</p>
      <p className="text-[#d4d4da] text-[13px]">{value ?? "—"}</p>
    </div>
  );
}
