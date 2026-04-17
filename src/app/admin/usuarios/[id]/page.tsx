import Link from "next/link";

export const dynamic = "force-dynamic";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const H        = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

/* ── helpers ────────────────────────────────────────────────── */
function fmtDate(iso: string | null | undefined, full = false) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit", month: full ? "long" : "2-digit", year: "numeric",
    });
  } catch { return "—"; }
}
function fmtDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
}
function fmtBRL(cents: number | null | undefined) {
  if (!cents) return "—";
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function initials(name: string | null) {
  if (!name) return "??";
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

/* ── interfaces ─────────────────────────────────────────────── */
interface UserRow {
  id: string; name: string | null; email: string | null; phone: string | null;
  role: string | null; avatarUrl: string | null; cpf: string | null;
  socialInstagram: string | null; socialFacebook: string | null;
  socialYoutube: string | null; socialTiktok: string | null;
  addressStreet: string | null; addressNumber: string | null;
  addressNeighborhood: string | null; addressCity: string | null;
  addressState: string | null; addressZip: string | null;
  createdAt: string | null;
}
interface PlanRow  { name: string; }
interface SubRow   {
  id: string; status: string; planPriceInCents: number; intervalMonths: number;
  subscribedAt: string | null; currentPeriodEnd: string | null; canceledAt: string | null;
  subscription_plans: PlanRow | PlanRow[] | null;
}
interface OrderRow { id: string; orderNumber: string; status: string; total: number; createdAt: string; }
interface CompanyRow { id: string; tradeName: string; pipelineStatus: string; listingType: string; }
interface LogRow   { id: string; ipAddress: string | null; userAgent: string | null; createdAt: string; }

/* ── status configs ─────────────────────────────────────────── */
const SUB_STATUS: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  ACTIVE:   { label: "Ativo",      dot: "bg-[#22c55e]", bg: "bg-[#0f381f]", text: "text-[#22c55e]" },
  PAST_DUE: { label: "Atrasado",   dot: "bg-[#ef9f1b]", bg: "bg-[#382405]", text: "text-[#ef9f1b]" },
  CANCELED: { label: "Cancelado",  dot: "bg-[#526888]", bg: "bg-[#141d2c]", text: "text-[#526888]" },
  PENDING:  { label: "Pendente",   dot: "bg-[#ef9f1b]", bg: "bg-[#382405]", text: "text-[#ef9f1b]" },
  EXPIRED:  { label: "Expirado",   dot: "bg-[#526888]", bg: "bg-[#141d2c]", text: "text-[#526888]" },
};
const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  PENDING:    { label: "Aguardando",  color: "text-[#ef9f1b]" },
  PAID:       { label: "Pago",        color: "text-[#22c55e]" },
  PROCESSING: { label: "Processando", color: "text-[#60a5fa]" },
  SHIPPED:    { label: "Enviado",     color: "text-[#60a5fa]" },
  DELIVERED:  { label: "Entregue",    color: "text-[#22c55e]" },
  CANCELED:   { label: "Cancelado",   color: "text-[#526888]" },
  REFUNDED:   { label: "Reembolsado", color: "text-[#ef9f1b]" },
};
const PLAN_CFG: Record<string, { label: string; color: string }> = {
  NONE:     { label: "Sem plano", color: "bg-[#141d2c] text-[#526888]"  },
  FREE:     { label: "Free",      color: "bg-[#141d2c] text-[#526888]"  },
  PREMIUM:  { label: "Premium",   color: "bg-[#1a1a40] text-[#818cf8]"  },
  DESTAQUE: { label: "Destaque",  color: "bg-[#260a0a] text-[#ff1f1f]"  },
};

