-- Migration: Activity Log Table
-- Stores user activity events for dashboard feed and audit trail.

CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for user feed (newest first)
CREATE INDEX IF NOT EXISTS idx_activity_log_user_created
  ON public.activity_log (user_id, created_at DESC);

-- Index for entity lookups
CREATE INDEX IF NOT EXISTS idx_activity_log_entity
  ON public.activity_log (entity_type, entity_id)
  WHERE entity_type IS NOT NULL;

-- Enable RLS
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own activity
DROP POLICY IF EXISTS "activity_log_user_select" ON public.activity_log;
CREATE POLICY "activity_log_user_select" ON public.activity_log
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Policy: Users can insert their own activity
DROP POLICY IF EXISTS "activity_log_user_insert" ON public.activity_log;
CREATE POLICY "activity_log_user_insert" ON public.activity_log
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Service role has full access
DROP POLICY IF EXISTS "activity_log_service_all" ON public.activity_log;
CREATE POLICY "activity_log_service_all" ON public.activity_log
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.activity_log IS 'Stores user activity events for dashboard feed and audit trail.';
COMMENT ON COLUMN public.activity_log.action IS 'Action type (e.g. checklist_created, item_uploaded, checklist_synced)';
COMMENT ON COLUMN public.activity_log.entity_type IS 'Type of related entity (e.g. checklist, checklist_item)';
COMMENT ON COLUMN public.activity_log.entity_id IS 'UUID of the related entity';
