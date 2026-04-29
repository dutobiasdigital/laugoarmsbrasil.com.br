-- ====================================================
-- LAÚGO ARMS BRASIL — Schema inicial
-- Baseado no Magnum. Excluído: editions, subscriptions, guia
-- ====================================================

-- SEQUENCES
CREATE SEQUENCE IF NOT EXISTS article_views_id_seq;
CREATE SEQUENCE IF NOT EXISTS blog_category_views_id_seq;
CREATE SEQUENCE IF NOT EXISTS product_views_id_seq;
CREATE SEQUENCE IF NOT EXISTS product_category_views_id_seq;

-- ENUMS
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SUBSCRIBER');
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "AdPosition" AS ENUM ('HOME_TOP', 'HOME_SIDEBAR', 'ARTICLE_INLINE', 'ARTICLE_SIDEBAR', 'EDITIONS_TOP');
CREATE TYPE "ImpressionType" AS ENUM ('VIEW', 'CLICK');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REFUNDED', 'CANCELLED');

-- users
CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  "authId" text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  role "UserRole" DEFAULT 'SUBSCRIBER'::"UserRole" NOT NULL,
  "createdAt" timestamptz DEFAULT now() NOT NULL,
  "updatedAt" timestamptz DEFAULT now() NOT NULL,
  cpf text,
  "socialInstagram" text,
  "socialFacebook" text,
  "socialYoutube" text,
  "socialTiktok" text,
  "addressStreet" text,
  "addressNumber" text,
  "addressComplement" text,
  "addressNeighborhood" text,
  "addressCity" text,
  "addressState" text,
  "addressZip" text,
  roles text[] DEFAULT '{}' NOT NULL,
  "avatarUrl" text,
  PRIMARY KEY (id),
  UNIQUE ("authId"),
  UNIQUE (email),
  UNIQUE (cpf)
);

-- site_settings
CREATE TABLE IF NOT EXISTS site_settings (
  key text NOT NULL,
  value text,
  "updatedAt" timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (key)
);

-- media_files
CREATE TABLE IF NOT EXISTS media_files (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  filename text NOT NULL,
  storage_path text NOT NULL,
  url text NOT NULL,
  type text DEFAULT 'image' NOT NULL,
  mime_type text DEFAULT '' NOT NULL,
  size_bytes bigint DEFAULT 0 NOT NULL,
  width integer,
  height integer,
  alt_text text,
  title text,
  description text,
  folder text DEFAULT 'geral' NOT NULL,
  tags text[] DEFAULT '{}' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (storage_path)
);

-- article_categories
CREATE TABLE IF NOT EXISTS article_categories (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  "isActive" boolean DEFAULT true NOT NULL,
  "imageUrl" text,
  "sortOrder" integer DEFAULT 0 NOT NULL,
  "metaTitle" text,
  "metaDescription" text,
  "metaKeywords" text,
  "imageAlt" text,
  PRIMARY KEY (id),
  UNIQUE (slug)
);

-- article_tags
CREATE TABLE IF NOT EXISTS article_tags (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (name),
  UNIQUE (slug)
);

-- articles
CREATE TABLE IF NOT EXISTS articles (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  excerpt text,
  content text NOT NULL,
  "authorName" text DEFAULT 'Redação Laúgo' NOT NULL,
  "featureImageUrl" text,
  "featureImageAlt" text,
  "seoTitle" text,
  "seoDescription" text,
  "seoKeywords" text,
  "canonicalUrl" text,
  "categoryId" uuid NOT NULL,
  "isExclusive" boolean DEFAULT false NOT NULL,
  status "ArticleStatus" DEFAULT 'DRAFT'::"ArticleStatus" NOT NULL,
  "publishedAt" timestamptz,
  "createdAt" timestamptz DEFAULT now() NOT NULL,
  "updatedAt" timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (slug),
  FOREIGN KEY ("categoryId") REFERENCES article_categories(id)
);

