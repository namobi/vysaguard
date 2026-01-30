-- Add RLS policies for checklists table
-- This migration adds Row Level Security policies to allow users to manage their own checklists

-- Enable RLS on checklists table (if not already enabled)
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own checklists
CREATE POLICY "Users can view their own checklists"
ON public.checklists
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can insert their own checklists
CREATE POLICY "Users can insert their own checklists"
ON public.checklists
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own checklists
CREATE POLICY "Users can update their own checklists"
ON public.checklists
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own checklists
CREATE POLICY "Users can delete their own checklists"
ON public.checklists
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add RLS policies for checklist_items table
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own checklist items
CREATE POLICY "Users can view their own checklist items"
ON public.checklist_items
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can insert their own checklist items
CREATE POLICY "Users can insert their own checklist items"
ON public.checklist_items
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own checklist items
CREATE POLICY "Users can update their own checklist items"
ON public.checklist_items
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own checklist items
CREATE POLICY "Users can delete their own checklist items"
ON public.checklist_items
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add RLS policies for checklist_uploads table
ALTER TABLE public.checklist_uploads ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own uploads
CREATE POLICY "Users can view their own uploads"
ON public.checklist_uploads
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can insert their own uploads
CREATE POLICY "Users can insert their own uploads"
ON public.checklist_uploads
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own uploads
CREATE POLICY "Users can delete their own uploads"
ON public.checklist_uploads
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
