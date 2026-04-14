-- ============================================================
-- Raktio — Migration 005: Expand report_sections section_key values
-- ============================================================
-- Adds: simulation_context, outcome_scorecard, exposure_analysis, faction_analysis
-- to the section_key CHECK constraint.
-- Also adds audience_id to simulations table for audience-simulation linking.
-- ============================================================

-- Drop and recreate the CHECK constraint on section_key
ALTER TABLE public.report_sections DROP CONSTRAINT IF EXISTS report_sections_section_key_check;

ALTER TABLE public.report_sections ADD CONSTRAINT report_sections_section_key_check
  CHECK (section_key IN (
    'executive_summary', 'simulation_context', 'outcome_scorecard',
    'key_findings', 'belief_shifts', 'patient_zero',
    'segment_analysis', 'geography_analysis', 'platform_analysis',
    'exposure_analysis', 'faction_analysis',
    'recommendations', 'evidence', 'confidence_limitations'
  ));

-- Add audience_id to simulations for audience-simulation linking
ALTER TABLE public.simulations
  ADD COLUMN IF NOT EXISTS audience_id UUID REFERENCES public.audiences(audience_id) ON DELETE SET NULL;

-- End of migration 005
