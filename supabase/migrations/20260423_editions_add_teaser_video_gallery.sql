ALTER TABLE editions
  ADD COLUMN IF NOT EXISTS teaser         TEXT,
  ADD COLUMN IF NOT EXISTS video_url      TEXT,
  ADD COLUMN IF NOT EXISTS gallery_images TEXT DEFAULT '[]';
