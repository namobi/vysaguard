-- 007: Assistance Requests + Notifications
-- Iteration 5 of VysaGuard implementation plan

-- Request status enum
DO $$ BEGIN
  CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'declined', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Assistance Requests table
CREATE TABLE IF NOT EXISTS assistance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  checklist_id uuid REFERENCES checklists(id) ON DELETE SET NULL,
  subject text NOT NULL,
  message text,
  status request_status NOT NULL DEFAULT 'pending',
  provider_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  entity_type text,
  entity_id uuid,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assistance_requests_applicant ON assistance_requests(applicant_id);
CREATE INDEX IF NOT EXISTS idx_assistance_requests_provider ON assistance_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_assistance_requests_status ON assistance_requests(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read) WHERE read = false;

-- RLS for assistance_requests
ALTER TABLE assistance_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Applicant can view own requests" ON assistance_requests;
CREATE POLICY "Applicant can view own requests" ON assistance_requests
  FOR SELECT USING (auth.uid() = applicant_id);

DROP POLICY IF EXISTS "Provider can view requests to them" ON assistance_requests;
CREATE POLICY "Provider can view requests to them" ON assistance_requests
  FOR SELECT USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Applicant can create requests" ON assistance_requests;
CREATE POLICY "Applicant can create requests" ON assistance_requests
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);

DROP POLICY IF EXISTS "Applicant can cancel own requests" ON assistance_requests;
CREATE POLICY "Applicant can cancel own requests" ON assistance_requests
  FOR UPDATE USING (auth.uid() = applicant_id);

DROP POLICY IF EXISTS "Provider can update request status" ON assistance_requests;
CREATE POLICY "Provider can update request status" ON assistance_requests
  FOR UPDATE USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Service role full access to assistance_requests" ON assistance_requests;
CREATE POLICY "Service role full access to assistance_requests" ON assistance_requests
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access to notifications" ON notifications;
CREATE POLICY "Service role full access to notifications" ON notifications
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');
