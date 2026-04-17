-- Add segmentKey column to guide_categories
-- Links each category to the company segment values it represents
ALTER TABLE guide_categories ADD COLUMN IF NOT EXISTS "segmentKey" text;

-- Populate initial values based on existing slugs
UPDATE guide_categories SET "segmentKey" = 'ARMAS'          WHERE slug = 'armareiro';
UPDATE guide_categories SET "segmentKey" = 'TIRO_ESPORTIVO' WHERE slug = 'clube-de-tiro';
UPDATE guide_categories SET "segmentKey" = 'MUNICOES'       WHERE slug = 'municoes';
UPDATE guide_categories SET "segmentKey" = 'CACA'           WHERE slug = 'caca-pesca';
UPDATE guide_categories SET "segmentKey" = 'OUTROS'
  WHERE slug IN ('juridico','treinamento','manutencao','importacao','transporte','seguros','outros');
