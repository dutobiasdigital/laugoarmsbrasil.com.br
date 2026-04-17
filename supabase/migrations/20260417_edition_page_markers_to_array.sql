-- Renomeia para plural e converte TEXT → TEXT[]
-- Dados existentes (string única) viram array de 1 elemento — sem perda de dados

ALTER TABLE editions
  RENAME COLUMN "editorialPageFile" TO "editorialPageFiles";

ALTER TABLE editions
  RENAME COLUMN "indexPageFile" TO "indexPageFiles";

ALTER TABLE editions
  ALTER COLUMN "editorialPageFiles" TYPE TEXT[]
    USING CASE
      WHEN "editorialPageFiles" IS NULL OR "editorialPageFiles" = ''
        THEN NULL::TEXT[]
      ELSE ARRAY["editorialPageFiles"]
    END;

ALTER TABLE editions
  ALTER COLUMN "indexPageFiles" TYPE TEXT[]
    USING CASE
      WHEN "indexPageFiles" IS NULL OR "indexPageFiles" = ''
        THEN NULL::TEXT[]
      ELSE ARRAY["indexPageFiles"]
    END;

COMMENT ON COLUMN editions."editorialPageFiles" IS 'Arquivos das páginas editoriais no Storage (ex: {page-005.jpg,page-006.jpg})';
COMMENT ON COLUMN editions."indexPageFiles"     IS 'Arquivos das páginas de índice no Storage (ex: {page-007.jpg,page-008.jpg})';
