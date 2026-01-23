-- Migration: AI Questions Logging Table
-- Stores every question asked to VysaGuard AI, with optional user/session context.

CREATE TABLE IF NOT EXISTS public.ai_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  question_text text NOT NULL,
  answer_text text,
  origin_country_id uuid REFERENCES public.countries(id) ON DELETE SET NULL,
  destination_country_id uuid REFERENCES public.countries(id) ON DELETE SET NULL,
  visa_category_id uuid REFERENCES public.visa_types(id) ON DELETE SET NULL,
  metadata jsonb
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_ai_questions_user_id
  ON public.ai_questions (user_id)
  WHERE user_id IS NOT NULL;

-- Index for session lookups (anonymous users)
CREATE INDEX IF NOT EXISTS idx_ai_questions_session_id
  ON public.ai_questions (session_id);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_ai_questions_created_at
  ON public.ai_questions (created_at DESC);

-- Enable RLS
ALTER TABLE public.ai_questions ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can insert rows with their own user_id
DROP POLICY IF EXISTS "ai_questions_auth_insert" ON public.ai_questions;
CREATE POLICY "ai_questions_auth_insert" ON public.ai_questions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Anonymous/unauthenticated can insert with null user_id
DROP POLICY IF EXISTS "ai_questions_anon_insert" ON public.ai_questions;
CREATE POLICY "ai_questions_anon_insert" ON public.ai_questions
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

-- Policy: Authenticated users can read their own rows
DROP POLICY IF EXISTS "ai_questions_auth_select" ON public.ai_questions;
CREATE POLICY "ai_questions_auth_select" ON public.ai_questions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Policy: Service role has full access (for admin/backend use)
DROP POLICY IF EXISTS "ai_questions_service_all" ON public.ai_questions;
CREATE POLICY "ai_questions_service_all" ON public.ai_questions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.ai_questions IS 'Logs all questions asked to VysaGuard AI chatbot, including context and responses.';
