-- Add completed_at column to checklists table for soft deletion
-- This column tracks when a checklist was marked as completed

ALTER TABLE public.checklists
ADD COLUMN completed_at TIMESTAMPTZ(6);

-- Add comment
COMMENT ON COLUMN public.checklists.completed_at IS 'Timestamp when checklist was marked as completed (soft delete)';

-- Drop old unique constraints that prevent creating new checklists after completion
ALTER TABLE public.checklists DROP CONSTRAINT IF EXISTS checklists_user_country_visa_uidx;
ALTER TABLE public.checklists DROP CONSTRAINT IF EXISTS checklists_user_country_visa_uniq;
ALTER TABLE public.checklists DROP CONSTRAINT IF EXISTS checklists_user_country_visa_unique;
ALTER TABLE public.checklists DROP CONSTRAINT IF EXISTS uq_checklists_user_country_visa_text;
ALTER TABLE public.checklists DROP CONSTRAINT IF EXISTS checklists_country_visa_unique;

-- Create a partial unique index that only applies to active (non-completed) checklists
-- This allows multiple completed checklists for the same user/country/visa combination
-- but ensures only one active checklist exists at a time
CREATE UNIQUE INDEX checklists_user_country_visa_active_unique
ON public.checklists (user_id, country, visa)
WHERE completed_at IS NULL;
