-- Marca como leitor nativo todas as edições que já têm páginas no Storage
-- mas ainda não têm pageFlipUrl definido
UPDATE editions
SET "pageFlipUrl" = 'native'
WHERE slug IN (
  SELECT DISTINCT split_part(name, '/', 1)
  FROM storage.objects
  WHERE bucket_id = 'edition-pages'
    AND name NOT LIKE '%.emptyFolderPlaceholder'
)
AND ("pageFlipUrl" IS NULL OR "pageFlipUrl" = '');
