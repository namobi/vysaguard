-- Migration: Provider Foundation Tables
-- Supports provider onboarding, credentials, and service areas.

-- 1) Provider verification status enum
DO $$ BEGIN
  CREATE TYPE public.provider_status AS ENUM ('pending', 'under_review', 'verified', 'suspended', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2) Providers table
CREATE TABLE IF NOT EXISTS public.providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  bio text,
  website_url text,
  logo_url text,
  provider_type text NOT NULL DEFAULT 'agent',
  status public.provider_status NOT NULL DEFAULT 'pending',
  years_experience int,
  languages text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz,
  rejection_reason text
);

CREATE INDEX IF NOT EXISTS idx_providers_user_id ON public.providers (user_id);
CREATE INDEX IF NOT EXISTS idx_providers_status ON public.providers (status) WHERE status = 'verified';

-- 3) Provider credentials (licenses, certifications)
CREATE TABLE IF NOT EXISTS public.provider_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  credential_type text NOT NULL,
  issuing_body text NOT NULL,
  credential_number text,
  issued_date date,
  expiry_date date,
  document_url text,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_provider_credentials_provider
  ON public.provider_credentials (provider_id);

-- 4) Provider service areas (which countries/visa types they cover)
CREATE TABLE IF NOT EXISTS public.provider_service_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  country_id uuid NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  visa_type_id uuid REFERENCES public.visa_types(id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_provider_service_areas_provider
  ON public.provider_service_areas (provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_service_areas_country
  ON public.provider_service_areas (country_id, visa_type_id)
  WHERE is_active = true;

-- Unique constraint: one service area per provider+country+visa_type
ALTER TABLE public.provider_service_areas
  DROP CONSTRAINT IF EXISTS uq_provider_service_areas;
ALTER TABLE public.provider_service_areas
  ADD CONSTRAINT uq_provider_service_areas
  UNIQUE (provider_id, country_id, visa_type_id);

-- 5) Enable RLS on all tables
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_service_areas ENABLE ROW LEVEL SECURITY;

-- Providers RLS: owner can read/update their own profile
DROP POLICY IF EXISTS "providers_owner_select" ON public.providers;
CREATE POLICY "providers_owner_select" ON public.providers
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "providers_owner_update" ON public.providers;
CREATE POLICY "providers_owner_update" ON public.providers
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "providers_owner_insert" ON public.providers;
CREATE POLICY "providers_owner_insert" ON public.providers
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Service role full access
DROP POLICY IF EXISTS "providers_service_all" ON public.providers;
CREATE POLICY "providers_service_all" ON public.providers
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Provider credentials RLS: owner access via provider_id
DROP POLICY IF EXISTS "provider_credentials_owner_select" ON public.provider_credentials;
CREATE POLICY "provider_credentials_owner_select" ON public.provider_credentials
  FOR SELECT TO authenticated
  USING (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "provider_credentials_owner_insert" ON public.provider_credentials;
CREATE POLICY "provider_credentials_owner_insert" ON public.provider_credentials
  FOR INSERT TO authenticated
  WITH CHECK (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "provider_credentials_owner_delete" ON public.provider_credentials;
CREATE POLICY "provider_credentials_owner_delete" ON public.provider_credentials
  FOR DELETE TO authenticated
  USING (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "provider_credentials_service_all" ON public.provider_credentials;
CREATE POLICY "provider_credentials_service_all" ON public.provider_credentials
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Provider service areas RLS: owner access via provider_id
DROP POLICY IF EXISTS "provider_service_areas_owner_select" ON public.provider_service_areas;
CREATE POLICY "provider_service_areas_owner_select" ON public.provider_service_areas
  FOR SELECT TO authenticated
  USING (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "provider_service_areas_owner_insert" ON public.provider_service_areas;
CREATE POLICY "provider_service_areas_owner_insert" ON public.provider_service_areas
  FOR INSERT TO authenticated
  WITH CHECK (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "provider_service_areas_owner_delete" ON public.provider_service_areas;
CREATE POLICY "provider_service_areas_owner_delete" ON public.provider_service_areas
  FOR DELETE TO authenticated
  USING (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "provider_service_areas_service_all" ON public.provider_service_areas;
CREATE POLICY "provider_service_areas_service_all" ON public.provider_service_areas
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.providers IS 'Immigration service providers (agents, lawyers) who can be hired by applicants.';
COMMENT ON TABLE public.provider_credentials IS 'Licenses, certifications, and credentials for providers.';
COMMENT ON TABLE public.provider_service_areas IS 'Countries and visa types a provider covers.';
