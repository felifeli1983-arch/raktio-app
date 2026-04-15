-- Migration 012: Realism Upgrade R1A fields
ALTER TABLE public.simulations ADD COLUMN IF NOT EXISTS seed_content TEXT;
ALTER TABLE public.simulations ADD COLUMN IF NOT EXISTS confidence_score FLOAT;