-- _ArticleToArticleTag
CREATE TABLE IF NOT EXISTS "_ArticleToArticleTag" (
  "A" uuid NOT NULL,
  "B" uuid NOT NULL,
  PRIMARY KEY ("A", "B"),
  FOREIGN KEY ("A") REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY ("B") REFERENCES article_tags(id) ON DELETE CASCADE
);

-- article_views
CREATE TABLE IF NOT EXISTS article_views (
  id bigint DEFAULT nextval('article_views_id_seq') NOT NULL,
  article_slug text NOT NULL,
  viewed_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- blog_category_views
CREATE TABLE IF NOT EXISTS blog_category_views (
  id bigint DEFAULT nextval('blog_category_views_id_seq') NOT NULL,
  category_name text NOT NULL,
  viewed_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- advertisers
CREATE TABLE IF NOT EXISTS advertisers (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  "tradeName" text NOT NULL,
  "legalName" text,
  contact text,
  phone text,
  email text,
  website text,
  instagram text,
  address text,
  segment text DEFAULT 'OUTROS' NOT NULL,
  "logoUrl" text,
  description text,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now(),
  "coverImageUrl" text,
  "whatsappNumber" text,
  "whatsappMessage" text,
  PRIMARY KEY (id)
);

-- advertisements
CREATE TABLE IF NOT EXISTS advertisements (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  advertiser text NOT NULL,
  "imageUrl" text NOT NULL,
  "targetUrl" text NOT NULL,
  "position" "AdPosition" NOT NULL,
  active boolean DEFAULT true NOT NULL,
  "startsAt" timestamptz,
  "endsAt" timestamptz,
  "maxImpressions" integer,
  "createdAt" timestamptz DEFAULT now() NOT NULL,
  "advertiserId" uuid,
  "bannerSize" text,
  clicks integer DEFAULT 0 NOT NULL,
  notes text,
  "companyId" uuid,
  "userId" uuid,
  PRIMARY KEY (id),
  FOREIGN KEY ("advertiserId") REFERENCES advertisers(id) ON DELETE SET NULL,
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE SET NULL
);

-- ad_impressions
CREATE TABLE IF NOT EXISTS ad_impressions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  "adId" uuid NOT NULL,
  type "ImpressionType" NOT NULL,
  "createdAt" timestamptz DEFAULT now() NOT NULL,
  "sessionId" text,
  PRIMARY KEY (id),
  FOREIGN KEY ("adId") REFERENCES advertisements(id)
);

-- ad_requests
CREATE TABLE IF NOT EXISTS ad_requests (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  "tradeName" text NOT NULL,
  "legalName" text,
  contact text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  website text,
  instagram text,
  segment text DEFAULT 'OUTROS' NOT NULL,
  address text,
  interests text,
  message text,
  status text DEFAULT 'PENDING' NOT NULL,
  "createdAt" timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (id)
);

-- shop_categories
CREATE TABLE IF NOT EXISTS shop_categories (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  "isActive" boolean DEFAULT true NOT NULL,
  "sortOrder" integer DEFAULT 0 NOT NULL,
  "createdAt" timestamptz DEFAULT now() NOT NULL,
  "updatedAt" timestamptz DEFAULT now() NOT NULL,
  "metaTitle" text,
  "metaDescription" text,
  "metaKeywords" text,
  PRIMARY KEY (id),
  UNIQUE (slug)
);

-- shop_products
CREATE TABLE IF NOT EXISTS shop_products (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  "categoryId" uuid,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  "technicalSpecs" text,
  "pdfFileUrl" text,
  "mainImageUrl" text,
  "additionalImages" text[] DEFAULT '{}',
  "hasVariations" boolean DEFAULT false NOT NULL,
  "basePrice" integer DEFAULT 0 NOT NULL,
  weight integer,
  "dimensionWidth" numeric,
  "dimensionHeight" numeric,
  "dimensionLength" numeric,
  sku text,
  stock integer DEFAULT 0 NOT NULL,
  "isActive" boolean DEFAULT true NOT NULL,
  "isFeatured" boolean DEFAULT false NOT NULL,
  metadata jsonb DEFAULT '{}',
  "createdAt" timestamptz DEFAULT now() NOT NULL,
  "updatedAt" timestamptz DEFAULT now() NOT NULL,
  "metaTitle" text,
  "metaDescription" text,
  "metaKeywords" text,
  "mainImageAlt" text,
  "contentTabs" jsonb DEFAULT '[]' NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (slug),
  FOREIGN KEY ("categoryId") REFERENCES shop_categories(id) ON DELETE SET NULL
);

-- shop_product_variations
CREATE TABLE IF NOT EXISTS shop_product_variations (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  "productId" uuid NOT NULL,
  name text NOT NULL,
  attributes jsonb DEFAULT '{}',
  price integer,
  stock integer DEFAULT 0 NOT NULL,
  sku text,
  "isActive" boolean DEFAULT true NOT NULL,
  "sortOrder" integer DEFAULT 0 NOT NULL,
  "createdAt" timestamptz DEFAULT now() NOT NULL,
  "updatedAt" timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY ("productId") REFERENCES shop_products(id) ON DELETE CASCADE
);

-- shop_product_images
CREATE TABLE IF NOT EXISTS shop_product_images (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  "productId" text NOT NULL,
  "imageUrl" text NOT NULL,
  "imageAlt" text,
  "sortOrder" integer DEFAULT 0 NOT NULL,
  "isMain" boolean DEFAULT false NOT NULL,
  "createdAt" timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (id)
);

-- shop_product_pdfs
CREATE TABLE IF NOT EXISTS shop_product_pdfs (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  "productId" text NOT NULL,
  title text DEFAULT '' NOT NULL,
  "fileUrl" text NOT NULL,
  "sortOrder" integer DEFAULT 0 NOT NULL,
  "createdAt" timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (id)
);

-- shop_carts
CREATE TABLE IF NOT EXISTS shop_carts (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  "sessionId" text,
  "userId" uuid,
  "expiresAt" timestamptz DEFAULT (now() + '7 days'::interval) NOT NULL,
  "createdAt" timestamptz DEFAULT now() NOT NULL,
  "updatedAt" timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE SET NULL
);

-- shop_cart_items
CREATE TABLE IF NOT EXISTS shop_cart_items (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  "cartId" uuid NOT NULL,
  "productId" uuid NOT NULL,
  "variationId" uuid,
  quantity integer DEFAULT 1 NOT NULL,
  "priceAtTime" integer NOT NULL,
  "createdAt" timestamptz DEFAULT now() NOT NULL,
  "updatedAt" timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY ("cartId") REFERENCES shop_carts(id) ON DELETE CASCADE,
  FOREIGN KEY ("productId") REFERENCES shop_products(id) ON DELETE CASCADE,
  FOREIGN KEY ("variationId") REFERENCES shop_product_variations(id) ON DELETE SET NULL
);

-- shop_orders
CREATE TABLE IF NOT EXISTS shop_orders (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  "orderNumber" text NOT NULL,
  status text DEFAULT 'PENDING' NOT NULL,
  "customerName" text NOT NULL,
  "customerEmail" text NOT NULL,
  "customerPhone" text,
  "customerDocument" text,
  "userId" uuid,
  "shippingAddress" jsonb DEFAULT '{}' NOT NULL,
  "shippingMethod" text,
  "shippingCost" integer DEFAULT 0 NOT NULL,
  "shippingTrackingCode" text,
  subtotal integer DEFAULT 0 NOT NULL,
  discount integer DEFAULT 0 NOT NULL,
  total integer DEFAULT 0 NOT NULL,
  "paymentGateway" text,
  "paymentMethod" text,
  installments integer DEFAULT 1 NOT NULL,
  "gatewayOrderId" text,
  "gatewayPaymentId" text,
  "paidAt" timestamptz,
  "shippedAt" timestamptz,
  "deliveredAt" timestamptz,
  metadata jsonb DEFAULT '{}',
  "createdAt" timestamptz DEFAULT now() NOT NULL,
  "updatedAt" timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (id),
  UNIQUE ("orderNumber"),
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE SET NULL
);

-- shop_order_items
CREATE TABLE IF NOT EXISTS shop_order_items (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  "orderId" uuid NOT NULL,
  "productId" uuid,
  "variationId" uuid,
  "productName" text NOT NULL,
  "variationName" text,
  quantity integer DEFAULT 1 NOT NULL,
  "unitPrice" integer NOT NULL,
  "totalPrice" integer NOT NULL,
  sku text,
  "createdAt" timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY ("orderId") REFERENCES shop_orders(id) ON DELETE CASCADE,
  FOREIGN KEY ("productId") REFERENCES shop_products(id) ON DELETE SET NULL,
  FOREIGN KEY ("variationId") REFERENCES shop_product_variations(id) ON DELETE SET NULL
);

-- shop_installment_rules
CREATE TABLE IF NOT EXISTS shop_installment_rules (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  "minAmount" integer NOT NULL,
  "maxInstallments" integer NOT NULL,
  "minInstallmentValue" integer DEFAULT 1500 NOT NULL,
  "interestRate" numeric DEFAULT 0 NOT NULL,
  "isActive" boolean DEFAULT true NOT NULL,
  "sortOrder" integer DEFAULT 0 NOT NULL,
  "createdAt" timestamptz DEFAULT now() NOT NULL,
  "updatedAt" timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (id)
);

-- payment_intents
CREATE TABLE IF NOT EXISTS payment_intents (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  gateway text NOT NULL,
  gateway_id text,
  status text DEFAULT 'PENDING' NOT NULL,
  product_type text NOT NULL,
  product_id text,
  product_label text,
  amount integer NOT NULL,
  currency text DEFAULT 'BRL' NOT NULL,
  payer_name text,
  payer_email text,
  metadata jsonb,
  external_reference text,
  checkout_url text,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (external_reference)
);

-- payments (subscriptionId nullable, sem FK para subscriptions)
CREATE TABLE IF NOT EXISTS payments (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  "userId" uuid NOT NULL,
  "subscriptionId" uuid,
  "mpPaymentId" text NOT NULL,
  "mpOrderId" text,
  "amountInCents" integer NOT NULL,
  currency text DEFAULT 'BRL' NOT NULL,
  status "PaymentStatus" NOT NULL,
  "statusDetail" text,
  "paidAt" timestamptz,
  "refundedAt" timestamptz,
  "periodStart" timestamptz,
  "periodEnd" timestamptz,
  "paymentMethod" text,
  "paymentBrand" text,
  "lastFourDigits" text,
  "createdAt" timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (id),
  UNIQUE ("mpPaymentId"),
  FOREIGN KEY ("userId") REFERENCES users(id)
);

-- product_views
CREATE TABLE IF NOT EXISTS product_views (
  id bigint DEFAULT nextval('product_views_id_seq') NOT NULL,
  product_slug text NOT NULL,
  viewed_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- product_category_views
CREATE TABLE IF NOT EXISTS product_category_views (
  id bigint DEFAULT nextval('product_category_views_id_seq') NOT NULL,
  category_slug text NOT NULL,
  viewed_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- user_favorites
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  "userId" uuid NOT NULL,
  "contentType" text NOT NULL,
  "contentId" text NOT NULL,
  "createdAt" timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (id),
  UNIQUE ("userId", "contentType", "contentId"),
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- user_access_logs
CREATE TABLE IF NOT EXISTS user_access_logs (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  "userId" uuid,
  "ipAddress" text,
  "userAgent" text,
  "createdAt" timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- INDEXES
CREATE INDEX IF NOT EXISTS "_ArticleToArticleTag_B_idx" ON "_ArticleToArticleTag" USING btree ("B");
CREATE INDEX IF NOT EXISTS "ad_impressions_adId_idx" ON ad_impressions USING btree ("adId");
CREATE INDEX IF NOT EXISTS idx_article_views_slug ON article_views USING btree (article_slug);
CREATE INDEX IF NOT EXISTS idx_blog_cat_views_name ON blog_category_views USING btree (category_name);
CREATE INDEX IF NOT EXISTS media_files_created_at_idx ON media_files USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS media_files_folder_idx ON media_files USING btree (folder);
CREATE INDEX IF NOT EXISTS media_files_type_idx ON media_files USING btree (type);
CREATE INDEX IF NOT EXISTS pi_external_reference_idx ON payment_intents USING btree (external_reference);
CREATE INDEX IF NOT EXISTS pi_gateway_id_idx ON payment_intents USING btree (gateway_id);
CREATE INDEX IF NOT EXISTS pi_product_type_idx ON payment_intents USING btree (product_type);
CREATE INDEX IF NOT EXISTS pi_status_idx ON payment_intents USING btree (status);
CREATE INDEX IF NOT EXISTS idx_product_cat_views_slug ON product_category_views USING btree (category_slug);
CREATE INDEX IF NOT EXISTS idx_product_views_slug ON product_views USING btree (product_slug);
CREATE INDEX IF NOT EXISTS idx_shop_cart_items_cart ON shop_cart_items USING btree ("cartId");
CREATE INDEX IF NOT EXISTS idx_shop_carts_session ON shop_carts USING btree ("sessionId");
CREATE INDEX IF NOT EXISTS idx_shop_carts_user ON shop_carts USING btree ("userId");
CREATE INDEX IF NOT EXISTS idx_shop_order_items_order ON shop_order_items USING btree ("orderId");
CREATE INDEX IF NOT EXISTS idx_shop_orders_email ON shop_orders USING btree ("customerEmail");
CREATE INDEX IF NOT EXISTS idx_shop_orders_number ON shop_orders USING btree ("orderNumber");
CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON shop_orders USING btree (status);
CREATE INDEX IF NOT EXISTS shop_product_images_productid_idx ON shop_product_images USING btree ("productId");
CREATE INDEX IF NOT EXISTS shop_product_pdfs_productid_idx ON shop_product_pdfs USING btree ("productId");
CREATE INDEX IF NOT EXISTS idx_shop_variations_product ON shop_product_variations USING btree ("productId");
CREATE INDEX IF NOT EXISTS idx_shop_products_active ON shop_products USING btree ("isActive", "isFeatured");
CREATE INDEX IF NOT EXISTS idx_shop_products_category ON shop_products USING btree ("categoryId");
CREATE INDEX IF NOT EXISTS idx_shop_products_slug ON shop_products USING btree (slug);
CREATE INDEX IF NOT EXISTS idx_ual_createdat ON user_access_logs USING btree ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_ual_userid ON user_access_logs USING btree ("userId");
CREATE INDEX IF NOT EXISTS idx_user_favorites_content ON user_favorites USING btree ("contentType", "contentId");
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites USING btree ("userId");

-- VIEWS
CREATE OR REPLACE VIEW article_view_stats AS
  SELECT article_slug, count(*) AS total_views, max(viewed_at) AS last_viewed_at
  FROM article_views GROUP BY article_slug;

CREATE OR REPLACE VIEW blog_category_view_stats AS
  SELECT category_name, count(*) AS total_views
  FROM blog_category_views GROUP BY category_name;

CREATE OR REPLACE VIEW product_view_stats AS
  SELECT product_slug, count(*) AS total_views, max(viewed_at) AS last_viewed_at
  FROM product_views GROUP BY product_slug;

CREATE OR REPLACE VIEW product_category_view_stats AS
  SELECT category_slug, count(*) AS total_views
  FROM product_category_views GROUP BY category_slug;

CREATE OR REPLACE VIEW product_sales_stats AS
  SELECT sp.id AS product_id, sp.slug AS product_slug, sp.name AS product_name,
    sp."mainImageUrl", sp."basePrice",
    sum(oi.quantity) AS total_sold,
    count(DISTINCT oi."orderId") AS total_orders
  FROM shop_order_items oi
  JOIN shop_orders so ON so.id = oi."orderId"
  JOIN shop_products sp ON sp.id = oi."productId"
  WHERE so.status = ANY (ARRAY['PAID','SHIPPED','DELIVERED','COMPLETED'])
  GROUP BY sp.id, sp.slug, sp.name, sp."mainImageUrl", sp."basePrice";
