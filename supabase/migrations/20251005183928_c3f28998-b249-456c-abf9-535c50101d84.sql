-- Fix user_entity_permissions RLS policies to prevent global owners from viewing all permissions
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Owners can manage permissions" ON public.user_entity_permissions;
DROP POLICY IF EXISTS "Owners can view all permissions" ON public.user_entity_permissions;

-- Create new restrictive policies that only allow entity owners to manage their own entity permissions
CREATE POLICY "Entity owners can manage permissions"
ON public.user_entity_permissions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.entities
    WHERE entities.id = user_entity_permissions.entity_id 
    AND entities.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.entities
    WHERE entities.id = user_entity_permissions.entity_id 
    AND entities.owner_id = auth.uid()
  )
);

-- Create separate SELECT policy for entity owners
CREATE POLICY "Entity owners can view permissions"
ON public.user_entity_permissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.entities
    WHERE entities.id = user_entity_permissions.entity_id 
    AND entities.owner_id = auth.uid()
  )
);