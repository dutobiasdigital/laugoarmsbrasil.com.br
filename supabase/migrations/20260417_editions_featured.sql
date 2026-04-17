-- Adiciona coluna isFeatured à tabela editions
ALTER TABLE editions
  ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN editions."isFeatured" IS 'Marca a edição como destaque para exibição em seções especiais e home';

-- Marca 15 edições publicadas aleatórias como destaque
UPDATE editions
SET "isFeatured" = true
WHERE id IN (
  SELECT id FROM editions
  WHERE "isPublished" = true
  ORDER BY RANDOM()
  LIMIT 15
);
