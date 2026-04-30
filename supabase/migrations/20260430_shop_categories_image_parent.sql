-- Adiciona suporte a imagem e hierarquia (subcategorias) em shop_categories

ALTER TABLE shop_categories
  ADD COLUMN IF NOT EXISTS "imageUrl" text,
  ADD COLUMN IF NOT EXISTS "parentId" uuid REFERENCES shop_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_shop_categories_parent ON shop_categories ("parentId");
