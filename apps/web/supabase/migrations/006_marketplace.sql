-- Migration: Marketplace - Public provider read + Reviews table
-- Allows applicants to browse verified providers and leave reviews.

-- 1) Public read access for verified providers
DROP POLICY IF EXISTS "providers_public_read" ON public.providers;
CREATE POLICY "providers_public_read" ON public.providers
  FOR SELECT TO anon, authenticated
  USING (status = 'verified');

-- Public read for service areas of verified providers
DROP POLICY IF EXISTS "provider_service_areas_public_read" ON public.provider_service_areas;
CREATE POLICY "provider_service_areas_public_read" ON public.provider_service_areas
  FOR SELECT TO anon, authenticated
  USING (
    is_active = true
    AND provider_id IN (SELECT id FROM public.providers WHERE status = 'verified')
  );

-- Public read for credentials of verified providers
DROP POLICY IF EXISTS "provider_credentials_public_read" ON public.provider_credentials;
CREATE POLICY "provider_credentials_public_read" ON public.provider_credentials
  FOR SELECT TO anon, authenticated
  USING (
    provider_id IN (SELECT id FROM public.providers WHERE status = 'verified')
  );

-- 2) Provider reviews table
CREATE TABLE IF NOT EXISTS public.provider_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- One review per user per provider
ALTER TABLE public.provider_reviews
  DROP CONSTRAINT IF EXISTS uq_provider_reviews_user_provider;
ALTER TABLE public.provider_reviews
  ADD CONSTRAINT uq_provider_reviews_user_provider
  UNIQUE (provider_id, reviewer_id);

CREATE INDEX IF NOT EXISTS idx_provider_reviews_provider
  ON public.provider_reviews (provider_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_provider_reviews_reviewer
  ON public.provider_reviews (reviewer_id);

-- Enable RLS
ALTER TABLE public.provider_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
DROP POLICY IF EXISTS "provider_reviews_public_read" ON public.provider_reviews;
CREATE POLICY "provider_reviews_public_read" ON public.provider_reviews
  FOR SELECT TO anon, authenticated
  USING (true);

-- Authenticated users can insert their own reviews
DROP POLICY IF EXISTS "provider_reviews_auth_insert" ON public.provider_reviews;
CREATE POLICY "provider_reviews_auth_insert" ON public.provider_reviews
  FOR INSERT TO authenticated
  WITH CHECK (reviewer_id = auth.uid());

-- Users can update their own reviews
DROP POLICY IF EXISTS "provider_reviews_auth_update" ON public.provider_reviews;
CREATE POLICY "provider_reviews_auth_update" ON public.provider_reviews
  FOR UPDATE TO authenticated
  USING (reviewer_id = auth.uid())
  WITH CHECK (reviewer_id = auth.uid());

-- Users can delete their own reviews
DROP POLICY IF EXISTS "provider_reviews_auth_delete" ON public.provider_reviews;
CREATE POLICY "provider_reviews_auth_delete" ON public.provider_reviews
  FOR DELETE TO authenticated
  USING (reviewer_id = auth.uid());

-- Service role full access
DROP POLICY IF EXISTS "provider_reviews_service_all" ON public.provider_reviews;
CREATE POLICY "provider_reviews_service_all" ON public.provider_reviews
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.provider_reviews IS 'Applicant reviews and ratings for providers.';
