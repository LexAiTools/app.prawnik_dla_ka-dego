-- Add RLS policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Add 'user' role for corbally.concepts@gmail.com
-- This user was registered before the trigger was created
INSERT INTO public.user_roles (user_id, role)
VALUES ('68f9e11b-f2b1-4e34-94be-1ba97869d63a', 'user')
ON CONFLICT (user_id, role) DO NOTHING;