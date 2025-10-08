-- Add policy for owners to view all profiles (needed for user management)
CREATE POLICY "Owners can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'owner'::public.app_role));