-- Manual SQL to update ajlipka@gmail.com to Super Admin
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/editor

-- Update the profile directly
UPDATE profiles
SET 
  role_id = 4,  -- Super admin role
  email = 'ajlipka@gmail.com'
WHERE id = 'f78c19be-a01d-4362-a1f3-17532460fcfb';

-- Verify the update
SELECT 
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.role_id,
  r.name as role_name
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
WHERE p.id = 'f78c19be-a01d-4362-a1f3-17532460fcfb';
