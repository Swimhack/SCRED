-- Add INSERT policy for profiles to allow user registration
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Update the handle_new_user function to work with the roles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Insert profile with default user role (id: 1)
  INSERT INTO public.profiles (id, first_name, last_name, role_id)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name', 
    NEW.raw_user_meta_data ->> 'last_name',
    1
  );
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();