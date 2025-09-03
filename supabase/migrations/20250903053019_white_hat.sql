/*
  # Create Images Storage Bucket

  1. Storage Setup
    - Create 'images' storage bucket
    - Enable public access for uploaded images
    - Set up RLS policies for authenticated users to upload
    - Allow public read access to images

  2. Security
    - Authenticated users can upload images
    - Public read access for all images
    - Proper file type restrictions
*/

-- Create the images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the storage.objects table (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Policy to allow authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'images');

-- Policy to allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'images');

-- Policy to allow public read access to images
CREATE POLICY "Public read access for images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'images');