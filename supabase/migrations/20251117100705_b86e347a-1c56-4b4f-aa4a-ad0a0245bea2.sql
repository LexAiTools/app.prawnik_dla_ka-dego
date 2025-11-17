-- Add 'lawyer' role to the app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'lawyer';

-- Create function to automatically assign 'user' role to new registrations
CREATE OR REPLACE FUNCTION public.assign_default_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only assign 'user' role automatically for new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to assign default role on user creation
DROP TRIGGER IF EXISTS on_auth_user_created_assign_default_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_default_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_user_role();

-- Add user_id to lawyers table to link lawyers with user accounts
ALTER TABLE public.lawyers 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_lawyers_user_id ON public.lawyers(user_id);

-- Update RLS policies for lawyers table to allow lawyers to update their own profiles
CREATE POLICY "Lawyers can update their own profile" 
ON public.lawyers
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Lawyers can view their own profile" 
ON public.lawyers
FOR SELECT
USING (auth.uid() = user_id OR true); -- true because anyone can view lawyers (from existing policy)