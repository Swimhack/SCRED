-- Check email sending status for recent submissions
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/sql/new

-- Check the most recent test submission
SELECT 
  id,
  name,
  email,
  email_sent,
  email_sent_at,
  email_error,
  created_at
FROM contact_submissions
WHERE id = '95e00e9c-7cdd-4d1f-8496-64b84342c1cc';

-- Check all recent submissions to see email status
SELECT 
  id,
  name,
  email,
  email_sent,
  email_sent_at,
  SUBSTRING(email_error, 1, 100) as error_preview,
  created_at
FROM contact_submissions
ORDER BY created_at DESC
LIMIT 10;

-- Check if RESEND_API_KEY exists in Edge Function Secrets
-- (This query might not work depending on permissions)
SELECT 
  name, 
  created_at
FROM vault.secrets 
WHERE name = 'RESEND_API_KEY';