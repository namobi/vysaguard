-- Migration: Provider Onboarding Setup
-- Adds missing fields and tables for the provider onboarding flow

-- 1) Add is_provider flag to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_provider BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_is_provider
  ON public.profiles (is_provider)
  WHERE is_provider = true;

COMMENT ON COLUMN public.profiles.is_provider IS 'Indicates if the user is registered as a provider (agent/agency)';

-- 2) Create languages table
CREATE TABLE IF NOT EXISTS public.languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed top 10 common languages
INSERT INTO public.languages (id, name, code) VALUES
  ('lang0001-0001-0001-0001-000000000001', 'English', 'en'),
  ('lang0001-0001-0001-0001-000000000002', 'Spanish', 'es'),
  ('lang0001-0001-0001-0001-000000000003', 'French', 'fr'),
  ('lang0001-0001-0001-0001-000000000004', 'Arabic', 'ar'),
  ('lang0001-0001-0001-0001-000000000005', 'Portuguese', 'pt'),
  ('lang0001-0001-0001-0001-000000000006', 'Russian', 'ru'),
  ('lang0001-0001-0001-0001-000000000007', 'Hindi', 'hi'),
  ('lang0001-0001-0001-0001-000000000008', 'Mandarin Chinese', 'zh'),
  ('lang0001-0001-0001-0001-000000000009', 'German', 'de'),
  ('lang0001-0001-0001-0001-000000000010', 'Swahili', 'sw')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS on languages (public read)
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "languages_public_read" ON public.languages;
CREATE POLICY "languages_public_read" ON public.languages
  FOR SELECT USING (true);

COMMENT ON TABLE public.languages IS 'Available languages for provider profiles';

-- 3) Create provider_types table
CREATE TABLE IF NOT EXISTS public.provider_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed provider types
INSERT INTO public.provider_types (id, name, description) VALUES
  ('ptype001-0001-0001-0001-000000000001', 'Visa Agency', 'Licensed visa consulting agencies'),
  ('ptype001-0001-0001-0001-000000000002', 'Legal Immigration', 'Immigration law firms and attorneys')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS on provider_types (public read)
ALTER TABLE public.provider_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "provider_types_public_read" ON public.provider_types;
CREATE POLICY "provider_types_public_read" ON public.provider_types
  FOR SELECT USING (true);

COMMENT ON TABLE public.provider_types IS 'Types of immigration service providers';

-- 4) Add JSONB fields to providers table for multi-select values
ALTER TABLE public.providers
ADD COLUMN IF NOT EXISTS countries_served JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS visa_types_served JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS provider_types JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS languages_spoken JSONB DEFAULT '[]'::jsonb;

-- Add indexes for JSONB fields
CREATE INDEX IF NOT EXISTS idx_providers_countries_served
  ON public.providers USING gin(countries_served);

CREATE INDEX IF NOT EXISTS idx_providers_visa_types_served
  ON public.providers USING gin(visa_types_served);

CREATE INDEX IF NOT EXISTS idx_providers_provider_types
  ON public.providers USING gin(provider_types);

CREATE INDEX IF NOT EXISTS idx_providers_languages_spoken
  ON public.providers USING gin(languages_spoken);

COMMENT ON COLUMN public.providers.countries_served IS 'Array of country IDs (UUIDs) the provider serves - stored as JSONB array';
COMMENT ON COLUMN public.providers.visa_types_served IS 'Array of visa type IDs (UUIDs) the provider handles - stored as JSONB array';
COMMENT ON COLUMN public.providers.provider_types IS 'Array of provider type IDs (UUIDs) - stored as JSONB array';
COMMENT ON COLUMN public.providers.languages_spoken IS 'Array of language IDs (UUIDs) the provider speaks - stored as JSONB array';

-- Note: The existing provider_service_areas table can still be used for detailed mapping
-- The JSONB fields provide quick filtering for onboarding, while service_areas provides
-- granular control for country+visa_type combinations
