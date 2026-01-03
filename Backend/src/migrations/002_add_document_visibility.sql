-- Add visibility column to documents table
ALTER TABLE documents 
ADD COLUMN visibility JSONB DEFAULT '["hr", "admin"]'::jsonb;

-- Update existing documents to have default visibility
UPDATE documents 
SET visibility = '["hr", "admin"]'::jsonb 
WHERE visibility IS NULL;