/* ── page ───────────────────────────────────────────────────── */
export default async function AdminUserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let user: UserRow | null = null;
  let subs: SubRow[]       = [];
  let orders: OrderRow[]   = [];
  let companies: CompanyRow[] = [];
  let logs: LogRow[]       = [];

  try {
    const [uRes, sRes, oRes, cRes, lRes] = await Promise.all([
      fetch(`${BASE}/users?id=eq.${id}&select=*&limit=1`, { headers: H, cache: "no-store" }),
      fetch(`${BASE}/subscriptions?userId=eq.${id}&select=id,status,planPriceInCents,intervalMonths,subscribedAt,currentPeriodEnd,canceledAt,subscription_plans(name)&order=createdAt.desc`, { headers: H, cache: "no-store" }),
      fetch(`${BASE}/shop_orders?userId=eq.${id}&select=id,orderNumber,status,total,createdAt&order=createdAt.desc&limit=5`, { headers: H, cache: "no-store" }),
      fetch(`${BASE}/companies?userId=eq.${id}&select=id,tradeName,pipelineStatus,listingType`, { headers: H, cache: "no-store" }),
      fetch(`${BASE}/user_access_logs?userId=eq.${id}&select=id,ipAddress,userAgent,createdAt&order=createdAt.desc&limit=10`, { headers: H, cache: "no-store" }),
    ]);
    const [uData, sData, oData, cData, lData] = await Promise.all([
      uRes.json(), sRes.json(), oRes.json(), cRes.json(), lRes.json(),
    ]);
    user      = Array.isArray(uData) ? uData[0] ?? null : null;
    subs      = Array.isArray(sData) ? sData : [];
    orders    = Array.isArray(oData) ? oData : [];
    companies = Array.isArray(cData) ? cData : [];
    logs      = Array.isArray(lData) ? lData : [];
  } catch { /* DB unavailable */ }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-[#526888] text-[15px]">Usuário não encontrado.</p>
        <Link href="/admin/usuarios" className="text-[#ff1f1f] text-[14px] hover:underline">← Voltar</Link>
      </div>
    );
  }

  const activeSub    = subs.find(s => s.status === "ACTIVE");
  const hasActiveSub = !!activeSub;
  const hasCompany   = companies.length > 0;
  const hasOrder     = orders.length > 0;
  const ini          = initials(user.name);

  const fullAddress = [
    user.addressStreet && user.addressNumber
      ? `${user.addressStreet}, ${user.addressNumber}`
      : user.addressStreet,
    user.addressNeighborhood,
    user.addressCity && user.addressState
      ? `${user.addressCity} — ${user.addressState}`
      : user.addressCity ?? user.addressState,
    user.addressZip,
  ].filter(Boolean).join(", ");

  return (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-[13px]">
        <Link href="/admin/usuarios" className="text-[#7a9ab5] hover:text-white transition-colors">← Usuários</Link>
        <span className="text-[#1c2a3e]">/</span>
        <span className="text-[#526888] truncate max-w-[280px]">{user.name ?? user.email ?? id}</span>
      </div>

      <div className="flex gap-5 items-start flex-col lg:flex-row">

        {/* ══ SIDEBAR ══════════════════════════════════════════════ */}
        <aside className="w-full lg:w-[260px] shrink-0 space-y-4">

          {/* Avatar + nome */}
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-5 flex flex-col items-center text-center">
            <div className="w-[72px] h-[72px] rounded-full bg-[#141d2c] border-2 border-[#1c2a3e] flex items-center justify-center mb-3 overflow-hidden shrink-0">
              {user.avatarUrl
                ? /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={user.avatarUrl} alt={user.name ?? ""} className="w-full h-full object-cover" />
                : <span className="text-[24px] font-bold text-[#7a9ab5] font-['Barlow_Condensed']">{ini}</span>
              }
            </div>
            <h1 className="text-white font-semibold text-[15px] leading-snug mb-0.5">{user.name ?? "Sem nome"}</h1>
            <p className="text-[#526888] text-[12px] break-all">{user.email ?? "—"}</p>
            {user.role && (
              <span className="mt-2 inline-flex items-center h-[20px] px-2.5 rounded-full text-[10px] font-bold bg-[#1a1a40] text-[#818cf8]">
                {user.role}
              </span>
            )}
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 justify-center mt-3">
              {hasActiveSub && (
                <span className="inline-flex items-center h-[20px] px-2 rounded-full text-[10px] font-bold bg-[#0f381f] text-[#22c55e]">✓ Assinante</span>
              )}
              {hasCompany && (
                <span className="inline-flex items-center h-[20px] px-2 rounded-full text-[10px] font-bold bg-[#1a0f38] text-[#a78bfa]">Anunciante</span>
              )}
              {hasOrder && (
                <span className="inline-flex items-center h-[20px] px-2 rounded-full text-[10px] font-bold bg-[#0f2438] text-[#60a5fa]">Cliente Loja</span>
              )}
              {!hasActiveSub && !hasCompany && !hasOrder && (
                <span className="inline-flex items-center h-[20px] px-2 rounded-full text-[10px] font-semibold bg-[#141d2c] text-[#526888]">Cadastrado</span>
              )}
            </div>
          </div>

          {/* Detalhes */}
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-4 space-y-3">
            <p className="text-[#ff1f1f] text-[10px] font-bold tracking-[1.5px] uppercase">Detalhes</p>
            {user.cpf && (
              <div>
                <p className="text-[#526888] text-[10px] uppercase tracking-[0.8px] mb-0.5">CPF</p>
                <p className="text-[#d4d4da] text-[13px]">{user.cpf}</p>
              </div>
            )}
            {user.phone && (
              <div>
                <p className="text-[#526888] text-[10px] uppercase tracking-[0.8px] mb-0.5">Telefone</p>
                <p className="text-[#d4d4da] text-[13px]">{user.phone}</p>
              </div>
            )}
            {fullAddress && (
              <div>
                <p className="text-[#526888] text-[10px] uppercase tracking-[0.8px] mb-0.5">Endereço</p>
                <p className="text-[#d4d4da] text-[12px] leading-snug">{fullAddress}</p>
              </div>
            )}
            <div>
              <p className="text-[#526888] text-[10px] uppercase tracking-[0.8px] mb-0.5">Membro desde</p>
              <p className="text-[#d4d4da] text-[13px]">{fmtDate(user.createdAt, true)}</p>
            </div>
          </div>

          {/* Redes sociais */}
          {(user.socialInstagram || user.socialFacebook || user.socialYoutube || user.socialTiktok) && (
            <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-4 space-y-2.5">
              <p className="text-[#ff1f1f] text-[10px] font-bold tracking-[1.5px] uppercase mb-1">Redes Sociais</p>
              {user.socialInstagram && (
                <a href={`https://instagram.com/${user.socialInstagram.replace("@","")}`} target="_blank" rel="noopener"
                  className="flex items-center gap-2 text-[#7a9ab5] hover:text-white text-[12px] transition-colors">
                  <span>📷</span> @{user.socialInstagram.replace("@","")}
                </a>
              )}
              {user.socialFacebook && (
                <div className="flex items-center gap-2 text-[#7a9ab5] text-[12px]"><span>🔵</span> {user.socialFacebook}</div>
              )}
              {user.socialYoutube && (
                <div className="flex items-center gap-2 text-[#7a9ab5] text-[12px]"><span>▶️</span> {user.socialYoutube}</div>
              )}
              {user.socialTiktok && (
                <div className="flex items-center gap-2 text-[#7a9ab5] text-[12px]"><span>🎵</span> @{user.socialTiktok.replace("@","")}</div>
              )}
            </div>
          )}
        </aside>

        {/* ══ CONTEÚDO PRINCIPAL ═══════════════════════════════════ */}
        <main className="flex-1 min-w-0 space-y-4">

          {/* Stats rápidos */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Assinaturas", value: subs.length,      color: "text-[#22c55e]" },
              { label: "Pedidos",     value: orders.length,    color: "text-[#60a5fa]" },
              { label: "Empresas",    value: companies.length, color: "text-[#a78bfa]" },
            ].map(s => (
              <div key={s.label} className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] p-4">
                <p className={`font-['Barlow_Condensed'] font-bold text-[32px] leading-none ${s.color}`}>{s.value}</p>
                <p className="text-[#526888] text-[12px] mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Assinatura ── */}
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
            <div className="bg-[#0a0e18] border-b border-[#141d2c] px-5 py-3 flex items-center justify-between">
              <h2 className="text-white text-[13px] font-semibold">Assinatura</h2>
              {hasActiveSub && (
                <span className="text-[#22c55e] text-[11px] font-semibold">● Ativa</span>
              )}
            </div>
            <div className="px-5 py-4">
              {subs.length === 0 ? (
                <p className="text-[#526888] text-[13px]">Nenhuma assinatura encontrada.</p>
              ) : (
                <div className="divide-y divide-[#141d2c]">
                  {subs.map(sub => {
                    const cfg  = SUB_STATUS[sub.status] ?? SUB_STATUS.EXPIRED;
                    const plan = Array.isArray(sub.subscription_plans) ? sub.subscription_plans[0] : sub.subscription_plans;
                    return (
                      <div key={sub.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />
                          <div>
                            <p className="text-[#d4d4da] text-[13px] font-semibold">
                              {plan?.name ?? "Plano desconhecido"}
                            </p>
                            <p className="text-[#526888] text-[11px] mt-0.5">
                              {fmtBRL(sub.planPriceInCents)} / {sub.intervalMonths === 1 ? "mês" : `${sub.intervalMonths} meses`}
                              {sub.subscribedAt && ` · Desde ${fmtDate(sub.subscribedAt)}`}
                            </p>
                            {sub.currentPeriodEnd && sub.status === "ACTIVE" && (
                              <p className="text-[#526888] text-[11px]">Renova em {fmtDate(sub.currentPeriodEnd)}</p>
                            )}
                            {sub.canceledAt && (
                              <p className="text-[#526888] text-[11px]">Cancelada em {fmtDate(sub.canceledAt)}</p>
                            )}
                          </div>
                        </div>
                        <span className={`inline-flex items-center h-[20px] px-2.5 rounded-full text-[10px] font-bold shrink-0 ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Pedidos recentes ── */}
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
            <div className="bg-[#0a0e18] border-b border-[#141d2c] px-5 py-3">
              <h2 className="text-white text-[13px] font-semibold">Pedidos Recentes</h2>
            </div>
            <div className="px-5 py-4">
              {orders.length === 0 ? (
                <p className="text-[#526888] text-[13px]">Nenhum pedido encontrado.</p>
              ) : (
                <div className="divide-y divide-[#141d2c]">
                  {orders.map(order => {
                    const st = ORDER_STATUS[order.status] ?? { label: order.status, color: "text-[#526888]" };
                    return (
                      <div key={order.id} className="flex items-center justify-between py-2.5 gap-3 first:pt-0 last:pb-0">
                        <div className="min-w-0">
                          <p className="text-[#d4d4da] text-[13px] font-semibold font-mono">{order.orderNumber}</p>
                          <p className="text-[#526888] text-[11px]">{fmtDate(order.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <p className="text-[#d4d4da] text-[13px] font-semibold tabular-nums">{fmtBRL(order.total)}</p>
                          <span className={`text-[11px] font-semibold ${st.color}`}>{st.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Empresas vinculadas ── */}
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
            <div className="bg-[#0a0e18] border-b border-[#141d2c] px-5 py-3">
              <h2 className="text-white text-[13px] font-semibold">Empresas Vinculadas</h2>
            </div>
            <div className="px-5 py-4">
              {companies.length === 0 ? (
                <p className="text-[#526888] text-[13px]">Nenhuma empresa vinculada.</p>
              ) : (
                <div className="divide-y divide-[#141d2c]">
                  {companies.map(co => {
                    const lt = PLAN_CFG[co.listingType] ?? PLAN_CFG.NONE;
                    return (
                      <div key={co.id} className="flex items-center justify-between py-2.5 gap-3 first:pt-0 last:pb-0">
                        <div className="min-w-0">
                          <p className="text-[#d4d4da] text-[13px] font-semibold truncate">{co.tradeName}</p>
                          <p className="text-[#526888] text-[11px]">Pipeline: {co.pipelineStatus}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`inline-flex items-center h-[18px] px-2 rounded-[2px] text-[10px] font-bold ${lt.color}`}>
                            {lt.label}
                          </span>
                          <Link href={`/admin/guia/${co.id}`} className="text-[#526888] hover:text-white text-[11px] transition-colors">
                            Ver →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Log de acessos ── */}
          <div className="bg-[#0e1520] border border-[#141d2c] rounded-[10px] overflow-hidden">
            <div className="bg-[#0a0e18] border-b border-[#141d2c] px-5 py-3">
              <h2 className="text-white text-[13px] font-semibold">Log de Acessos</h2>
            </div>
            <div className="px-5 py-4">
              {logs.length === 0 ? (
                <p className="text-[#526888] text-[13px]">Nenhum acesso registrado ainda. O log é preenchido automaticamente quando o usuário visita o site.</p>
              ) : (
                <div className="divide-y divide-[#141d2c]">
                  {logs.map((log, i) => (
                    <div key={log.id} className="flex items-start justify-between py-2.5 gap-3 first:pt-0 last:pb-0">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <span className={`mt-0.5 text-[10px] font-bold px-1.5 rounded ${i === 0 ? "bg-[#0f381f] text-[#22c55e]" : "bg-[#141d2c] text-[#2a3a4e]"}`}>
                          {i === 0 ? "ÚLTIMO" : `#${logs.length - i}`}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[#526888] text-[11px] truncate" title={log.userAgent ?? ""}>
                            {log.userAgent ? (log.userAgent.length > 55 ? log.userAgent.slice(0, 55) + "…" : log.userAgent) : "—"}
                          </p>
                          {log.ipAddress && (
                            <p className="text-[#2a3a4e] text-[10px] font-mono mt-0.5">{log.ipAddress}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-[#526888] text-[11px] shrink-0 tabular-nums whitespace-nowrap">
                        {fmtDateTime(log.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </>
  );
}
