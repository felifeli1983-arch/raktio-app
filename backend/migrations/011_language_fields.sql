-- Migration 011: Language fields
-- Adds simulation_language to simulations table
-- Adds source_language to memory tables
-- Part of Language Architecture Phase 1 (2026-04-15)

-- 1. simulation_language on simulations
ALTER TABLE public.simulations
  ADD COLUMN simulation_language TEXT NOT NULL DEFAULT 'en';

-- 2. source_language on agent_memory_summaries
ALTER TABLE public.agent_memory_summaries
  ADD COLUMN source_language TEXT NOT NULL DEFAULT 'en';

-- 3. source_language on agent_episodic_memory
ALTER TABLE public.agent_episodic_memory
  ADD COLUMN source_language TEXT NOT NULL DEFAULT 'en';
