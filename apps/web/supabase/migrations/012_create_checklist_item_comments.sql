-- Create table for checklist item comments
CREATE TABLE IF NOT EXISTS public.checklist_item_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_item_id UUID NOT NULL REFERENCES public.checklist_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ(6) DEFAULT now(),
  updated_at TIMESTAMPTZ(6) DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_checklist_item_comments_item_id ON public.checklist_item_comments(checklist_item_id);
CREATE INDEX idx_checklist_item_comments_user_id ON public.checklist_item_comments(user_id);
CREATE INDEX idx_checklist_item_comments_created_at ON public.checklist_item_comments(created_at DESC);

-- Enable RLS
ALTER TABLE public.checklist_item_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view comments on their own checklist items
CREATE POLICY "Users can view comments on their own checklist items"
ON public.checklist_item_comments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.checklist_items ci
    WHERE ci.id = checklist_item_comments.checklist_item_id
    AND ci.user_id = auth.uid()
  )
);

-- Users can insert comments on their own checklist items
CREATE POLICY "Users can insert comments on their own checklist items"
ON public.checklist_item_comments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.checklist_items ci
    WHERE ci.id = checklist_item_id
    AND ci.user_id = auth.uid()
  )
);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
ON public.checklist_item_comments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
ON public.checklist_item_comments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE public.checklist_item_comments IS 'Comments on checklist items';
COMMENT ON COLUMN public.checklist_item_comments.checklist_item_id IS 'The checklist item this comment belongs to';
COMMENT ON COLUMN public.checklist_item_comments.comment_text IS 'The comment text';
