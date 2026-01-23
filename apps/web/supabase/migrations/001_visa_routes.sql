-- Migration: Cascading Dropdown Support (visa_routes)
-- Maps origin_country + destination_country -> available visa_types
-- Reuses existing `countries` and `visa_types` tables.

CREATE TABLE IF NOT EXISTS public.visa_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_country_id uuid NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  destination_country_id uuid NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  visa_type_id uuid NOT NULL REFERENCES public.visa_types(id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Unique constraint: one route per origin+destination+visa_type combo
ALTER TABLE public.visa_routes
  DROP CONSTRAINT IF EXISTS uq_visa_routes_origin_dest_type;
ALTER TABLE public.visa_routes
  ADD CONSTRAINT uq_visa_routes_origin_dest_type
  UNIQUE (origin_country_id, destination_country_id, visa_type_id);

-- Index for querying available visa types by origin+destination
CREATE INDEX IF NOT EXISTS idx_visa_routes_origin_dest
  ON public.visa_routes (origin_country_id, destination_country_id)
  WHERE is_active = true;

-- Index for destination lookups (useful when origin is selected first)
CREATE INDEX IF NOT EXISTS idx_visa_routes_dest
  ON public.visa_routes (destination_country_id)
  WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.visa_routes ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can browse visa routes)
DROP POLICY IF EXISTS "visa_routes_public_read" ON public.visa_routes;
CREATE POLICY "visa_routes_public_read" ON public.visa_routes
  FOR SELECT USING (true);

COMMENT ON TABLE public.visa_routes IS 'Maps origin+destination country pairs to available visa types for cascading dropdown filtering.';
