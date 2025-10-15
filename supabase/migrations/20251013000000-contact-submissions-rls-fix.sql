-- Allow public inserts for contact form submissions
-- This is needed because the Edge Function needs to insert records on behalf of anonymous users
-- The RLS policy will allow INSERT but not SELECT/UPDATE/DELETE for anonymous users

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Admins can manage all contact submissions" ON public.contact_submissions;

-- Create separate policies for better security
-- 1. Allow anyone (including Edge Functions with service role) to insert
CREATE POLICY "Allow service role to insert contact submissions"
ON public.contact_submissions
FOR INSERT
TO service_role
WITH CHECK (true);

-- 2. Allow admins to view all submissions
CREATE POLICY "Admins can view all contact submissions"
ON public.contact_submissions
FOR SELECT
USING (get_current_user_role_id() IN (2, 3, 4));

-- 3. Allow admins to update submissions
CREATE POLICY "Admins can update contact submissions"
ON public.contact_submissions
FOR UPDATE
USING (get_current_user_role_id() IN (2, 3, 4))
WITH CHECK (get_current_user_role_id() IN (2, 3, 4));

-- 4. Allow admins to delete submissions
CREATE POLICY "Admins can delete contact submissions"
ON public.contact_submissions
FOR DELETE
USING (get_current_user_role_id() IN (2, 3, 4));
