/*
  # Add Tool Admin Fields

  1. New Columns
    - `image_alt` (text) - Descriptive alt text for tool images
    - `how_to_use` (text) - Step-by-step instructions on how to use the tool
    - `content_type` (text) - Categorize tools as "Human Created" or "AI Generated"

  2. Description
    - Enhances the tools table with additional fields needed for the admin panel
    - Provides better SEO support with image alt text
    - Allows for detailed usage instructions
    - Enables content type classification
*/

-- Add new columns to tools table
ALTER TABLE tools
ADD COLUMN IF NOT EXISTS image_alt text,
ADD COLUMN IF NOT EXISTS how_to_use text,
ADD COLUMN IF NOT EXISTS content_type text DEFAULT 'human_created';

-- Update existing tools with default values where needed
UPDATE tools 
SET 
  content_type = COALESCE(content_type, 'human_created'),
  image_alt = COALESCE(image_alt, name || ' - AI Tool'),
  how_to_use = COALESCE(how_to_use, 'Visit the tool website and follow the on-screen instructions to get started.')
WHERE content_type IS NULL OR image_alt IS NULL OR how_to_use IS NULL;