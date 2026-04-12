-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Policy: public read access to avatars
CREATE POLICY "Public read access to avatars"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Policy: authenticated users can upload their own avatars
CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- Policy: users can update their own avatars
CREATE POLICY "Users can update own avatars"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'avatars')
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- Policy: users can delete their own avatars
CREATE POLICY "Users can delete own avatars"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );
