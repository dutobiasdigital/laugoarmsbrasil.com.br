CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "contentType" text NOT NULL CHECK ("contentType" IN ('edition', 'product', 'guide_listing')),
  "contentId" text NOT NULL,
  "createdAt" timestamptz DEFAULT now() NOT NULL,
  UNIQUE ("userId", "contentType", "contentId")
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites("userId");
CREATE INDEX IF NOT EXISTS idx_user_favorites_content ON user_favorites("contentType", "contentId");

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fav_select_own" ON user_favorites
  FOR SELECT USING (
    "userId" = (SELECT id FROM users WHERE "authId" = auth.uid()::text LIMIT 1)
  );

CREATE POLICY "fav_insert_own" ON user_favorites
  FOR INSERT WITH CHECK (
    "userId" = (SELECT id FROM users WHERE "authId" = auth.uid()::text LIMIT 1)
  );

CREATE POLICY "fav_delete_own" ON user_favorites
  FOR DELETE USING (
    "userId" = (SELECT id FROM users WHERE "authId" = auth.uid()::text LIMIT 1)
  );
