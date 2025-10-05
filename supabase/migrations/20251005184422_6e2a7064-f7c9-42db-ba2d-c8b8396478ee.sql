-- Add RLS policy to allow users to view their own entity permissions
CREATE POLICY "Users can view their own entity permissions"
ON public.user_entity_permissions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);