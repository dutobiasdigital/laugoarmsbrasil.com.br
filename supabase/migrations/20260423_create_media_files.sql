CREATE TABLE IF NOT EXISTS media_files (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  filename     TEXT        NOT NULL,
  storage_path TEXT        NOT NULL UNIQUE,
  url          TEXT        NOT NULL,
  type         TEXT        NOT NULL DEFAULT 'image',
  mime_type    TEXT        NOT NULL DEFAULT '',
  size_bytes   BIGINT      NOT NULL DEFAULT 0,
  width        INTEGER,
  height       INTEGER,
  alt_text     TEXT,
  title        TEXT,
  description  TEXT,
  folder       TEXT        NOT NULL DEFAULT 'geral',
  tags         TEXT[]      NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS media_files_updated_at ON media_files;
CREATE TRIGGER media_files_updated_at
  BEFORE UPDATE ON media_files
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS media_files_type_idx       ON media_files(type);
CREATE INDEX IF NOT EXISTS media_files_folder_idx     ON media_files(folder);
CREATE INDEX IF NOT EXISTS media_files_created_at_idx ON media_files(created_at DESC);
