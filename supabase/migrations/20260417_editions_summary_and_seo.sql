ALTER TABLE editions
  ADD COLUMN IF NOT EXISTS summary          TEXT,
  ADD COLUMN IF NOT EXISTS "seoTitle"       TEXT,
  ADD COLUMN IF NOT EXISTS "seoDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "seoKeywords"    TEXT,
  ADD COLUMN IF NOT EXISTS "canonicalUrl"   TEXT;

COMMENT ON COLUMN editions.summary           IS 'Chamada/resumo das matérias da edição (texto puro, sem HTML)';
COMMENT ON COLUMN editions."seoTitle"        IS 'Título para mecanismos de busca (max 70 chars)';
COMMENT ON COLUMN editions."seoDescription"  IS 'Descrição para snippet no Google (max 160 chars)';
COMMENT ON COLUMN editions."seoKeywords"     IS 'Palavras-chave separadas por vírgula';
COMMENT ON COLUMN editions."canonicalUrl"    IS 'URL canônica (apenas se for cópia de outra URL)';
