-- Adiciona campos de marcação de páginas especiais nas edições
ALTER TABLE editions
  ADD COLUMN IF NOT EXISTS "editorialPageFile" TEXT,
  ADD COLUMN IF NOT EXISTS "indexPageFile"     TEXT;

COMMENT ON COLUMN editions."editorialPageFile" IS 'Nome do arquivo da página editorial no Storage (ex: page-005.jpg)';
COMMENT ON COLUMN editions."indexPageFile"     IS 'Nome do arquivo da página índice no Storage (ex: page-007.jpg)';
