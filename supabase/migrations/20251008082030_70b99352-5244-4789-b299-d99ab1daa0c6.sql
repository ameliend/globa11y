-- First, drop all existing owner-related policies on profiles and user_roles
DROP POLICY IF EXISTS "Owners can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Owners can view profiles with shared entity access" ON public.profiles;
DROP POLICY IF EXISTS "Owners can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Owners can view roles with shared entity access" ON public.user_roles;
DROP POLICY IF EXISTS "Owners can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Owners can manage roles with shared entity access" ON public.user_roles;

-- Create a security definer function to check if two users share entity access
CREATE OR REPLACE FUNCTION public.shares_entity_access(_requesting_user_id uuid, _target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Check if users share access to at least one entity
  SELECT EXISTS (
    -- Get entities the requesting user has access to (either as owner or via permissions)
    SELECT e1.id
    FROM entities e1
    WHERE e1.owner_id = _requesting_user_id
       OR EXISTS (
         SELECT 1 
         FROM user_entity_permissions uep1
         WHERE uep1.user_id = _requesting_user_id 
           AND uep1.entity_id = e1.id
       )
    
    INTERSECT
    
    -- Get entities the target user has access to
    SELECT e2.id
    FROM entities e2
    WHERE e2.owner_id = _target_user_id
       OR EXISTS (
         SELECT 1 
         FROM user_entity_permissions uep2
         WHERE uep2.user_id = _target_user_id 
           AND uep2.entity_id = e2.id
       )
  );
$$;

-- Create scoped policy for profiles (owners can only see profiles of users who share entity access)
CREATE POLICY "Owners can view profiles with shared entity access"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'owner'::public.app_role) 
  AND public.shares_entity_access(auth.uid(), id)
);

-- Create scoped policy for user_roles (owners can only see roles of users who share entity access)
CREATE POLICY "Owners can view roles with shared entity access"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'owner'::public.app_role) 
  AND public.shares_entity_access(auth.uid(), user_id)
);

-- Create scoped policy for managing roles (owners can only manage roles of users who share entity access)
CREATE POLICY "Owners can manage roles with shared entity access"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'owner'::public.app_role) 
  AND public.shares_entity_access(auth.uid(), user_id)
)
WITH CHECK (
  public.has_role(auth.uid(), 'owner'::public.app_role) 
  AND public.shares_entity_access(auth.uid(), user_id)
);