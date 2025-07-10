-- Security Fix: Prevent users from updating their own role_id
-- This fixes the critical privilege escalation vulnerability

-- Drop the existing policy that allows users to update their entire profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create a new policy that allows users to update their profile but NOT their role_id
CREATE POLICY "Users can update own profile (excluding role)" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- Ensure role_id is not being changed (must match existing value)
  role_id = (SELECT role_id FROM public.profiles WHERE id = auth.uid())
);

-- Create a separate policy specifically for super admins to change roles
CREATE POLICY "Super admins can update all profile fields including roles" 
ON public.profiles 
FOR UPDATE 
USING (get_current_user_role_id() = 4)
WITH CHECK (get_current_user_role_id() = 4);

-- Add audit logging trigger for role changes
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log role changes specifically
  IF OLD.role_id != NEW.role_id THEN
    INSERT INTO public.user_activity_logs (
      user_id,
      action,
      details,
      performed_by
    ) VALUES (
      NEW.id,
      'role_change_attempt',
      jsonb_build_object(
        'old_role_id', OLD.role_id,
        'new_role_id', NEW.role_id,
        'timestamp', now()
      ),
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for profile audit logging
DROP TRIGGER IF EXISTS audit_profile_changes_trigger ON public.profiles;
CREATE TRIGGER audit_profile_changes_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_changes();