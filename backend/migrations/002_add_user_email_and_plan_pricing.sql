-- ============================================================
-- Raktio — Migration 002: Add user email + plan pricing fields
-- ============================================================
-- Fixes identified in Step 1/2 audit:
--   1. public.users missing email column (DATA_MODEL_AND_STORAGE.md)
--   2. public.plans missing pricing fields (PRICING_AND_CREDITS.md)
--   3. handle_new_auth_user() trigger not copying email
-- ============================================================


-- ── 1. Add email to users ─────────────────────────────────────────────

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Backfill email from auth.users for any existing rows
UPDATE public.users u
SET email = a.email
FROM auth.users a
WHERE u.user_id = a.id
  AND u.email IS NULL;


-- ── 2. Update trigger to copy email on signup ─────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (user_id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    NEW.email
  )
  ON CONFLICT (user_id) DO UPDATE
    SET email = EXCLUDED.email
    WHERE public.users.email IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── 3. Add pricing fields to plans ────────────────────────────────────

ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS monthly_price   NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS annual_price    NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS included_credits INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bonus_credits   INTEGER NOT NULL DEFAULT 0;

-- Update seed data with pricing (aligned with PRICING_AND_CREDITS.md tiers)
UPDATE public.plans SET
  monthly_price = 49,
  annual_price = 470,
  included_credits = 5000,
  bonus_credits = 0
WHERE plan_id = 'starter';

UPDATE public.plans SET
  monthly_price = 149,
  annual_price = 1430,
  included_credits = 20000,
  bonus_credits = 2000
WHERE plan_id = 'growth';

UPDATE public.plans SET
  monthly_price = 399,
  annual_price = 3830,
  included_credits = 60000,
  bonus_credits = 6000
WHERE plan_id = 'business';

UPDATE public.plans SET
  monthly_price = 999,
  annual_price = 9590,
  included_credits = 200000,
  bonus_credits = 20000
WHERE plan_id = 'scale';

UPDATE public.plans SET
  monthly_price = 0,
  annual_price = 0,
  included_credits = 0,
  bonus_credits = 0
WHERE plan_id = 'enterprise';
-- Enterprise pricing is custom/contract-based, not self-serve.


-- End of migration 002
