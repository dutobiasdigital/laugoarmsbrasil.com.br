export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import OrderDetailClient from "./_OrderDetailClient";

const PROJECT = process.env.SUPABASE_PROJECT_ID ?? "mfefumwjzbzuqfyvpoeo";
const SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BASE     = `https://${PROJECT}.supabase.co/rest/v1`;
const HEADERS  = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

interface OrderRow {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerDocument?: string;
  shippingAddress: Record<string, string>;
  shippingMethod?: string;
  shippingCost: number;
  shippingTrackingCode?: string;
  subtotal: number;
  discount?: number;
  discountAmount?: number;
  total: number;
  paymentGateway?: string;
  paymentMethod?: string;
  installments: number;
  gatewayPaymentId?: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt?: string;
}

interface OrderItemRow {
  id: string;
  productName: string;
  variationName?: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export default async function PedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let order: OrderRow | null = null;
  let items: OrderItemRow[] = [];

  try {
    const [orderRes, itemsRes] = await Promise.all([
      fetch(
        `${BASE}/shop_orders?id=eq.${id}&select=id,orderNumber,status,customerName,customerEmail,customerPhone,customerDocument,shippingAddress,shippingMethod,shippingCost,shippingTrackingCode,subtotal,discount,total,paymentGateway,paymentMethod,installments,gatewayPaymentId,paidAt,shippedAt,deliveredAt,createdAt&limit=1`,
        { headers: HEADERS, cache: "no-store" }
      ),
      fetch(
        `${BASE}/shop_order_items?orderId=eq.${id}&select=id,productName,variationName,sku,quantity,unitPrice,totalPrice`,
        { headers: HEADERS, cache: "no-store" }
      ),
    ]);
    const orderData = await orderRes.json();
    const itemsData = await itemsRes.json();
    order = Array.isArray(orderData) && orderData.length > 0 ? orderData[0] : null;
    items = Array.isArray(itemsData) ? itemsData : [];
  } catch {
    // DB unavailable
  }

  if (!order) notFound();

  const orderWithItems = { ...order, items };

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/loja" className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors">
          Loja
        </Link>
        <span className="text-[#141d2c]">/</span>
        <Link href="/admin/loja/pedidos" className="text-[#7a9ab5] hover:text-white text-[14px] transition-colors">
          Pedidos
        </Link>
        <span className="text-[#141d2c]">/</span>
        <span className="text-[#d4d4da] text-[14px] font-mono">{order.orderNumber}</span>
      </div>

      <h1 className="font-['Barlow_Condensed'] font-bold text-white text-[32px] leading-none mb-1">
        Pedido {order.orderNumber}
      </h1>
      <p className="text-[#7a9ab5] text-[14px] mb-6">
        Criado em{" "}
        {new Date(order.createdAt).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </p>
      <div className="bg-[#141d2c] h-px mb-6" />

      <OrderDetailClient order={orderWithItems} />
    </>
  );
}
