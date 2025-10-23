-- Update the valid_source constraint to include 'test-script'
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/sql/new

-- Drop the existing constraint
ALTER TABLE public.contact_submissions 
DROP CONSTRAINT IF EXISTS valid_source;

-- Add the updated constraint with all valid sources
ALTER TABLE public.contact_submissions 
ADD CONSTRAINT valid_source 
CHECK (source IN ('website', 'api', 'import', 'investor-homepage', 'test-script', 'contact-page'));

-- Verify the change
SELECT 'Constraint updated successfully!' as message;

-- Test by checking the constraint
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'contact_submissions' 
  AND con.conname = 'valid_source';



