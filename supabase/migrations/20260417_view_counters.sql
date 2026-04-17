-- View counters: articles, products, product categories, blog categories, guia categories

-- Article views
CREATE TABLE IF NOT EXISTS article_views (
  id           BIGSERIAL PRIMARY KEY,
  article_slug TEXT NOT NULL,
  viewed_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_article_views_slug ON article_views(article_slug);
CREATE OR REPLACE VIEW article_view_stats AS
  SELECT article_slug, COUNT(*) AS total_views, MAX(viewed_at) AS last_viewed_at
  FROM article_views GROUP BY article_slug;

-- Product views
CREATE TABLE IF NOT EXISTS product_views (
  id           BIGSERIAL PRIMARY KEY,
  product_slug TEXT NOT NULL,
  viewed_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_views_slug ON product_views(product_slug);
CREATE OR REPLACE VIEW product_view_stats AS
  SELECT product_slug, COUNT(*) AS total_views, MAX(viewed_at) AS last_viewed_at
  FROM product_views GROUP BY product_slug;

-- Product category views (recorded when user clicks a category to filter)
CREATE TABLE IF NOT EXISTS product_category_views (
  id            BIGSERIAL PRIMARY KEY,
  category_slug TEXT NOT NULL,
  viewed_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_cat_views_slug ON product_category_views(category_slug);
CREATE OR REPLACE VIEW product_category_view_stats AS
  SELECT category_slug, COUNT(*) AS total_views
  FROM product_category_views GROUP BY category_slug;

-- Blog category views (recorded only when user clicks a category pill to filter)
CREATE TABLE IF NOT EXISTS blog_category_views (
  id            BIGSERIAL PRIMARY KEY,
  category_name TEXT NOT NULL,
  viewed_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_blog_cat_views_name ON blog_category_views(category_name);
CREATE OR REPLACE VIEW blog_category_view_stats AS
  SELECT category_name, COUNT(*) AS total_views
  FROM blog_category_views GROUP BY category_name;

-- Guia category views (recorded when user navigates to /guia/[categoria])
CREATE TABLE IF NOT EXISTS guia_category_views (
  id            BIGSERIAL PRIMARY KEY,
  category_slug TEXT NOT NULL,
  viewed_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_guia_cat_views_slug ON guia_category_views(category_slug);
CREATE OR REPLACE VIEW guia_category_view_stats AS
  SELECT category_slug, COUNT(*) AS total_views
  FROM guia_category_views GROUP BY category_slug;
