-- Add email column to profiles table to store user emails
ALTER TABLE public.profiles ADD COLUMN email TEXT;

-- Create index for email lookups
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Update the handle_new_user function to also store email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, role_id)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name', 
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email,
    1  -- Default user role
  );
  RETURN NEW;
END;
$$;