-- ============================================================
-- Raktio — Migration 010: Add memory_mode to simulations
-- ============================================================
-- Supports "fresh" vs "persistent" simulation mode.
-- "persistent" (default) = agents carry memory across simulations.
-- "fresh" = agents start with clean slate, no memory injection or
--           post-run memory transformation.

ALTER TABLE public.simulations
  ADD COLUMN IF NOT EXISTS memory_mode text NOT NULL DEFAULT 'persistent';

-- Constrain to valid values
ALTER TABLE public.simulations
  ADD CONSTRAINT chk_simulations_memory_mode
  CHECK (memory_mode IN ('persistent', 'fresh'));
