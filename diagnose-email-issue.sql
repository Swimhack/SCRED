-- Diagnose why emails are not being sent
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/sql/new

-- Check the most recent submissions to see email status and errors
SELECT 
  id,
  name,
  email,
  source,
  email_sent,
  email_sent_at,
  email_error,
  created_at
FROM contact_submissions
ORDER BY created_at DESC
LIMIT 10;

-- Check if RESEND_API_KEY exists in vault
SELECT 
  name, 
  created_at,
  updated_at
FROM vault.secrets 
WHERE name = 'RESEND_API_KEY';



