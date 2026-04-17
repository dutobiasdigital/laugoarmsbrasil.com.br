-- Interaction counters for companies
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS "whatsappCount"   integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "formCount"       integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "phoneCount"      integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "directionsCount" integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION increment_company_whatsapp(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE companies SET "whatsappCount" = "whatsappCount" + 1 WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_company_form(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE companies SET "formCount" = "formCount" + 1 WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_company_phone(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE companies SET "phoneCount" = "phoneCount" + 1 WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_company_directions(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE companies SET "directionsCount" = "directionsCount" + 1 WHERE id = p_id;
END;
$$;
