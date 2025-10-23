-- Verify Resend API Key is set in Supabase Vault
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/sql/new

-- Check if RESEND_API_KEY exists in vault
SELECT 
  name, 
  created_at,
  updated_at
FROM vault.secrets 
WHERE name = 'RESEND_API_KEY';

-- If no rows returned, the API key is NOT set!
-- You need to add it in the Supabase Vault

-- Also check recent contact submissions and their email status
SELECT 
  id,
  name,
  email,
  email_sent,
  email_sent_at,
  email_error,
  created_at
FROM contact_submissions
ORDER BY created_at DESC
LIMIT 5;



