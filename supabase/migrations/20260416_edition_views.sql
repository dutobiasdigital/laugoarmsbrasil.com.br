-- Tabela de visualizações de edições (para analytics)
CREATE TABLE IF NOT EXISTS edition_views (
  id         BIGSERIAL PRIMARY KEY,
  edition_slug TEXT NOT NULL,
  user_id    UUID,                          -- NULL = visitante não autenticado
  viewed_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_edition_views_slug ON edition_views (edition_slug);
CREATE INDEX IF NOT EXISTS idx_edition_views_at   ON edition_views (viewed_at);
CREATE INDEX IF NOT EXISTS idx_edition_views_user ON edition_views (user_id) WHERE user_id IS NOT NULL;

-- View para aggregações no admin (sem precisar de GROUP BY no REST)
CREATE OR REPLACE VIEW edition_view_stats AS
SELECT
  edition_slug,
  COUNT(*)                 AS total_views,
  COUNT(DISTINCT user_id)  AS unique_views,
  MAX(viewed_at)           AS last_viewed_at
FROM edition_views
GROUP BY edition_slug;
