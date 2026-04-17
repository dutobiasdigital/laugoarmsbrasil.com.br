ALTER TABLE user_favorites DROP CONSTRAINT IF EXISTS user_favorites_contentType_check;
ALTER TABLE user_favorites ADD CONSTRAINT user_favorites_contentType_check
  CHECK ("contentType" IN ('edition', 'product', 'guide_listing', 'article'));
