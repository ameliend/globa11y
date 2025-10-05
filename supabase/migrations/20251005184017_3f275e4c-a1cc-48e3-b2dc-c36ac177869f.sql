-- Fix user_entity_permissions RLS policies to prevent global owners from viewing all permissions
-- Drop all existing policies on the table
DROP POLICY IF EXISTS "Owners can manage permissions" ON public.user_entity_permissions CASCADE;
DROP POLICY IF EXISTS "Owners can view all permissions" ON public.user_entity_permissions CASCADE;
DROP POLICY IF EXISTS "Entity owners can manage permissions" ON public.user_entity_permissions CASCADE;
DROP POLICY IF EXISTS "Entity owners can view permissions" ON public.user_entity_permissions CASCADE;

-- Create new restrictive policy that only allows entity owners to manage their own entity permissions
CREATE POLICY "Entity owners manage their entity permissions"
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
CREATE POLICY "Entity owners view their entity permissions"
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