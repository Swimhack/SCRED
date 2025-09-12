-- Check if contact_submissions table exists
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'contact_submissions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there are any existing contact submissions
SELECT COUNT(*) as total_submissions FROM public.contact_submissions;

-- Check user roles to verify permissions
SELECT 
  u.id,
  u.email,
  r.name as role_name
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.roles r ON ur.role_id = r.id
LIMIT 5;