-- Add updated_at column to checklists table
-- This column tracks when a checklist was last modified

ALTER TABLE public.checklists
ADD COLUMN updated_at TIMESTAMPTZ(6) DEFAULT now();

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_checklists_updated_at
    BEFORE UPDATE ON public.checklists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON COLUMN public.checklists.updated_at IS 'Timestamp of last update to this checklist';
