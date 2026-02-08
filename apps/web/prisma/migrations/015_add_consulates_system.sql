-- Consulate & Jurisdiction System
-- Adds consulates as first-class entities with jurisdiction-based assignment.
-- All changes are additive and non-breaking.

-- ============================================================
-- 1. NEW TABLE: consulates
-- ============================================================

CREATE TABLE IF NOT EXISTS public.consulates (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  type             TEXT NOT NULL,  -- 'embassy' | 'consulate' | 'visa_application_center'
  country_id       UUID NOT NULL REFERENCES public.countries(id),
  host_country_id  UUID NOT NULL REFERENCES public.countries(id),
  city             TEXT NOT NULL,
  address          TEXT,
  phone            TEXT,
  email            TEXT,
  website_url      TEXT,
  appointment_url  TEXT,
  operating_hours  TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consulates_country_host
  ON public.consulates(country_id, host_country_id);

CREATE INDEX IF NOT EXISTS idx_consulates_host_country
  ON public.consulates(host_country_id);

CREATE INDEX IF NOT EXISTS idx_consulates_is_active
  ON public.consulates(is_active);

-- Reuse existing handle_updated_at() trigger function
CREATE TRIGGER set_consulates_updated_at
  BEFORE UPDATE ON public.consulates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 2. NEW TABLE: consulate_jurisdictions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.consulate_jurisdictions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consulate_id         UUID NOT NULL REFERENCES public.consulates(id) ON DELETE CASCADE,
  residence_country_id UUID NOT NULL REFERENCES public.countries(id),
  region_name          TEXT,            -- NULL = covers entire country
  region_code          TEXT,            -- ISO 3166-2 code (e.g., 'US-TX')
  priority             INTEGER NOT NULL DEFAULT 0,
  notes                TEXT,
  is_active            BOOLEAN NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_jurisdiction_consulate_country_region
    UNIQUE (consulate_id, residence_country_id, region_name)
);

CREATE INDEX IF NOT EXISTS idx_jurisdictions_residence_region
  ON public.consulate_jurisdictions(residence_country_id, region_name);

CREATE INDEX IF NOT EXISTS idx_jurisdictions_residence_code
  ON public.consulate_jurisdictions(residence_country_id, region_code);

-- ============================================================
-- 3. NEW TABLE: consulate_notes
-- ============================================================

CREATE TABLE IF NOT EXISTS public.consulate_notes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consulate_id   UUID NOT NULL REFERENCES public.consulates(id) ON DELETE CASCADE,
  visa_type_id   UUID REFERENCES public.visa_types(id),  -- NULL = all visa types
  note_type      TEXT NOT NULL,  -- 'additional_document' | 'special_instruction' | 'appointment_info' | 'fee_info' | 'processing_note'
  title          TEXT NOT NULL,
  content        TEXT NOT NULL,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consulate_notes_consulate_visa
  ON public.consulate_notes(consulate_id, visa_type_id);

CREATE TRIGGER set_consulate_notes_updated_at
  BEFORE UPDATE ON public.consulate_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 4. ALTER TABLE: profiles (add nationality & residence fields)
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS passport_nationality_id UUID REFERENCES public.countries(id),
  ADD COLUMN IF NOT EXISTS residence_country_id    UUID REFERENCES public.countries(id),
  ADD COLUMN IF NOT EXISTS residence_region        TEXT,
  ADD COLUMN IF NOT EXISTS residence_region_code   TEXT,
  ADD COLUMN IF NOT EXISTS residence_status        TEXT;

-- ============================================================
-- 5. ALTER TABLE: checklists (add consulate context)
-- ============================================================

ALTER TABLE public.checklists
  ADD COLUMN IF NOT EXISTS consulate_id UUID REFERENCES public.consulates(id);

-- ============================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on new tables
ALTER TABLE public.consulates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consulate_jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consulate_notes ENABLE ROW LEVEL SECURITY;

-- Consulates: readable by all authenticated users (public reference data)
CREATE POLICY "Consulates are publicly readable"
  ON public.consulates
  FOR SELECT
  TO authenticated
  USING (true);

-- Consulate jurisdictions: readable by all authenticated users
CREATE POLICY "Jurisdictions are publicly readable"
  ON public.consulate_jurisdictions
  FOR SELECT
  TO authenticated
  USING (true);

-- Consulate notes: readable by all authenticated users
CREATE POLICY "Consulate notes are publicly readable"
  ON public.consulate_notes
  FOR SELECT
  TO authenticated
  USING (true);

-- Admin-only write access (service_role bypasses RLS by default,
-- but explicit policies here for documentation clarity)
CREATE POLICY "Only admins can modify consulates"
  ON public.consulates
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only admins can modify jurisdictions"
  ON public.consulate_jurisdictions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only admins can modify consulate notes"
  ON public.consulate_notes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 7. COMMENTS
-- ============================================================

COMMENT ON TABLE public.consulates IS 'Embassies, consulates, and visa application centers';
COMMENT ON TABLE public.consulate_jurisdictions IS 'Maps residence regions to consulate jurisdiction';
COMMENT ON TABLE public.consulate_notes IS 'Consulate-specific guidance and notes';

COMMENT ON COLUMN public.consulates.country_id IS 'Destination country this consulate represents';
COMMENT ON COLUMN public.consulates.host_country_id IS 'Country where the consulate is physically located';
COMMENT ON COLUMN public.consulates.type IS 'embassy, consulate, or visa_application_center';

COMMENT ON COLUMN public.consulate_jurisdictions.region_name IS 'State/province name. NULL means covers entire country';
COMMENT ON COLUMN public.consulate_jurisdictions.region_code IS 'ISO 3166-2 subdivision code';
COMMENT ON COLUMN public.consulate_jurisdictions.priority IS 'Higher value = preferred when multiple matches';

COMMENT ON COLUMN public.consulate_notes.note_type IS 'additional_document, special_instruction, appointment_info, fee_info, or processing_note';
COMMENT ON COLUMN public.consulate_notes.visa_type_id IS 'NULL means applies to all visa types at this consulate';

COMMENT ON COLUMN public.profiles.passport_nationality_id IS 'Primary passport nationality (FK to countries)';
COMMENT ON COLUMN public.profiles.residence_country_id IS 'Current country of residence (FK to countries)';
COMMENT ON COLUMN public.profiles.residence_region IS 'State/province within residence country';
COMMENT ON COLUMN public.profiles.residence_region_code IS 'ISO 3166-2 code for residence region';
COMMENT ON COLUMN public.profiles.residence_status IS 'citizen, permanent_resident, work_visa, student_visa, dependent_visa, refugee, or other';

COMMENT ON COLUMN public.checklists.consulate_id IS 'Consulate context for this application (optional)';
