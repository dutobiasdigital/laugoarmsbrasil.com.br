-- Bucket privado para as páginas das edições (conteúdo pago)
-- As URLs são servidas via signed URLs geradas server-side (acesso controlado)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'edition-pages',
  'edition-pages',
  false,           -- privado: sem acesso público direto
  52428800,        -- 50 MB por arquivo
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Política: apenas o service role (via API) faz upload/delete
-- Leitura pública desabilitada — acessado via signed URLs
