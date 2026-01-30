-- Create storage bucket for checklist documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'checklist-documents',
  'checklist-documents',
  false,
  10485760, -- 10MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for checklist documents
-- Users can upload files to their own checklist items
CREATE POLICY "Users can upload files to their own checklist items"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'checklist-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view files from their own checklist items
CREATE POLICY "Users can view their own checklist files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'checklist-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'checklist-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
