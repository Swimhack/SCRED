-- Fix infinite recursion in profiles RLS policies by creating a security definer function

-- Create a security definer function to get current user's role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role_id()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT role_id FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop the problematic policies
DROP POLICY IF EXISTS "Super admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update roles" ON public.profiles;

-- Recreate the policies using the security definer function
CREATE POLICY "Super admins can read all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_current_user_role_id() = 4);

CREATE POLICY "Super admins can update roles" 
ON public.profiles 
FOR UPDATE 
USING (public.get_current_user_role_id() = 4)
WITH CHECK (public.get_current_user_role_id() = 4);