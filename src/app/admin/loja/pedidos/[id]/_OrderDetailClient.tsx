"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const labelCls = "block text-[#7a9ab5] text-[12px] font-semibold mb-1";
const inputCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] placeholder-white/30 focus:outline-none focus:border-[#ff1f1f] w-full";
const selectCls =
  "bg-[#141d2c] border border-[#1c2a3e] rounded-[6px] h-[40px] px-3 text-[14px] text-[#d4d4da] focus:outline-none focus:border-[#ff1f1f] w-full";

const STATUS_COLORS: Record<string, string> = {
  PENDING:    "bg-amber-900/40 text-amber-400 border border-amber-800/50",
  PAID:       "bg-green-900/40 text-green-400 border border-green-800/50",
  DELIVERED:  "bg-green-900/40 text-green-400 border border-green-800/50",
  PROCESSING: "bg-blue-900/40 text-blue-400 border border-blue-800/50",
  SHIPPED:    "bg-blue-900/40 text-blue-400 border border-blue-800/50",
  CANCELLED:  "bg-red-900/40 text-red-400 border border-red-800/50",
  REFUNDED:   "bg-red-900/40 text-red-400 border border-red-800/50",
};

const STATUS_OPTIONS = [
  { value: "PENDING",    label: "Pendente" },
  { value: "PAID",       label: "Pago" },
  { value: "PROCESSING", label: "Em preparo" },
  { value: "SHIPPED",    label: "Enviado" },
  { value: "DELIVERED",  label: "Entregue" },
  { value: "CANCELLED",  label: "Cancelado" },
  { value: "REFUNDED",   label: "Reembolsado" },
];

const PAYMENT_LABELS: Record<string, string> = {
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD:  "Cartão de Débito",
  PIX:         "Pix",
  BOLETO:      "Boleto",
};

function fmtBRL(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 border-b border-[#1c2a3e] last:border-b-0">
      <span className="text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.4px]">{label}</span>
      <span className="text-[#d4d4da] text-[14px]">{value ?? "—"}</span>
    </div>
  );
}

interface OrderItem {
  productId?: string;
  productName: string;
  variationName?: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
}

interface ShippingAddress {
  name?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerDocument?: string;
  shippingAddress: ShippingAddress;
  shippingMethod?: string;
  shippingCost: number;
  shippingTrackingCode?: string;
  subtotal: number;
  discountAmount?: number;
  discount?: number;
  total: number;
  paymentGateway?: string;
  paymentMethod?: string;
  installments: number;
  gatewayPaymentId?: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderDetailClient({ order }: { order: Order }) {
  const router = useRouter();
  const [loading, setLoading]  = useState(false);
  const [error, setError]      = useState<string | null>(null);
  const [success, setSuccess]  = useState(false);

  const [status, setStatus]             = useState(order.status);
  const [trackingCode, setTrackingCode] = useState(order.shippingTrackingCode ?? "");

  const items: OrderItem[]       = order.items ?? [];
  const address: ShippingAddress = order.shippingAddress ?? {};

  async function handleSave() {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const res = await fetch("/api/admin/loja/pedidos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: order.id,
        status,
        shippingTrackingCode: trackingCode || null,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao atualizar pedido.");
    } else {
      setSuccess(true);
      router.refresh();
    }
    setLoading(false);
  }

  const currentStatusColor = STATUS_COLORS[status] ?? "bg-zinc-800 text-zinc-400";
  const currentStatusLabel = STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;

  return (
    <div className="max-w-[1000px]">
      {error && (
        <div className="bg-[#2d0a0a] border border-[#ff1f1f] rounded-[8px] px-4 py-3 mb-5 text-[#ff6b6b] text-[13px]">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-[#0a2d0a] border border-green-700 rounded-[8px] px-4 py-3 mb-5 text-green-400 text-[13px]">
          Pedido atualizado com sucesso.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Items */}
          <div className="bg-[#0d1520] border border-[#1c2a3e] rounded-[10px] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1c2a3e]">
              <h2 className="text-white font-semibold text-[15px]">Itens do Pedido</h2>
            </div>
            {items.length === 0 ? (
              <div className="px-5 py-6 text-[#7a9ab5] text-[13px]">Sem itens registrados.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#141d2c]">
                      <th className="text-left px-5 py-2.5 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px]">Produto</th>
                      <th className="text-center px-3 py-2.5 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px]">Qtd</th>
                      <th className="text-right px-5 py-2.5 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px]">Unit.</th>
                      <th className="text-right px-5 py-2.5 text-[#7a9ab5] text-[11px] font-semibold uppercase tracking-[0.5px]">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i} className="border-b border-[#141d2c] hover:bg-[#0a0f1a]">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                width={40}
                                height={40}
                                className="w-[40px] h-[40px] rounded-[4px] object-cover border border-[#1c2a3e]"
                              />
                            ) : (
                              <div className="w-[40px] h-[40px] rounded-[4px] bg-[#141d2c] border border-[#1c2a3e] flex items-center justify-center text-[14px]">
                                📦
                              </div>
                            )}
                            <div>
                              <div className="text-[#d4d4da] text-[13px] font-medium">{item.productName}</div>
                              {item.variationName && (
                                <div className="text-[#7a9ab5] text-[11px]">{item.variationName}</div>
                              )}
                              {item.sku && (
                                <div className="text-[#7a9ab5] text-[11px] font-mono">SKU: {item.sku}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center text-[#d4d4da] text-[13px]">{item.quantity}</td>
                        <td className="px-5 py-3 text-right text-[#7a9ab5] text-[13px]">{fmtBRL(item.unitPrice)}</td>
                        <td className="px-5 py-3 text-right text-[#d4d4da] text-[13px] font-medium">{fmtBRL(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totals */}
            <div className="px-5 py-4 border-t border-[#1c2a3e] space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#7a9ab5]">Subtotal</span>
                <span className="text-[#d4d4da]">{fmtBRL(order.subtotal ?? 0)}</span>
              </div>
              {(order.discountAmount ?? 0) > 0 && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#7a9ab5]">Desconto</span>
                  <span className="text-green-400">-{fmtBRL(order.discountAmount ?? 0)}</span>
                </div>
              )}
              <div className="flex justify-between text-[13px]">
                <span className="text-[#7a9ab5]">Frete</span>
                <span className="text-[#d4d4da]">{fmtBRL(order.shippingCost ?? 0)}</span>
              </div>
              <div className="flex justify-between text-[15px] font-semibold pt-2 border-t border-[#1c2a3e]">
                <span className="text-white">Total</span>
                <span className="text-white">{fmtBRL(order.total ?? 0)}</span>
              </div>
            </div>
          </div>

          {/* Payment info */}
          <div className="bg-[#0d1520] border border-[#1c2a3e] rounded-[10px] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1c2a3e]">
              <h2 className="text-white font-semibold text-[15px]">Pagamento</h2>
            </div>
            <div className="px-5 py-2">
              <InfoRow label="Gateway" value={order.paymentGateway ?? "—"} />
              <InfoRow
                label="Forma de Pagamento"
                value={
                  order.paymentMethod
                    ? (PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod)
                    : "—"
                }
              />
              {order.installments > 1 && (
                <InfoRow label="Parcelas" value={`${order.installments}x`} />
              )}
              {!!order.gatewayPaymentId && (
                <InfoRow label="ID da Transação" value={order.gatewayPaymentId} />
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">

          {/* Status + Update */}
          <div className="bg-[#0d1520] border border-[#1c2a3e] rounded-[10px] p-5">
            <h2 className="text-white font-semibold text-[15px] mb-4">Status do Pedido</h2>

            <div className="mb-4">
              <span className={`inline-flex px-3 py-1 rounded-[6px] text-[13px] font-semibold ${currentStatusColor}`}>
                {currentStatusLabel}
              </span>
            </div>

            <div className="mb-4">
              <label className={labelCls}>Alterar status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={selectCls}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="mb-5">
              <label className={labelCls}>Código de Rastreio</label>
              <input
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className={inputCls}
                placeholder="Ex: BR123456789BR"
              />
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="bg-[#ff1f1f] hover:bg-[#cc0000] disabled:opacity-50 text-white text-[14px] font-semibold h-[44px] w-full rounded-[6px] transition-colors"
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>

          {/* Customer info */}
          <div className="bg-[#0d1520] border border-[#1c2a3e] rounded-[10px] p-5">
            <h2 className="text-white font-semibold text-[15px] mb-3">Cliente</h2>
            <InfoRow label="Nome" value={order.customerName} />
            <InfoRow label="Email" value={
              <a href={`mailto:${order.customerEmail}`} className="text-[#ff1f1f] hover:text-[#ff4444] transition-colors">
                {order.customerEmail}
              </a>
            } />
            {order.customerPhone && (
              <InfoRow label="Telefone" value={order.customerPhone} />
            )}
          </div>

          {/* Shipping address */}
          <div className="bg-[#0d1520] border border-[#1c2a3e] rounded-[10px] p-5">
            <h2 className="text-white font-semibold text-[15px] mb-3">Endereço de Entrega</h2>
            {Object.keys(address).length === 0 ? (
              <p className="text-[#7a9ab5] text-[13px]">Sem endereço registrado.</p>
            ) : (
              <div className="text-[#d4d4da] text-[13px] leading-relaxed space-y-0.5">
                {address.name && <div className="font-medium">{address.name}</div>}
                {address.street && (
                  <div>
                    {address.street}{address.number ? `, ${address.number}` : ""}
                    {address.complement ? ` — ${address.complement}` : ""}
                  </div>
                )}
                {address.neighborhood && <div>{address.neighborhood}</div>}
                {(address.city || address.state) && (
                  <div>{[address.city, address.state].filter(Boolean).join(" — ")}</div>
                )}
                {address.zipCode && <div className="font-mono text-[12px] text-[#7a9ab5]">CEP: {address.zipCode}</div>}
              </div>
            )}
          </div>

          {/* Shipping method */}
          <div className="bg-[#0d1520] border border-[#1c2a3e] rounded-[10px] p-5">
            <h2 className="text-white font-semibold text-[15px] mb-3">Entrega</h2>
            <InfoRow label="Método" value={order.shippingMethod ?? "—"} />
            <InfoRow label="Custo do Frete" value={fmtBRL(order.shippingCost ?? 0)} />
            {trackingCode && (
              <InfoRow label="Rastreio" value={
                <span className="font-mono text-[12px]">{trackingCode}</span>
              } />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
