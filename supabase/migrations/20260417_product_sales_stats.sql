-- Aggregated view of product sales from confirmed orders
CREATE OR REPLACE VIEW product_sales_stats AS
SELECT
  sp.id          AS product_id,
  sp.slug        AS product_slug,
  sp.name        AS product_name,
  sp."mainImageUrl",
  sp."basePrice",
  SUM(oi.quantity)::bigint                  AS total_sold,
  COUNT(DISTINCT oi."orderId")::bigint      AS total_orders
FROM shop_order_items oi
JOIN shop_orders   so ON so.id = oi."orderId"
JOIN shop_products sp ON sp.id = oi."productId"
WHERE so.status IN ('PAID','SHIPPED','DELIVERED','COMPLETED')
GROUP BY sp.id, sp.slug, sp.name, sp."mainImageUrl", sp."basePrice";
